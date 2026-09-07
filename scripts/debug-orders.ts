import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/klitzo_web";

const OrderSchema = new mongoose.Schema({}, { strict: false });
const Order = mongoose.models.Order || mongoose.model("Order", OrderSchema);

async function test() {
  await mongoose.connect(MONGODB_URI);
  const orders = await Order.find({}).lean();
  console.log("Current Orders in DB:");
  orders.forEach(o => {
    console.log(`- Name: ${o.shippingAddress?.name}, Pincode: ${o.shippingAddress?.pincode}, Status: ${o.status}, TrackingId: ${o.trackingId}`);
  });
  process.exit(0);
}
test();
