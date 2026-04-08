import { NextRequest, NextResponse } from "next/server";
import { getOrderById } from "@/lib/ordersStore";
import { getSessionFromRequest } from "@/lib/auth";
import { isAdminAuthenticated } from "@/lib/adminAuth";

export const dynamic = "force-dynamic";

export async function GET(
  request: NextRequest,
  { params }: { params: { orderId: string } }
) {
  try {
    const order = await getOrderById(params.orderId);

    if (!order) {
      return NextResponse.json({ error: "Sipariş bulunamadı." }, { status: 404 });
    }

    // Admin her siparişe erişebilir
    if (isAdminAuthenticated(request)) {
      return NextResponse.json({ order });
    }

    // Kullanıcı sadece kendi siparişine erişebilir
    const session = getSessionFromRequest(request);
    if (session && order.userId === session.userId) {
      return NextResponse.json({ order });
    }

    // Yetkisiz — sipariş varlığını gizlemek için 404 döner
    return NextResponse.json({ error: "Sipariş bulunamadı." }, { status: 404 });
  } catch (error: any) {
    console.error("Error fetching order:", error);
    return NextResponse.json({ error: "Sipariş alınamadı." }, { status: 500 });
  }
}
