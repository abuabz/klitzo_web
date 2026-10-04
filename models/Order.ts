import mongoose from "mongoose";

const OrderSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: false, // Optional for guest checkout if needed, but we have auth now
    },
    userEmail: String,
    userMobile: String,
    userName: String,
    productId: Number,
    productName: String,
    productImage: String,
    amount: Number,
    currency: { type: String, default: "INR" },
    status: {
      type: String,
      enum: ["pending", "paid", "shipping", "completed", "failed", "cancelled"],
      default: "pending",
    },
    paymentMethod: {
      type: String,
      enum: ["COD", "Prepaid"],
      default: "COD",
    },
    razorpayOrderId: String,
    razorpayPaymentId: String,
    shippingAddress: {
      name: String,
      phone: String,
      address: String,
      place: String,
      post: String,
      district: String,
      landmark: String,
      pincode: String,
    },
    notes: String,
    quantity: { type: Number, default: 1 },
    trackingId: String,
    isPrinted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// Always clear the model from mongoose to handle hot reloads with schema changes
if (mongoose.models.Order) {
  delete mongoose.models.Order;
}

export default mongoose.model("Order", OrderSchema);
