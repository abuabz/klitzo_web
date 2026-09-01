import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI;

const ProductSchema = new mongoose.Schema({}, { strict: false });
const Product = mongoose.models.Product || mongoose.model("Product", ProductSchema);

async function mergeProducts() {
  await mongoose.connect(MONGODB_URI);
  const p300 = await Product.findOne({ _id: '69b93c538b81c4bcba57e3ae' });
  const p130 = await Product.findOne({ _id: '69b93c538b81c4bcba57e3b1' });
  
  if (!p130 || !p300) {
    console.log("Could not find both products");
    await mongoose.disconnect();
    return;
  }
  
  console.log("Merging Aluminium cleaners...");
  
  const variant300 = {
    sku: "KALU-300",
    size: "300ml",
    price: p300.price?.toString().replace(/[^\d.]/g, "") || "599",
    originalPrice: p300.originalPrice?.toString().replace(/[^\d.]/g, "") || "1199",
    images: p300.images || [p300.image],
    stock: p300.stock || 100,
    specifications: p300.specifications || []
  };
  
  const variant130 = {
    sku: "KALU-130",
    size: "130ml",
    price: p130.price?.toString().replace(/[^\d.]/g, "") || "299",
    originalPrice: p130.originalPrice?.toString().replace(/[^\d.]/g, "") || "599",
    images: p130.images || [p130.image],
    stock: p130.stock || 100,
    specifications: p130.specifications || []
  };

  // Update p300 to be the base product
  await Product.updateOne({ _id: p300._id }, {
    $set: {
      name: "KLITZO Aluminium & Steel Hard Cleaner",
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
