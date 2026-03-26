import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import User from "@/models/User";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const adminEmail = searchParams.get("adminEmail");

    if (!adminEmail) {
      return NextResponse.json({ error: "Admin email is required" }, { status: 400 });
    }

    await connectDB();
    const admin = await User.findOne({ email: adminEmail });

    if (!admin || !admin.isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // Fetch all users except passwords
    const users = await User.find({}, "-password").sort({ createdAt: -1 });
    return NextResponse.json(users);
  } catch (error: any) {
    console.error("Error fetching users:", error);
    return NextResponse.json(
      { error: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}
