import { NextRequest, NextResponse } from "next/server";
import { getOrderById } from "@/lib/ordersStore";

export async function GET(
  request: NextRequest,
  { params }: { params: { orderId: string } }
) {
  try {
    const order = await getOrderById(params.orderId);

    if (!order) {
      return NextResponse.json({ error: "Sipariş bulunamadı." }, { status: 404 });
    }

    return NextResponse.json({ order });
  } catch (error: any) {
    console.error("Error fetching order:", error);
    return NextResponse.json({ error: "Sipariş alınamadı." }, { status: 500 });
  }
}

