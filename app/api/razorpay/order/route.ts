import { NextRequest, NextResponse } from 'next/server';
import Razorpay from 'razorpay';

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

export async function POST(request: NextRequest) {
  try {
    const { amount, currency = 'INR', receipt } = await request.json();

    if (amount === undefined || amount === null || amount < 1) {
      console.error('Invalid amount received:', amount);
      return NextResponse.json(
        { error: 'Invalid amount. Minimum amount is ₹1.' },
        { status: 400 }
      );
    }

    console.log('Creating Razorpay order for amount:', amount);
    const options = {
      amount: Math.round(amount * 100), // amount in the smallest currency unit (paise for INR)
      currency,
      receipt: receipt || `receipt_${Date.now()}`,
    };

    const order = await razorpay.orders.create(options);
    console.log('Razorpay order created successfully:', order.id);

    return NextResponse.json(order);
  } catch (error: any) {
    console.error('FULL Error creating Razorpay order:', error);
    // Log the actual error object to see details from Razorpay SDK
    if (error.error) console.error('Razorpay SDK Error Detail:', error.error);
    return NextResponse.json(
      { error: error.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}
