import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import User from "@/models/User";
import bcrypt from "bcryptjs";

export async function GET(req: NextRequest) {
  try {
    await connectDB();

    const adminEmail = process.env.ADMIN_EMAIL;
    const adminPassword = process.env.ADMIN_PASSWORD;

    if (!adminEmail || !adminPassword) {
      return NextResponse.json({ error: "Admin credentials not configured in environment" }, { status: 500 });
    }

    // Check if admin already exists
    let admin = await User.findOne({ email: adminEmail });

    // Create admin user
    const hashedPassword = await bcrypt.hash(adminPassword, 12);

    if (admin) {
      // Ensure it has isAdmin: true and the latest password from .env
      await User.findOneAndUpdate(
        { email: adminEmail },
        { isAdmin: true, password: hashedPassword }
      );
      return NextResponse.json({ message: "Admin user updated with latest password" });
    }

    // Create admin user
    
    await User.create({
      username: "AdminKlitzo",
      email: adminEmail,
      mobile: "8111813853", // Using the contact number from project
      password: hashedPassword,
      isAdmin: true,
    });

    return NextResponse.json({ message: "Admin user created successfully" });
  } catch (error: any) {
    console.error("Seed admin error:", error);
    return NextResponse.json({ error: error.message || "Something went wrong" }, { status: 500 });
  }
}
