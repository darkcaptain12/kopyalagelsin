import { NextRequest, NextResponse } from "next/server";
import { getSessionFromRequest } from "@/lib/auth";
import { getOrdersByUserId } from "@/lib/ordersStore";

export async function GET(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    const session = getSessionFromRequest(request);
    
    if (!session || session.userId !== params.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const orders = await getOrdersByUserId(params.userId);
    return NextResponse.json({ orders });
  } catch (error: any) {
    console.error("Error fetching user orders:", error);
    return NextResponse.json({ error: "Siparişler alınamadı." }, { status: 500 });
  }
}

