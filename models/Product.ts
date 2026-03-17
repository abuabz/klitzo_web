import mongoose from "mongoose";

const ProductSchema = new mongoose.Schema(
  {
    id: { type: Number, required: true, unique: true },
    name: { type: String, required: true },
    images: [{ type: String }],
    image: { type: String, required: false }, // Backwards compatibility if needed
    price: { type: String, required: true },
    originalPrice: { type: String },
    description: { type: String },
    longDescription: { type: String },
    category: { type: String },
    features: [{ type: String }],
    specifications: { type: mongoose.Schema.Types.Mixed },
    safetyAndUsageNotes: [{ type: String }],
    applicationGuide: [{ type: String }],
    howToUse: [{ type: String }],
    rating: { type: Number, default: 0 },
    reviews: { type: Number, default: 0 },
    inStock: { type: Boolean, default: true },
    freeShipping: { type: Boolean, default: true },
    specialOffer: { type: String },
    stock: { type: Number, default: 100 },
    isNew: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default mongoose.models.Product || mongoose.model("Product", ProductSchema);
