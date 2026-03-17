import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import User from "@/models/User";
import bcrypt from "bcryptjs";

export async function POST(req: NextRequest) {
  try {
    const { username, email, mobile, password } = await req.json();

    if (!username || !email || !mobile || !password) {
      return NextResponse.json({ error: "All fields are required" }, { status: 400 });
    }

    await connectDB();

    // Check if user already exists
    const existingUser = await User.findOne({
      $or: [{ email }, { mobile }, { username }],
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "User with this email, mobile, or username already exists" },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user
    const newUser = await User.create({
      username,
      email,
      mobile,
      password: hashedPassword,
    });

    return NextResponse.json(
      { 
        message: "User registered successfully", 
        user: { 
          username: newUser.username, 
          email: newUser.email, 
          mobile: newUser.mobile 
        } 
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Registration error:", error);
    return NextResponse.json({ error: error.message || "Something went wrong" }, { status: 500 });
  }
}
