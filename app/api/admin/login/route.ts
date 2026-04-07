import { NextRequest, NextResponse } from "next/server";
import { checkRateLimit, getIpFromHeaders } from "@/lib/rateLimit";

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;

export async function POST(request: NextRequest) {
  // Rate limiting: 5 deneme / 10 dakika / IP (admin brute force koruması)
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
      return NextResponse.json({ success: true });
    } else {
      return NextResponse.json({ error: "Yanlış şifre." }, { status: 401 });
    }
  } catch (error: any) {
    return NextResponse.json(
      { error: "Giriş işlemi başarısız." },
      { status: 500 }
    );
  }
}

