import { NextRequest, NextResponse } from "next/server";
import { updateOrderAdminStatus, PaytrStatus } from "@/lib/ordersStore";
import { sendOrderStatusEmail } from "@/lib/mailer";
import { requireAdminAuth } from "@/lib/adminAuth";

export const dynamic = "force-dynamic";

const VALID_STATUSES: PaytrStatus[] = ["pending", "paid", "hazirlaniyor", "kargolandi", "iptal", "failed"];

// Bu statüslere geçince müşteriye otomatik e-posta gönderilir
const CUSTOMER_NOTIFY_STATUSES = ["hazirlaniyor", "kargolandi", "iptal"] as const;
type NotifyStatus = typeof CUSTOMER_NOTIFY_STATUSES[number];

export async function PATCH(
  request: NextRequest,
  { params }: { params: { orderId: string } }
) {
  const authError = requireAdminAuth(request);
  if (authError) return authError;

  try {
    const { status } = await request.json();

    if (!VALID_STATUSES.includes(status)) {
      return NextResponse.json({ error: "Geçersiz durum." }, { status: 400 });
    }

    const updated = await updateOrderAdminStatus(params.orderId, status);
    if (!updated) {
      return NextResponse.json({ error: "Sipariş bulunamadı." }, { status: 404 });
    }

    // Müşteriye bildirim e-postası gönder (hata olsa bile cevabı engelleme)
    if ((CUSTOMER_NOTIFY_STATUSES as readonly string[]).includes(status)) {
      sendOrderStatusEmail(updated, status as NotifyStatus).catch((e) =>
        console.error("[Route] Müşteri mail hatası:", e)
      );
    }

    return NextResponse.json({ order: updated });
  } catch (error: any) {
    console.error("Order status update error:", error);
    return NextResponse.json({ error: "Güncelleme başarısız." }, { status: 500 });
  }
}
