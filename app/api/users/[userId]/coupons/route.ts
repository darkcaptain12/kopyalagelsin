import { NextRequest, NextResponse } from "next/server";
import { getSessionFromRequest } from "@/lib/auth";
import { getUserCoupons } from "@/lib/couponsStore";

export async function GET(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    const session = getSessionFromRequest(request);
    
    if (!session || session.userId !== params.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const coupons = await getUserCoupons(params.userId);
    return NextResponse.json({ coupons });
  } catch (error: any) {
    console.error("Error fetching user coupons:", error);
    return NextResponse.json({ error: "Kuponlar alınamadı." }, { status: 500 });
  }
}

