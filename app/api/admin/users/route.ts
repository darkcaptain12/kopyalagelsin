import { NextResponse } from "next/server";
import { getAllUsers } from "@/lib/usersStore";
import { getAllOrders } from "@/lib/ordersStore";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  try {
    const [users, orders] = await Promise.all([getAllUsers(), getAllOrders()]);

    // Build user list with order count and total spend
    const usersWithStats = users.map((u) => {
      const userOrders = orders.filter(
        (o) => o.email?.toLowerCase() === u.email.toLowerCase()
      );
      const paidOrders = userOrders.filter((o) => o.paytrStatus === "paid");
      const totalSpend = paidOrders.reduce(
        (sum, o) => sum + (o.totalAmount || 0),
        0
      );
      return {
        id: u.id,
        name: u.name,
        email: u.email,
        createdAt: u.createdAt,
        referralCode: u.referralCode,
        referredByUserId: u.referredByUserId || null,
        orderCount: userOrders.length,
        paidOrderCount: paidOrders.length,
        totalSpend,
      };
    });

    // Sort by newest first
    usersWithStats.sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    return NextResponse.json(
      { users: usersWithStats },
      {
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate",
        },
      }
    );
  } catch (error: any) {
    console.error("Admin users error:", error);
    return NextResponse.json(
      { error: "Kullanıcılar alınamadı." },
      { status: 500 }
    );
  }
}
