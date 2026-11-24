// app/api/shipping/indiapost/test-connection/route.ts
import { NextRequest, NextResponse } from "next/server";
import { loginToIndiaPost, getIndiaPostConfig } from "@/lib/indiapost";
import connectDB from "@/lib/db";
import User from "@/models/User";

export async function POST(request: NextRequest) {
  try {
    const { adminEmail } = await request.json().catch(() => ({}));

    if (adminEmail) {
      await connectDB();
      const user = await User.findOne({ email: adminEmail });
      if (!user || !user.isAdmin) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
      }
    }

    const config = getIndiaPostConfig();
    const loginResult = await loginToIndiaPost();

    return NextResponse.json({
      config: {
        customerId: config.customerId,
        baseUrl: config.baseUrl,
      },
      result: loginResult,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
