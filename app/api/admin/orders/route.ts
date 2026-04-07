import { NextRequest, NextResponse } from "next/server";
import { getAllOrders } from "@/lib/ordersStore";

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const searchName = searchParams.get("searchName") || "";
    const searchOrderId = searchParams.get("searchOrderId") || "";
    const dateFrom = searchParams.get("dateFrom") || "";
    const dateTo = searchParams.get("dateTo") || "";
    const selectedDate = searchParams.get("selectedDate") || ""; // For daily archive view

    let orders = await getAllOrders();
    
    // Filter by name
    if (searchName) {
      orders = orders.filter((order) =>
        order.customerName.toLowerCase().includes(searchName.toLowerCase())
      );
    }

    // Filter by order ID
    if (searchOrderId) {
      orders = orders.filter((order) =>
        order.id.toLowerCase().includes(searchOrderId.toLowerCase())
      );
    }

    // Filter by date range
    if (dateFrom) {
      const fromDate = new Date(dateFrom);
      fromDate.setHours(0, 0, 0, 0);
      orders = orders.filter((order) => new Date(order.createdAt) >= fromDate);
    }

    if (dateTo) {
      const toDate = new Date(dateTo);
      toDate.setHours(23, 59, 59, 999);
      orders = orders.filter((order) => new Date(order.createdAt) <= toDate);
    }

    // Filter by selected date (for daily archive)
    if (selectedDate) {
      const selected = new Date(selectedDate);
      const startOfDay = new Date(selected);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(selected);
      endOfDay.setHours(23, 59, 59, 999);
      
      orders = orders.filter((order) => {
        const orderDate = new Date(order.createdAt);
        return orderDate >= startOfDay && orderDate <= endOfDay;
      });
    }
    
    // Sort by createdAt descending (newest first)
    const sortedOrders = orders.sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    return NextResponse.json({ orders: sortedOrders });
  } catch (error: any) {
    console.error("Error fetching orders:", error);
    return NextResponse.json({ error: "Siparişler alınamadı." }, { status: 500 });
  }
}

