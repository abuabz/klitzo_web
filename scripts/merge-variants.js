import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI;

const ProductSchema = new mongoose.Schema({}, { strict: false });
const Product = mongoose.models.Product || mongoose.model("Product", ProductSchema);

async function mergeProducts() {
  await mongoose.connect(MONGODB_URI);
  const p130 = await Product.findOne({ name: /130ml/i });
  const p300 = await Product.findOne({ name: /300ml/i });
  
  if (!p130 || !p300) {
    console.log("Could not find both products");
    await mongoose.disconnect();
    return;
  }
  
  console.log("Merging...");
  
  const variant130 = {
    sku: "KSR-130",
    size: "130ml",
    price: p130.price?.toString().replace(/[^\d.]/g, "") || "299",
    originalPrice: p130.originalPrice?.toString().replace(/[^\d.]/g, "") || "599",
    images: p130.images || [p130.image],
    stock: p130.stock || 100,
    specifications: p130.specifications || []
  };
  
  const variant300 = {
    sku: "KSR-300",
    size: "300ml",
    price: p300.price?.toString().replace(/[^\d.]/g, "") || "599",
    originalPrice: p300.originalPrice?.toString().replace(/[^\d.]/g, "") || "1199",
    images: p300.images || [p300.image],
    stock: p300.stock || 100,
    specifications: p300.specifications || []
  };

  // Update p300 to be the base product
  await Product.updateOne({ _id: p300._id }, {
    $set: {
      name: "KLITZO Stain Remover",
      variants: [variant130, variant300]
    }
  });
  
  console.log("Updated 300ml product to base product with 2 variants");
  
  // Delete the 130ml product
  await Product.deleteOne({ _id: p130._id });
  console.log("Deleted 130ml standalone product");
  
  await mongoose.disconnect();
  console.log("Done");
}

mergeProducts();
