import { NextRequest, NextResponse } from "next/server";
import { getUserByEmail, verifyPassword } from "@/lib/usersStore";
import { setSessionCookie } from "@/lib/auth";
import { checkRateLimit, getIpFromHeaders } from "@/lib/rateLimit";

export async function POST(request: NextRequest) {
  // Rate limiting: 10 deneme / 15 dakika / IP
  const ip = getIpFromHeaders(request.headers);
  const rl = checkRateLimit(`auth:login:${ip}`, 10, 15 * 60 * 1000);
  if (!rl.allowed) {
    return NextResponse.json(
      { error: `Çok fazla deneme yapıldı. ${rl.retryAfter} saniye bekleyin.` },
      { status: 429 }
    );
  }

  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: "E-posta ve şifre gereklidir." },
        { status: 400 }
      );
    }

    const user = await getUserByEmail(email);
    if (!user) {
      return NextResponse.json(
        { error: "E-posta veya şifre hatalı." },
        { status: 401 }
      );
    }

    const isValid = await verifyPassword(user, password);
    if (!isValid) {
      return NextResponse.json(
        { error: "E-posta veya şifre hatalı." },
        { status: 401 }
      );
    }

    // Create session
    const response = NextResponse.json({
      success: true,
      user: { id: user.id, name: user.name, email: user.email },
    });

    setSessionCookie(response, {
      userId: user.id,
      email: user.email,
    });

    return response;
  } catch (error: any) {
    console.error("Login error:", error);
    return NextResponse.json(
      { error: "Giriş başarısız oldu." },
      { status: 500 }
    );
  }
}

