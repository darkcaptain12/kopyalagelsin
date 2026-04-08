import { NextRequest, NextResponse } from "next/server";
import { checkRateLimit, getIpFromHeaders } from "@/lib/rateLimit";
import { setAdminCookie } from "@/lib/adminAuth";

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;

export async function POST(request: NextRequest) {
  // Rate limiting: 5 deneme / 10 dakika / IP
  const ip = getIpFromHeaders(request.headers);
  const rl = checkRateLimit(`admin:login:${ip}`, 5, 10 * 60 * 1000);
  if (!rl.allowed) {
    return NextResponse.json(
      { error: `Çok fazla giriş denemesi. ${rl.retryAfter} saniye bekleyin.` },
      { status: 429 }
    );
  }

  try {
    if (!ADMIN_PASSWORD) {
      return NextResponse.json(
        { error: "Admin şifresi yapılandırılmamış." },
        { status: 500 }
      );
    }

    const { password } = await request.json();

    if (password === ADMIN_PASSWORD) {
      const response = NextResponse.json({ success: true });
      setAdminCookie(response); // httpOnly cookie set et
      return response;
    } else {
      return NextResponse.json({ error: "Yanlış şifre." }, { status: 401 });
    }
  } catch {
    return NextResponse.json(
      { error: "Giriş işlemi başarısız." },
      { status: 500 }
    );
  }
}
