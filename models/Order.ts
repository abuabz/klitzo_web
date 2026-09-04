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
      enum: ["pending", "paid", "shipping", "completed", "failed"],
      default: "pending",
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
  },
  { timestamps: true }
);

// Clear the model from mongoose if it doesn't have trackingId to handle hot reloads
if (mongoose.models.Order && !mongoose.models.Order.schema.paths.trackingId) {
  delete mongoose.models.Order;
}

export default mongoose.models.Order || mongoose.model("Order", OrderSchema);
