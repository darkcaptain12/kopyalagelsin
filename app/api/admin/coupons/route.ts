import { NextResponse } from "next/server";
import { getAllCoupons } from "@/lib/couponsStore";

export async function GET() {
  try {
    const coupons = await getAllCoupons();
    return NextResponse.json({ coupons });
  } catch (error: any) {
    console.error("Error fetching coupons:", error);
    return NextResponse.json({ error: "Kuponlar alınamadı." }, { status: 500 });
  }
}

