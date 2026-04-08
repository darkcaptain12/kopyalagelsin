import { NextRequest, NextResponse } from "next/server";
import { getAllCoupons } from "@/lib/couponsStore";
import { requireAdminAuth } from "@/lib/adminAuth";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const authError = requireAdminAuth(request);
  if (authError) return authError;

  try {
    const coupons = await getAllCoupons();
    return NextResponse.json({ coupons });
  } catch (error: any) {
    console.error("Error fetching coupons:", error);
    return NextResponse.json({ error: "Kuponlar alınamadı." }, { status: 500 });
  }
}
