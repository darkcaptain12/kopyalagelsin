import { NextRequest, NextResponse } from "next/server";
import { getCouponByCode, deactivateCoupon } from "@/lib/couponsStore";
import { readFile, writeFile } from "fs/promises";
import path from "path";
import type { Coupon } from "@/lib/couponsStore";

const COUPONS_FILE = path.join(process.cwd(), "data", "coupons.json");

export async function POST(request: NextRequest) {
  try {
    const { code, isActive } = await request.json();

    const content = await readFile(COUPONS_FILE, "utf-8");
    const coupons: Coupon[] = JSON.parse(content);

    const couponIndex = coupons.findIndex((c) => c.code === code);
    if (couponIndex === -1) {
      return NextResponse.json({ error: "Kupon bulunamadı." }, { status: 404 });
    }

    coupons[couponIndex].isActive = isActive;
    await writeFile(COUPONS_FILE, JSON.stringify(coupons, null, 2), "utf-8");

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Error toggling coupon:", error);
    return NextResponse.json({ error: "Kupon güncellenemedi." }, { status: 500 });
  }
}

