import { NextRequest, NextResponse } from "next/server";
import { createUser, getUserByEmail } from "@/lib/usersStore";
import { setSessionCookie } from "@/lib/auth";
import { getConfig } from "@/lib/config";
import { createCoupon } from "@/lib/couponsStore";
import { getUserByReferralCode } from "@/lib/usersStore";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, password, referredByCode } = body;

    // Validation
    if (!name || !email || !password) {
      return NextResponse.json(
        { error: "Ad, e-posta ve şifre gereklidir." },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: "Şifre en az 6 karakter olmalıdır." },
        { status: 400 }
      );
    }

    // Check if email exists
    const existing = await getUserByEmail(email);
    if (existing) {
      return NextResponse.json(
        { error: "Bu e-posta adresi zaten kullanılıyor." },
        { status: 400 }
      );
    }

    // Handle referral
    let referredByUserId: string | null = null;
    if (referredByCode) {
      const referrer = await getUserByReferralCode(referredByCode);
      if (referrer) {
        referredByUserId = referrer.id;
      }
    }

    // Create user
    const user = await createUser({
      name,
      email,
      passwordPlain: password,
      referredByUserId,
    });

    // Create welcome coupon if enabled
    const config = await getConfig();
    if (config.marketing.enableMemberWelcomeDiscount) {
      const now = new Date();
      const validFrom = config.marketing.memberWelcomeValidFrom
        ? new Date(config.marketing.memberWelcomeValidFrom)
        : now;
      const validUntil = config.marketing.memberWelcomeValidUntil
        ? new Date(config.marketing.memberWelcomeValidUntil)
        : null;

      // Check if current time is within valid range
      const isValidTime =
        (!config.marketing.memberWelcomeValidFrom || now >= validFrom) &&
        (!config.marketing.memberWelcomeValidUntil || now <= validUntil!);

      if (isValidTime) {
        await createCoupon({
          userId: user.id,
          type: "WELCOME",
          discountPercent: config.marketing.memberWelcomeDiscountPercent,
          validFrom: validFrom.toISOString(),
          validUntil: validUntil?.toISOString() || null,
        });
      }
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
    console.error("Registration error:", error);
    return NextResponse.json(
      { error: error.message || "Kayıt başarısız oldu." },
      { status: 500 }
    );
  }
}

