import { NextRequest, NextResponse } from "next/server";

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;

export async function POST(request: NextRequest) {
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

