import { NextRequest, NextResponse } from "next/server";
import { getAllUsers } from "@/lib/usersStore";
import { requireAdminAuth } from "@/lib/adminAuth";
import { getAllOrders } from "@/lib/ordersStore";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(request: NextRequest) {
  const authError = requireAdminAuth(request);
  if (authError) return authError;

  try {
    const [users, orders] = await Promise.all([getAllUsers(), getAllOrders()]);

    // Build user list with order count and total spend
    const usersWithStats = users.map((u) => {
      const userOrders = orders.filter((o) => o.userId === u.id);
      const paidOrders = userOrders.filter((o) => o.paytrStatus === "paid");
      const totalSpend = paidOrders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);

      return {
        id: u.id,
        name: u.name,
        email: u.email,
        createdAt: u.createdAt,
        referralCode: u.referralCode,
        orderCount: userOrders.length,
        paidOrderCount: paidOrders.length,
        totalSpend,
      };
    });

    // Sort by newest first
    usersWithStats.sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    return NextResponse.json({ users: usersWithStats });
  } catch (error: any) {
    console.error("Error fetching users:", error);
    return NextResponse.json({ error: "Kullanıcılar alınamadı." }, { status: 500 });
  }
}
