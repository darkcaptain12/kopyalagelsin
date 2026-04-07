import { NextRequest, NextResponse } from "next/server";
import { updateOrderAdminStatus, PaytrStatus } from "@/lib/ordersStore";

export const dynamic = "force-dynamic";

const VALID_STATUSES: PaytrStatus[] = ["pending", "paid", "hazirlaniyor", "kargolandi", "iptal", "failed"];

export async function PATCH(
  request: NextRequest,
  { params }: { params: { orderId: string } }
) {
  try {
    const { status } = await request.json();

    if (!VALID_STATUSES.includes(status)) {
      return NextResponse.json({ error: "Geçersiz durum." }, { status: 400 });
    }

    const updated = await updateOrderAdminStatus(params.orderId, status);
    if (!updated) {
      return NextResponse.json({ error: "Sipariş bulunamadı." }, { status: 404 });
    }

    return NextResponse.json({ order: updated });
  } catch (error: any) {
    console.error("Order status update error:", error);
    return NextResponse.json({ error: "Güncelleme başarısız." }, { status: 500 });
  }
}
