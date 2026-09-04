import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Order from "@/models/Order";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get("email");
    const id = searchParams.get("id");
    const all = searchParams.get("all");

    await connectDB();

    if (id) {
      const order = await Order.findById(id);
      if (!order) return NextResponse.json({ error: "Order not found" }, { status: 404 });
      return NextResponse.json(order);
    }

    // Admin can fetch all orders
    if (all === "true" && email) {
      const user = await User.findOne({ email });
      if (user && user.isAdmin) {
        const orders = await Order.find({}).sort({ createdAt: -1 });
        return NextResponse.json(orders);
      }
    }

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    const orders = await Order.find({ userEmail: email }).sort({ createdAt: -1 });

    return NextResponse.json(orders);
  } catch (error: any) {
    console.error("Error fetching orders:", error);
    return NextResponse.json(
      { error: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    
    await connectDB();
    
    let userId = null;
    if (data.user && data.user.email) {
      const user = await User.findOne({ email: data.user.email });
      if (user) userId = user._id;
    }

    const order = await Order.create({
      userId,
      userEmail: data.user?.email,
      userMobile: data.user?.mobile,
      userName: data.user?.username,
      productId: data.productId,
      productName: data.productName,
      productImage: data.productImage,
      amount: data.amount,
      quantity: data.quantity,
      status: data.status || "pending",
      shippingAddress: data.shippingAddress,
      notes: data.notes
    });

    return NextResponse.json({ message: "Order created successfully", order }, { status: 201 });
  } catch (error: any) {
    console.error("Error creating order:", error);
    return NextResponse.json(
      { error: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const { orderId, status, trackingId, adminEmail } = await request.json();

    if (!orderId || !adminEmail) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    await connectDB();

    // Verify admin
    const user = await User.findOne({ email: adminEmail });
    if (!user || !user.isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const updateData: any = {};
    if (status !== undefined) updateData.status = status;
    if (trackingId !== undefined) updateData.trackingId = trackingId;

    const order = await Order.findByIdAndUpdate(orderId, updateData, { new: true });

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Order status updated", order });
  } catch (error: any) {
    console.error("Error updating order:", error);
    return NextResponse.json(
      { error: error.message || "Something went wrong" },
      { status: 500 }
    );
  }
}
import User from "@/models/User";
