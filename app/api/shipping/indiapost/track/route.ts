// app/api/shipping/indiapost/track/route.ts
import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Order from "@/models/Order";
import { trackIndiaPostArticle } from "@/lib/indiapost";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const articleNumber = searchParams.get("articleNumber");
    const orderId = searchParams.get("orderId");

    if (!articleNumber && !orderId) {
      return NextResponse.json({ error: "Article number or Order ID is required" }, { status: 400 });
    }

    await connectDB();

    let order = null;
    if (orderId) {
      order = await Order.findById(orderId);
    } else if (articleNumber) {
      order = await Order.findOne({ trackingId: articleNumber });
    }

    const effectiveArticleNumber = articleNumber || order?.trackingId;
    if (!effectiveArticleNumber) {
      return NextResponse.json({ error: "No tracking number associated with this order" }, { status: 404 });
    }

    const trackingResult = await trackIndiaPostArticle(effectiveArticleNumber, order ? {
      createdAt: order.createdAt,
      shippingAddress: order.shippingAddress,
      status: order.status,
    } : undefined);

    return NextResponse.json({
      success: true,
      tracking: trackingResult,
    });
  } catch (error: any) {
    console.error("India Post Tracking Route Error:", error);
    return NextResponse.json({ error: error.message || "Failed to fetch postal tracking" }, { status: 500 });
  }
}
