import { NextRequest, NextResponse } from "next/server";
import { StandardCheckoutClient, Env } from "@phonepe-pg/pg-sdk-node";
import connectDB from "@/lib/db";
import Order from "@/models/Order";

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const transactionId = searchParams.get("transactionId");

    const clientId = process.env.PHONEPE_CLIENT_ID;
    const clientSecret = process.env.PHONEPE_CLIENT_SECRET;
    const clientVersion = parseInt(process.env.PHONEPE_CLIENT_VERSION || '1');
    const envStr = process.env.PHONEPE_ENV || 'UAT';
    const env = envStr === 'PROD' ? Env.PRODUCTION : Env.SANDBOX;
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

    if (!clientId || !clientSecret || !transactionId) {
      return NextResponse.redirect(`${baseUrl}/?error=Invalid_Request`, 303);
    }

    const client = StandardCheckoutClient.getInstance(clientId, clientSecret, clientVersion, env);
    
    // Verify payment status with SDK
    const response = await client.getOrderStatus(transactionId);

    if (response.state === 'COMPLETED') {
      await connectDB();
      // Update order status to Paid
      const order = await Order.findOneAndUpdate(
        { razorpayOrderId: transactionId },
        { status: "Paid", razorpayPaymentId: response.providerReferenceId || "PhonePe" },
        { new: true }
      );
      
      // Redirect to success page
      return NextResponse.redirect(`${baseUrl}/payment-success${order ? `?orderId=${order._id}` : ''}`, 303);
    } else {
      // Payment Failed or Pending
      return NextResponse.redirect(`${baseUrl}/?error=Payment_Failed`, 303);
    }
  } catch (error: any) {
    console.error("Error in PhonePe redirect:", error);
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    return NextResponse.redirect(`${baseUrl}/?error=Server_Error`, 303);
  }
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const transactionId = formData.get("transactionId") as string;
    // PhonePe V1 sends POST form data. PhonePe V2 might send GET redirects depending on config,
    // but if it's POST, we handle it the exact same way as GET.
    
    // We just reconstruct a GET redirect to our own GET handler with the transactionId
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    return NextResponse.redirect(`${baseUrl}/api/phonepe/redirect?transactionId=${transactionId}`, 303);
  } catch (error: any) {
    console.error("Error in PhonePe POST redirect:", error);
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    return NextResponse.redirect(`${baseUrl}/?error=Server_Error`, 303);
  }
}
