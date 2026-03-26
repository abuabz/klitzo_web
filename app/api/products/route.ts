import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Product from "@/models/Product";
import User from "@/models/User";

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");
    const id = searchParams.get("id");

    if (id) {
        const product = await Product.findOne({ id: parseInt(id) });
        if (!product) return NextResponse.json({ error: "Product not found" }, { status: 404 });
        return NextResponse.json(product);
    }

    let query = {};
    if (category && category !== "all") {
      query = { category };
    }

    const products = await Product.find(query).sort({ id: 1 });
    return NextResponse.json(products);
  } catch (error: any) {
    console.error("Error fetching products:", error);
    return NextResponse.json(
      { error: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { productData, adminEmail } = await request.json();
    await connectDB();

    const user = await User.findOne({ email: adminEmail });
    if (!user || !user.isAdmin) return NextResponse.json({ error: "Unauthorized" }, { status: 403 });

    // Auto-increment ID if not provided
    if (!productData.id) {
      const lastProduct = await Product.findOne().sort({ id: -1 });
      productData.id = lastProduct ? lastProduct.id + 1 : 1;
    }

    const newProduct = await Product.create(productData);
    return NextResponse.json(newProduct, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { productData, adminEmail } = await request.json();
    await connectDB();

    const user = await User.findOne({ email: adminEmail });
    if (!user || !user.isAdmin) return NextResponse.json({ error: "Unauthorized" }, { status: 403 });

    const updatedProduct = await Product.findOneAndUpdate(
      { id: productData.id },
      productData,
      { new: true }
    );

    if (!updatedProduct) return NextResponse.json({ error: "Product not found" }, { status: 404 });
    return NextResponse.json(updatedProduct);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    const adminEmail = searchParams.get("adminEmail");

    await connectDB();
    const user = await User.findOne({ email: adminEmail });
    if (!user || !user.isAdmin) return NextResponse.json({ error: "Unauthorized" }, { status: 403 });

    const deletedProduct = await Product.findOneAndDelete({ id: parseInt(id!) });
    if (!deletedProduct) return NextResponse.json({ error: "Product not found" }, { status: 404 });

    return NextResponse.json({ message: "Product deleted" });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

