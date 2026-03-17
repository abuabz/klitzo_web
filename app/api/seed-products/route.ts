import { NextResponse } from "next/server";
import mongoose from "mongoose";
import connectDB from "@/lib/db";
import Product from "@/models/Product";

const products = [
  {
    id: 1,
    name: "KLITZO Stain Remover 300ml",
    images: ["/assets/productmainimg.jpeg"],
    price: "₹599.00",
    originalPrice: "₹1199.00",
    description: "Ultimate stain fighting power for the toughest stains",
    longDescription: "KLITZO Stain Remover is a professional-grade solution engineered to tackle the most stubborn marks on various surfaces. From household fabrics to vehicle exteriors, our advanced formula penetrates deep to lift stains without damaging the base material. Experience the power of professional cleaning at home.",
    category: "stain-remover",
    features: [
      "Instant removal of old & new stains",
      "Fresh orange fragrance",
      "Effective on oil, grease, ink, rust, food stains, toilet yellow stains, and hard-water spots",
      "Safe for steel, plastic, ceramics, glass, vehicle bodies, tiles, and more",
      "Streak-free finish for glass and shiny surfaces",
    ],
    specifications: {
      Volume: "300ml",
      Type: "Concentrated Liquid",
      Fragrance: "Fresh Orange",
      pHLevel: "Neutral",
      ShelfLife: "24 Months"
    },
    howToUse: [
      "Shake the bottle well before use.",
      "Spray directly onto the stained area.",
      "Wait for 30-60 seconds to allow the formula to penetrate.",
      "Gently scrub with a soft brush or cloth if necessary.",
      "Wipe clean with a damp microfiber cloth.",
      "For stubborn stains, repeat the process."
    ],
    safetyAndUsageNotes: [
      "Test on a small, inconspicuous area before full application.",
      "Keep out of reach of children.",
      "Avoid contact with eyes. In case of contact, rinse thoroughly with water.",
      "Store in a cool, dry place away from direct sunlight.",
      "Do not ingest. If swallowed, seek medical advice immediately."
    ],
    applicationGuide: [
      "Industrial surfaces",
      "Vehicle exteriors (cars, bikes)",
      "Kitchen tiles and slabs",
      "Bathroom fittings and ceramics",
      "Glass and mirrored surfaces",
      "Plastic and metal equipment"
    ],
    rating: 4.8,
    reviews: 156,
    inStock: true,
    freeShipping: true,
    specialOffer: "₹549 only",
    isNew: true
  },
  {
    id: 2,
    name: "KLITZO Stain Remover 130ml",
    images: ["/assets/product_130ml.jpeg"],
    price: "₹299.00",
    originalPrice: "₹599.00",
    description: "Portable stain fighting power for the toughest stains",
    longDescription: "All the power of our signature stain remover in a convenient, travel-friendly size. Perfect for keeping in your car or travel bag to handle emergency spills and stains on the go.",
    category: "stain-remover",
    features: [
      "Same powerful formula as 300ml",
      "Travel-friendly compact bottle",
      "Instant action on fresh stains",
      "Safe for multiple surfaces",
      "Fragrant cleaning experience"
    ],
    specifications: {
      Volume: "130ml",
      Type: "Travel Pack",
      Fragrance: "Fresh Orange",
      pHLevel: "Neutral",
      ShelfLife: "24 Months"
    },
    howToUse: [
      "Spray onto the stain immediately after spill if possible.",
      "Wait for 30 seconds.",
      "Blot or wipe with a clean cloth.",
      "Repeat for older, set-in stains."
    ],
    safetyAndUsageNotes: [
      "Safe for most surfaces, but always test first.",
      "Keep away from heat sources.",
      "Avoid eye contact."
    ],
    applicationGuide: [
      "Emergency spills",
      "Travel kit essential",
      "Car interiors",
      "Small household items",
      "Desktop and office gear"
    ],
    rating: 4.7,
    reviews: 82,
    inStock: true,
    freeShipping: true,
    specialOffer: "₹249 only",
    isNew: false
  },
  {
    id: 3,
    name: "Aluminium & Steel Hard Cleaner 300ml",
    images: ["/assets/hardcleaner01.jpeg"],
    price: "₹499.00",
    originalPrice: "₹999.00",
    description: "Powerful cleaner for tough grime and dirt on metal surfaces",
    longDescription: "Restore the shine to your metal surfaces with KLITZO Metal Cleaner. Specially formulated for aluminum and steel, this heavy-duty cleaner removes oxidation, grease, and industrial grime that standard cleaners can't touch. Perfect for engine parts, kitchen equipment, and outdoor furniture.",
    category: "hard-cleaner",
    features: [
        "Removes tough grime and dirt",
        "Restores metal brightness",
        "Prevents future oxidation",
        "Safe for various metal alloys",
        "Leaves surfaces clean and refreshed",
    ],
    specifications: {
      Volume: "300ml",
      Type: "Heavy Duty Liquid",
      CompatibleMetals: "Aluminum, Stainless Steel, Brass, Copper",
      ActionTime: "2-3 Minutes"
    },
    howToUse: [
      "Clean the surface of any loose debris.",
      "Apply the cleaner using a sponge or applicator.",
      "Wait for 2-3 minutes for deep cleaning.",
      "Scrub with a non-abrasive pad for tough areas.",
      "Rinse thoroughly with water.",
      "Dry with a clean towel to prevent water spots."
    ],
    safetyAndUsageNotes: [
      "Wear gloves during application.",
      "Use in a well-ventilated area.",
      "Avoid contact with painted surfaces if possible.",
      "Do not use on thin or sensitive electronic components."
    ],
    applicationGuide: [
      "Engine components",
      "Kitchen sinks and ventilators",
      "Outdoor metal furniture",
      "Bicycle frames",
      "Industrial machinery",
      "Door handles and fittings"
    ],
    rating: 4.6,
    reviews: 89,
    inStock: true,
    freeShipping: true,
    isNew: true
  },
  {
    id: 4,
    name: "KLITZO Shoe Freshener 100ml",
    images: ["/assets/shoe01.jpeg"],
    price: "₹399.00",
    originalPrice: "₹699.00",
    description: "Advanced anti-bacterial spray for fresh and hygienic shoes",
    longDescription: "Keep your footwear fresh and odor-free with KLITZO Shoe Freshener. Our advanced anti-bacterial and anti-fungal formula doesn't just mask smells; it eliminates the bacteria that cause them. Safe for all types of shoes from sports sneakers to formal leather.",
    category: "shoe-care",
    features: [
      "Removes, controls, and prevents bad odors",
      "Anti-bacterial & Anti-fungal action",
      "Safe and non-toxic natural formulation",
      "Fast-acting and long-lasting freshness",
      "Suitable for all types of shoes"
    ],
    specifications: {
      Volume: "100ml",
      Form: "Aerosol Spray",
      Fragrance: "Cool Mint / Aqua",
      DryingTime: "Under 1 Minute"
    },
    howToUse: [
      "Remove insoles if possible or spray directly into the shoe.",
      "Spray 2-3 times inside each shoe after use.",
      "Allow to dry completely before wearing.",
      "For best results, use daily."
    ],
    safetyAndUsageNotes: [
      "Do not spray while wearing the shoes.",
      "Avoid contact with skin.",
      "Keep away from eyes."
    ],
    applicationGuide: [
        "Running shoes",
        "Leather formal shoes",
        "Sneakers",
        "Boots",
        "Sandals",
        "Gym bags"
    ],
    rating: 4.9,
    reviews: 45,
    inStock: true,
    freeShipping: true,
    specialOffer: "₹349 only",
    isNew: true
  },
  {
    id: 5,
    name: "KLITZO Helmet Freshener 100ml",
    images: ["/assets/helmet01.jpeg"],
    price: "₹399.00",
    originalPrice: "₹699.00",
    description: "Anti-bacterial spray for fresh and hygienic helmets",
    longDescription: "Biker's best friend. This spray is specifically designed to keep the interior lining of your helmet fresh, hygienic, and smelling great. It neutralizes sweat odors and kills germs without damaging the foam or fabric of your helmet.",
    category: "helmet-care",
    features: [
        "Eliminates odor-causing bacteria",
        "Advanced micro-technology neutralizes odor",
        "Long-lasting freshness with a fresh scent",
        "No oily residue, safe & non-toxic",
        "Suitable for all types of helmets"
    ],
    specifications: {
      Volume: "100ml",
      Form: "Fine Mist Spray",
      Fragrance: "Premium Cologne",
      SkinSafe: "Yes (Interior Lining Only)"
    },
    howToUse: [
      "Spray the inner lining of the helmet generously.",
      "Leave it in a well-ventilated area to dry.",
      "Use once a week or after long rides.",
      "Do not spray on the visor or exterior shell."
    ],
    safetyAndUsageNotes: [
      "Ensure helmet is dry before wearing.",
      "Keep out of reach of children.",
      "Flammable - keep away from sparks."
    ],
    applicationGuide: [
      "Full-face helmets",
      "Open-face helmets",
      "Motocross helmets",
      "Cycling helmets",
      "Racing suits (armpits/areas)",
      "Gloves"
    ],
    rating: 4.8,
    reviews: 32,
    inStock: true,
    freeShipping: true,
    specialOffer: "₹349 only",
    isNew: true
  },
  {
    id: 6,
    name: "KLITZO Aluminium & Steel Hard Cleaner 130ml",
    images: ["/assets/hardcleaner01.jpeg"],
    price: "₹299.00",
    originalPrice: "₹699.00",
    description: "Convenient 130ml Trial Pack for tough stains and rust",
    longDescription: "A more affordable, compact version of our powerful metal cleaner. Ideal for testing on specific stains or for small-scale cleaning jobs around the workshop or kitchen.",
    category: "hard-cleaner",
    features: [
        "Removes Rust & Oxidation",
        "Removes Grease & Oil Stains",
        "Works on Aluminium & Steel",
        "Same strength as full size",
        "Great for DIY projects"
    ],
    specifications: {
      Volume: "130ml",
      Type: "Concentrated Pack",
      RustRemoval: "High",
      Storage: "Upright"
    },
    howToUse: [
      "Apply small amount to a clean cloth.",
      "Rub over oxidized area in circular motions.",
      "Wipe off with fresh towel.",
      "No rinsing required for light cleaning."
    ],
    safetyAndUsageNotes: [
      "Keep away from skin contact.",
      "Always wash hands after use.",
      "Close cap tightly."
    ],
    applicationGuide: [
        "Small metal fittings",
        "Chrome accents",
        "Exhaust tips",
        "Kitchen cutlery",
        "Tools and wrenches"
    ],
    rating: 4.5,
    reviews: 12,
    inStock: true,
    freeShipping: true,
    specialOffer: "₹299 only",
    isNew: false
  },
  {
    id: 0,
    name: "Payment Test Product",
    images: ["/assets/productmainimg.jpeg"],
    price: "₹5.00",
    originalPrice: "₹10.00",
    description: "Test product for verification purposes",
    longDescription: "This product is strictly for testing payment gateway integrations and checkout flows within the developer environment. Do not purchase for actual cleaning needs.",
    category: "stain-remover",
    features: [
      "Test feature 1",
      "Test feature 2",
      "Price: 5 Rupees"
    ],
    specifications: {
      TestID: "T-001",
      Type: "Virtual/Physical Test"
    },
    howToUse: [
      "Click buy now.",
      "Fill test data.",
      "Verify success."
    ],
    safetyAndUsageNotes: [
      "Not a real cleaning product."
    ],
    applicationGuide: [
      "Development testing",
      "UAT verification"
    ],
    rating: 5.0,
    reviews: 0,
    inStock: true,
    freeShipping: true,
    isNew: false
  }
];

export async function GET() {
  try {
    await connectDB();
    
    // Use raw MongoDB to bypass potentially stale Mongoose model cache
    const db = mongoose.connection.db;
    if (!db) throw new Error("DB connection not initialized");
    
    const collection = db.collection("products");
    await collection.deleteMany({});
    
    // Add compatibility "image" field (first image from images array)
    const enrichedProducts = products.map((p: any) => ({
        ...p,
        image: (p.images && p.images.length > 0) ? p.images[0] : (p.image || ""),
        createdAt: new Date(),
        updatedAt: new Date()
    }));

    await collection.insertMany(enrichedProducts);
    
    return NextResponse.json({ 
        message: "Database seeded successfully with specific isNew flags!", 
        productsEnriched: enrichedProducts.length 
    });
  } catch (error: any) {
    console.error("Seeding error:", error);
    return NextResponse.json({ 
        error: error.message,
        stack: error.stack
    }, { status: 500 });
  }
}
