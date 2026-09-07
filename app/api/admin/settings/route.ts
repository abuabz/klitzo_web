import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Setting from "@/models/Setting";
import User from "@/models/User";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get("adminEmail");

    if (!email) {
      return NextResponse.json({ error: "Admin email is required" }, { status: 400 });
    }

    await connectDB();
    const user = await User.findOne({ email });
    if (!user || !user.isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // We only have one settings document
    let settings = await Setting.findOne();
    if (!settings) {
      settings = await Setting.create({
        fromName: "Klitzo",
        fromAddress: "Default Address",
        fromMobile: "0000000000",
        customerId: "DEFAULT_CUST",
        contractId: "DEFAULT_CONT"
      });
    }

    return NextResponse.json(settings);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    const { adminEmail, ...settingsData } = data;

    if (!adminEmail) {
      return NextResponse.json({ error: "Admin email is required" }, { status: 400 });
    }

    await connectDB();
    const user = await User.findOne({ email: adminEmail });
    if (!user || !user.isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    let settings = await Setting.findOne();
    if (settings) {
      settings = await Setting.findByIdAndUpdate(settings._id, settingsData, { new: true });
    } else {
      settings = await Setting.create(settingsData);
    }

    return NextResponse.json({ message: "Settings saved successfully", settings });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
