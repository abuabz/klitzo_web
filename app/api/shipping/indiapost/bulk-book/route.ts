// app/api/shipping/indiapost/bulk-book/route.ts
import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Order from "@/models/Order";
import Setting from "@/models/Setting";
import User from "@/models/User";
import { bookConsignmentsWithIndiaPost } from "@/lib/indiapost";

export async function POST(request: NextRequest) {
  try {
    const { orderIds, adminEmail, serviceType = "SPEEDPOST", weightInGrams = 250 } = await request.json();

    if (!Array.isArray(orderIds) || orderIds.length === 0) {
      return NextResponse.json({ error: "No orders selected for booking" }, { status: 400 });
    }

    if (!adminEmail) {
      return NextResponse.json({ error: "Admin email is required" }, { status: 400 });
    }

    await connectDB();

    // Verify admin
    const user = await User.findOne({ email: adminEmail });
    if (!user || !user.isAdmin) {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 403 });
    }

    // Fetch orders
    const orders = await Order.find({ _id: { $in: orderIds } });
    if (!orders || orders.length === 0) {
      return NextResponse.json({ error: "No matching orders found" }, { status: 404 });
    }

    // Fetch settings for sender info
    const settings = await Setting.findOne();

    // Call India Post booking service
    const bookingResponse = await bookConsignmentsWithIndiaPost(orders, {
      serviceType,
      weightInGrams: Number(weightInGrams) || 250,
      senderSettings: {
        fromName: settings?.fromName || "Klitzo",
        fromAddress: settings?.fromAddress || "Vengara, Malappuram",
        fromMobile: settings?.fromMobile || "9876543210",
        pincode: "676304",
      },
    });

    let updatedCount = 0;
    const updatedDetails: Array<{ orderId: string; articleNumber: string }> = [];

    // Update orders in DB with assigned article numbers
    for (const resItem of bookingResponse.results) {
      if (resItem.status === "SUCCESS" && resItem.articleNumber) {
        await Order.findByIdAndUpdate(resItem.orderId, {
          $set: {
            trackingId: resItem.articleNumber,
            status: "shipping",
            isPrinted: true,
          },
        });
        updatedCount++;
        updatedDetails.push({
          orderId: resItem.orderId,
          articleNumber: resItem.articleNumber,
        });
      }
    }

    return NextResponse.json({
      success: true,
      count: updatedCount,
      totalRequested: orderIds.length,
      source: bookingResponse.source,
      errorNotice: bookingResponse.error || null,
      results: updatedDetails,
    });
  } catch (error: any) {
    console.error("India Post Bulk Booking API Error:", error);
    return NextResponse.json({ error: error.message || "Failed to process bulk booking" }, { status: 500 });
  }
}
