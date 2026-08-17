import { NextRequest, NextResponse } from "next/server";
import { OAuth2Client } from "google-auth-library";
import connectDB from "@/lib/db";
import User from "@/models/User";

const client = new OAuth2Client(process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID);

export async function POST(req: NextRequest) {
  try {
    const { credential } = await req.json();

    if (!credential) {
      return NextResponse.json({ error: "Missing credential" }, { status: 400 });
    }

    // Verify the Google token
    const ticket = await client.verifyIdToken({
      idToken: credential,
      audience: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();

    if (!payload || !payload.email) {
      return NextResponse.json({ error: "Invalid Google token payload" }, { status: 400 });
    }

    const { email, name, sub: googleId } = payload;

    await connectDB();

    // Check if user already exists
    let user = await User.findOne({ email });

    if (!user) {
      // User doesn't exist, create a new one
      user = await User.create({
        username: name || `user_${googleId.substring(0, 8)}`,
        email,
        authProvider: "google",
      });
    }

    // Return the user object in the same format as /api/auth/login
    return NextResponse.json(
      {
        message: "Google login successful",
        user: {
          username: user.username,
          email: user.email,
          mobile: user.mobile || null,
          isAdmin: user.isAdmin || false,
        },
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Google Auth error:", error);
    return NextResponse.json({ error: error.message || "Something went wrong" }, { status: 500 });
  }
}
