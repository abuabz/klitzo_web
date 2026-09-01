import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const MONGODB_URI = process.env.MONGODB_URI;

const ProductSchema = new mongoose.Schema({}, { strict: false });
const Product = mongoose.models.Product || mongoose.model("Product", ProductSchema);

async function preview() {
  await mongoose.connect(MONGODB_URI!);
  const p1 = await Product.findOne({ name: /130ml/i });
  const p2 = await Product.findOne({ name: /300ml/i });
  console.log("130ml:", p1 ? p1.name : "Not found");
  console.log("300ml:", p2 ? p2.name : "Not found");
  
  if (p1) console.log(JSON.stringify(p1, null, 2).substring(0, 500));
  if (p2) console.log(JSON.stringify(p2, null, 2).substring(0, 500));
  await mongoose.disconnect();
}

preview();
