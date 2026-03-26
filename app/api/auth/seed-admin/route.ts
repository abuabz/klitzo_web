import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import User from "@/models/User";
import bcrypt from "bcryptjs";

export async function GET(req: NextRequest) {
  try {
    await connectDB();

    const adminEmail = "adminklitzo@gmail.com";
    const adminPassword = "Klitzo@789";

    // Check if admin already exists
    let admin = await User.findOne({ email: adminEmail });

    if (admin) {
      // Ensure it has isAdmin: true
      await User.findOneAndUpdate({ email: adminEmail }, { isAdmin: true });
      return NextResponse.json({ message: "Admin user updated/verified" });
    }

    // Create admin user
    const hashedPassword = await bcrypt.hash(adminPassword, 12);
    
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
