import { NextRequest, NextResponse } from "next/server";
import { isAdminAuthenticated, clearAdminCookie } from "@/lib/adminAuth";

export const dynamic = "force-dynamic";

/** Admin oturumunun geçerli olup olmadığını kontrol eder (sayfa yenilemede kullanılır) */
export async function GET(request: NextRequest) {
  if (isAdminAuthenticated(request)) {
    return NextResponse.json({ authenticated: true });
  }
  return NextResponse.json({ authenticated: false }, { status: 401 });
}

/** Admin çıkışı — cookie'yi siler */
export async function POST(request: NextRequest) {
  const response = NextResponse.json({ success: true });
  clearAdminCookie(response);
  return response;
}
