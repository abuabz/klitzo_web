import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';
// No dotenv


const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error("Please define the MONGODB_URI environment variable");
  process.exit(1);
}

// Minimal Product Schema
const ProductSchema = new mongoose.Schema({
  images: [{ type: String }],
  variants: [
    {
      images: [{ type: String }],
    }
  ]
}, { strict: false });

const Product = mongoose.models.Product || mongoose.model("Product", ProductSchema);

const migrateImage = (base64Image: string): string => {
  if (!base64Image || !base64Image.startsWith('data:image')) {
    return base64Image;
  }

  const matches = base64Image.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
  if (!matches || matches.length !== 3) {
    return base64Image;
  }

  const type = matches[1];
  const base64Data = matches[2];
  
  let ext = 'webp';
  if (type.includes('jpeg') || type.includes('jpg')) ext = 'jpg';
  else if (type.includes('png')) ext = 'png';
  else if (type.includes('webp')) ext = 'webp';

  const buffer = Buffer.from(base64Data, 'base64');
  const filename = `${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${ext}`;
  const uploadDir = path.join(process.cwd(), 'public', 'uploads');
  
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }

  const filepath = path.join(uploadDir, filename);
  fs.writeFileSync(filepath, buffer);
  
  console.log(`Saved image to ${filepath}`);
  return `/uploads/${filename}`;
};

async function migrate() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI!);
    console.log('Connected.');

    const products = await Product.find({});
    console.log(`Found ${products.length} products to check.`);

    let modifiedCount = 0;

    for (let product of products) {
      let modified = false;

      // Migrate global images
      if (product.images && product.images.length > 0) {
        for (let i = 0; i < product.images.length; i++) {
          if (product.images[i] && product.images[i].startsWith('data:image')) {
            product.images[i] = migrateImage(product.images[i]);
            modified = true;
          }
        }
      }

      // Migrate variant images
      if (product.variants && product.variants.length > 0) {
        for (let v = 0; v < product.variants.length; v++) {
          if (product.variants[v].images && product.variants[v].images.length > 0) {
            for (let i = 0; i < product.variants[v].images.length; i++) {
              if (product.variants[v].images[i] && product.variants[v].images[i].startsWith('data:image')) {
                product.variants[v].images[i] = migrateImage(product.variants[v].images[i]);
                modified = true;
              }
            }
          }
        }
      }

      if (modified) {
        // Use markModified since we're modifying arrays
        product.markModified('images');
        product.markModified('variants');
        await product.save();
        modifiedCount++;
        console.log(`Migrated product ${product._id}`);
      }
    }

    console.log(`Migration complete! Modified ${modifiedCount} products.`);
  } catch (err) {
    console.error('Migration failed:', err);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB.');
  }
}

migrate();
