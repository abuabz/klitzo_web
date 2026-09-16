import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import User from "@/models/User";
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

    // Admin can fetch orders with pagination and filtering
    if (all === "true" && email) {
      const user = await User.findOne({ email });
      if (user && user.isAdmin) {
        const page = parseInt(searchParams.get("page") || "1", 10);
        const limit = parseInt(searchParams.get("limit") || "20", 10);
        const tab = searchParams.get("tab") || "orders";
        const search = searchParams.get("search") || "";

        let query: any = {};

        // Filter based on active tab
        if (tab === 'cancelled-orders') {
          query.status = { $in: ['Cancelled', 'cancelled'] };
        } else if (tab === 'abandoned-orders') {
          query.paymentMethod = 'Prepaid';
          query.status = { $in: ['pending', 'failed'] };
        } else if (tab === 'orders') {
          // Normal active orders (not cancelled, not abandoned prepaid)
          query.$and = [
            { status: { $nin: ['Cancelled', 'cancelled'] } },
            { $or: [
                { paymentMethod: { $ne: 'Prepaid' } },
                { status: { $nin: ['pending', 'failed'] } }
            ]}
          ];
        }

        // Apply search globally over multiple fields
        if (search) {
          const searchRegex = new RegExp(search, 'i');
          const searchQueries: any[] = [
            { 'shippingAddress.name': searchRegex },
            { userEmail: searchRegex },
            { 'shippingAddress.phone': searchRegex },
            { productName: searchRegex },
            { razorpayOrderId: searchRegex },
          ];

          // If the search term is a valid ObjectId, allow exact searching by _id
          if (/^[0-9a-fA-F]{24}$/.test(search)) {
             searchQueries.push({ _id: search });
          } else {
             // Allow partial matching on the _id string
             searchQueries.push({ 
               $expr: { 
                 $regexMatch: { 
                   input: { $toString: "$_id" }, 
                   regex: search, 
                   options: "i" 
                 } 
               } 
             });
          }

          if (query.$and) {
            query.$and.push({ $or: searchQueries });
          } else {
            query.$or = searchQueries;
          }
        }

        const total = await Order.countDocuments(query);
        const orders = await Order.find(query)
          .sort({ createdAt: -1 })
          .skip((page - 1) * limit)
          .limit(limit);

        return NextResponse.json({ 
          orders, 
          total, 
          page, 
          totalPages: Math.ceil(total / limit) || 1 
        });
      }
    }

    const mobile = searchParams.get("mobile");

    if (!email && !mobile) {
      return NextResponse.json({ error: "Email or Mobile is required" }, { status: 400 });
    }

    const query: any = {};
    if (email) query.userEmail = email;
    if (mobile) query.userMobile = mobile;

    // Use $or to find orders matching either if both are provided somehow
    const filter = (email && mobile) ? { $or: [{ userEmail: email }, { userMobile: mobile }] } : query;
    const orders = await Order.find(filter).sort({ createdAt: -1 });

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
      userMobile: data.user?.mobile || data.shippingAddress?.phone,
      userName: data.user?.username || data.shippingAddress?.name,
      productId: data.productId,
      productName: data.productName,
      productImage: data.productImage,
      amount: data.amount,
      quantity: data.quantity,
      status: data.status || "pending",
      paymentMethod: "COD",
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

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    const adminEmail = searchParams.get("adminEmail");

    if (!id || !adminEmail) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    await connectDB();

    const user = await User.findOne({ email: adminEmail });
    if (!user || !user.isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const deletedOrder = await Order.findByIdAndDelete(id);
    
    if (!deletedOrder) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Order deleted successfully" }, { status: 200 });
  } catch (error: any) {
    console.error("Error deleting order:", error);
    return NextResponse.json(
      { error: error.message || "Something went wrong" },
      { status: 500 }
    );
  }
}
