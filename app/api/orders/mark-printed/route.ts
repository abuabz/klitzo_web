import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Order from "@/models/Order";
import User from "@/models/User";

export async function POST(request: NextRequest) {
  try {
    const { orderIds, adminEmail } = await request.json();

    if (!adminEmail || !Array.isArray(orderIds) || orderIds.length === 0) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    await connectDB();

    // Verify admin
    const user = await User.findOne({ email: adminEmail });
    if (!user || !user.isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const result = await Order.updateMany(
      { _id: { $in: orderIds } },
      { $set: { isPrinted: true } }
    );

    return NextResponse.json({ message: "Orders marked as printed", modifiedCount: result.modifiedCount });
  } catch (error: any) {
    console.error("Error marking orders as printed:", error);
    return NextResponse.json(
      { error: error.message || "Something went wrong" },
      { status: 500 }
    );
  }
}
