import { NextRequest, NextResponse } from "next/server";
import { getOrderById } from "@/lib/ordersStore";
import { checkRateLimit, getIpFromHeaders } from "@/lib/rateLimit";

export const dynamic = "force-dynamic";

/**
 * Google Ads dönüşüm verisi — sadece ödeme onaylanmış siparişler için.
 * Kişisel veri döndürmez; yalnızca sipariş ID, ödeme durumu ve dönüşüm değeri.
 * value = KDV dahil, kargo hariç tutar (indirim ve sezon çarpanı oransal uygulanır).
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { orderId: string } }
) {
  const ip = getIpFromHeaders(request.headers);
  const rl = checkRateLimit(`orders:conversion:${ip}`, 60, 10 * 60 * 1000);
  if (!rl.allowed) {
    return NextResponse.json({ error: "Çok fazla istek." }, { status: 429 });
  }

  try {
    const order = await getOrderById(params.orderId);
    if (!order) {
      return NextResponse.json({ error: "Sipariş bulunamadı." }, { status: 404 });
    }

    // "paid" ve sonrasındaki operasyonel durumlar ödemesi alınmış siparişlerdir
    const paid = ["paid", "hazirlaniyor", "kargolandi"].includes(order.paytrStatus);
    if (!paid) {
      return NextResponse.json({ orderId: order.id, paid: false });
    }

    // Sezon çarpanı, indirim ve KDV ara toplamın tamamına oransal uygulandığı için
    // kargonun toplam içindeki payı: shippingCost / (print + binding + shipping)
    const base = (order.printCost || 0) + (order.bindingCost || 0) + (order.shippingCost || 0);
    const shippingShare = base > 0 ? (order.shippingCost || 0) / base : 0;
    const value = Math.round(order.totalAmount * (1 - shippingShare) * 100) / 100;

    return NextResponse.json({
      orderId: order.id,
      paid: true,
      value,
      currency: "TRY",
    });
  } catch (error) {
    console.error("Error fetching conversion data:", error);
    return NextResponse.json({ error: "Veri alınamadı." }, { status: 500 });
  }
}
