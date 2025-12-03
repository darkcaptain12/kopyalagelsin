import { NextRequest, NextResponse } from "next/server";
import { clearAllOrders } from "@/lib/ordersStore";
import { addLog } from "@/lib/logStore";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { confirm, adminUser } = body;

    if (confirm !== "EVET_SIFIRLA") {
      return NextResponse.json(
        { error: "Onay metni doğru girilmedi. Lütfen 'EVET_SIFIRLA' yazın." },
        { status: 400 }
      );
    }

    // Clear all orders and get count
    const orderCount = await clearAllOrders();

    // Log the action
    await addLog({
      type: "admin",
      message: `Tüm siparişler sıfırlandı (${orderCount} sipariş silindi)`,
      adminUser: adminUser || "Admin",
      details: {
        orderCount,
        clearedAt: new Date().toISOString(),
      },
    });

    return NextResponse.json({
      success: true,
      message: `${orderCount} sipariş başarıyla sıfırlandı.`,
      orderCount,
    });
  } catch (error: any) {
    console.error("Error clearing orders:", error);
    return NextResponse.json(
      { error: error.message || "Siparişler sıfırlanamadı." },
      { status: 500 }
    );
  }
}
