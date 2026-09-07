import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Order from "@/models/Order";
import User from "@/models/User";
import * as xlsx from "xlsx";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const adminEmail = formData.get("adminEmail") as string;
    const file = formData.get("file") as File;

    if (!adminEmail || !file) {
      return NextResponse.json({ error: "Missing required fields or file" }, { status: 400 });
    }

    await connectDB();

    // Verify admin
    const user = await User.findOne({ email: adminEmail });
    if (!user || !user.isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // Read the file buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Parse the excel file
    const workbook = xlsx.read(buffer, { type: "buffer" });
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    
    // Get rows as JSON
    const rows = xlsx.utils.sheet_to_json(sheet) as any[];

    if (rows.length === 0) {
      return NextResponse.json({ error: "The uploaded file is empty." }, { status: 400 });
    }

    // Verify headers
    const firstRow = rows[0];
    const requiredHeaders = ["article-number", "receiver-name", "destination-pin"];
    for (const header of requiredHeaders) {
      if (!(header in firstRow)) {
        return NextResponse.json({ error: `Missing required column: "${header}"` }, { status: 400 });
      }
    }

    let updatedCount = 0;
    const unmatched = [];
    const pincodeMismatches = [];

    // Fetch all active orders
    const activeOrders = await Order.find({ status: { $in: ["pending", "paid", "shipping"] } });

    for (const row of rows) {
      const trackingCode = String(row["article-number"] || "").trim();
      const receiverName = String(row["receiver-name"] || "").trim();
      const destPin = String(row["destination-pin"] || "").trim();

      if (!trackingCode || !receiverName) continue;

      // Exact match: Name + Pincode
      const exactMatches = activeOrders.filter(o => 
        (o.shippingAddress?.name || "").trim().toLowerCase() === receiverName.toLowerCase() &&
        (o.shippingAddress?.pincode || "").trim() === destPin
      );

      if (exactMatches.length === 1) {
        const orderToUpdate = exactMatches[0];
        orderToUpdate.trackingId = trackingCode;
        if (orderToUpdate.status === "pending" || orderToUpdate.status === "paid") {
          orderToUpdate.status = "shipping";
        }
        await orderToUpdate.save();
        updatedCount++;
      } else {
        // Fallback: Match by name only
        const nameMatches = activeOrders.filter(o => 
          (o.shippingAddress?.name || "").trim().toLowerCase() === receiverName.toLowerCase()
        );

        if (nameMatches.length === 1) {
          const orderToUpdate = nameMatches[0];
          orderToUpdate.trackingId = trackingCode;
          if (orderToUpdate.status === "pending" || orderToUpdate.status === "paid") {
            orderToUpdate.status = "shipping";
          }
          await orderToUpdate.save();
          updatedCount++;
          pincodeMismatches.push({
            receiverName,
            trackingCode,
            filePin: destPin,
            dbPin: orderToUpdate.shippingAddress?.pincode || "",
            orderId: orderToUpdate._id
          });
        } else {
          unmatched.push({
            receiverName,
            destPin,
            trackingCode,
            reason: nameMatches.length > 1 ? "Multiple orders found for this name." : "No matching active order found."
          });
        }
      }
    }

    return NextResponse.json({
      message: "Processing complete",
      updatedCount,
      unmatched,
      pincodeMismatches
    });

  } catch (error: any) {
    console.error("Error importing tracking details:", error);
    return NextResponse.json(
      { error: error.message || "Failed to process the uploaded file" },
      { status: 500 }
    );
  }
}
