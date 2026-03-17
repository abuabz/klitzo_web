import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import connectDB from "@/lib/db";
import User from "@/models/User";
import Order from "@/models/Order";

export async function POST(request: NextRequest) {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, orderDetails } =
      await request.json();

    const body = razorpay_order_id + '|' + razorpay_payment_id;

    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET!)
      .update(body.toString())
      .digest('hex');

    const isAuthentic = expectedSignature === razorpay_signature;

    if (isAuthentic) {
      
      if (orderDetails) {
        await connectDB();
        
        // Find user if email is provided
        let userId = null;
        if (orderDetails.user && orderDetails.user.email) {
          const user = await User.findOne({ email: orderDetails.user.email });
          if (user) userId = user._id;
        }

        console.log("Creating order with details:", {
          productName: orderDetails.productName,
          productImage: orderDetails.productImage,
          amount: orderDetails.amount,
        });

        await Order.create({
          userId,
          userEmail: orderDetails.user?.email,
          userMobile: orderDetails.user?.mobile,
          userName: orderDetails.user?.username,
          productId: orderDetails.productId,
          productName: orderDetails.productName,
          productImage: orderDetails.productImage,
          amount: orderDetails.amount,
          quantity: orderDetails.quantity,
          status: "paid",
          razorpayOrderId: razorpay_order_id,
          razorpayPaymentId: razorpay_payment_id,
          shippingAddress: orderDetails.shippingAddress,
        });
      }

      return NextResponse.json(
        { message: 'Payment verified successfully', success: true },
        { status: 200 }
      );
    } else {
      return NextResponse.json(
        { message: 'Payment verification failed', success: false },
        { status: 400 }
      );
    }
  } catch (error: any) {
    console.error('Error verifying payment:', error);
    return NextResponse.json(
      { error: error.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}
