import { NextRequest, NextResponse } from "next/server";
import { StandardCheckoutClient, StandardCheckoutPayRequest, Env } from "@phonepe-pg/pg-sdk-node";
import connectDB from "@/lib/db";
import Order from "@/models/Order";
import User from "@/models/User";

export async function POST(req: NextRequest) {
  try {
    const data = await req.json();
    await connectDB();

    let userId = null;
    if (data.user && data.user.email) {
      const user = await User.findOne({ email: data.user.email });
      if (user) userId = user._id;
    }

    // Generate a unique transaction ID
    const transactionId = `T${Date.now()}`;

    // Create the order in "pending" status
    const order = await Order.create({
      userId,
      userEmail: data.user?.email,
      userMobile: data.user?.mobile || data.shippingAddress?.phone,
      userName: data.user?.username || data.shippingAddress?.name,
      productId: data.productId,
      productName: data.productName,
      productImage: data.productImage,
      amount: data.amount,
      quantity: data.quantity,
      status: "pending", // Payment pending
      shippingAddress: data.shippingAddress,
      notes: data.notes,
      razorpayOrderId: transactionId // Repurposing this field to store PhonePe transactionId
    });

    const clientId = process.env.PHONEPE_CLIENT_ID;
    const clientSecret = process.env.PHONEPE_CLIENT_SECRET;
    const clientVersion = parseInt(process.env.PHONEPE_CLIENT_VERSION || '1');
    const envStr = process.env.PHONEPE_ENV || 'UAT';
    const env = envStr === 'PROD' ? Env.PRODUCTION : Env.SANDBOX;
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

    if (!clientId || !clientSecret) {
      return NextResponse.json({ success: false, error: "PhonePe credentials not configured" }, { status: 500 });
    }

    const client = StandardCheckoutClient.getInstance(clientId, clientSecret, clientVersion, env);

    const amountInPaise = Math.round(data.amount * 100);
    const redirectUrl = `${baseUrl}/api/phonepe/redirect?transactionId=${transactionId}`;

    const payRequest = StandardCheckoutPayRequest.builder()
        .merchantOrderId(transactionId)
        .amount(amountInPaise)
        .redirectUrl(redirectUrl)
        .message(`Payment for ${data.productName || 'Order'}`)
        .build();

    const response = await client.pay(payRequest);

    if (response && response.redirectUrl) {
      return NextResponse.json({ 
        success: true, 
        url: response.redirectUrl,
        orderId: order._id 
      });
    } else {
      console.error("PhonePe Initiation Error:", response);
      return NextResponse.json({ success: false, error: "Failed to initiate payment" }, { status: 400 });
    }
  } catch (error: any) {
    console.error("Error initiating PhonePe:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
