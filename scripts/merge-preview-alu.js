import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI;

const ProductSchema = new mongoose.Schema({}, { strict: false });
const Product = mongoose.models.Product || mongoose.model("Product", ProductSchema);

async function preview() {
  await mongoose.connect(MONGODB_URI);
  const products = await Product.find({ name: /aluminium/i });
  products.forEach(p => console.log(p.name, p._id));
  await mongoose.disconnect();
}

preview();
