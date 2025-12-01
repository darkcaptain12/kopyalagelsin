import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { getConfig } from "@/lib/config";
import { calculateTotals, type Size, type Color, type Side, type BindingType } from "@/lib/pricing";
import { createOrder } from "@/lib/ordersStore";
import { getSessionFromRequest } from "@/lib/auth";
import { getUserById } from "@/lib/usersStore";
import { getCouponByCode } from "@/lib/couponsStore";
import { calculateDiscount } from "@/lib/discounts";

const PAYTR_MERCHANT_ID = process.env.PAYTR_MERCHANT_ID || "";
const PAYTR_MERCHANT_KEY = process.env.PAYTR_MERCHANT_KEY || "";
const PAYTR_MERCHANT_SALT = process.env.PAYTR_MERCHANT_SALT || "";
const PAYTR_TEST_MODE = process.env.PAYTR_TEST_MODE === "1";

interface RequestBody {
  size: Size;
  color: Color;
  side: Side;
  bindingType: BindingType;
  ciltCount: number;
  pageCount: number;
  pdfPath: string;
  customerName: string;
  email: string;
  phone: string;
  address: string;
  notes?: string;
  couponCode?: string | null;
  priceBreakdown: {
    printCost: number;
    bindingCost: number;
    shippingCost: number;
    subtotal?: number;
    tax?: number;
    grandTotal: number;
  };
}

export async function POST(request: NextRequest) {
  try {
    if (!PAYTR_MERCHANT_ID || !PAYTR_MERCHANT_KEY || !PAYTR_MERCHANT_SALT) {
      return NextResponse.json(
        { error: "PayTR yapılandırması eksik." },
        { status: 500 }
      );
    }

    const body: RequestBody = await request.json();
    const config = await getConfig();
    const session = getSessionFromRequest(request);

    // Get user if logged in
    let user = null;
    if (session) {
      user = await getUserById(session.userId);
    }

    // Re-calculate price on backend for validation
    const calculatedBreakdown = calculateTotals(config.pricing, {
      size: body.size,
      color: body.color,
      side: body.side,
      bindingType: body.bindingType,
      ciltCount: body.ciltCount || 0,
      pageCount: body.pageCount,
    });

    // Base amount before discount (print + binding + shipping)
    const baseAmount = calculatedBreakdown.printCost + calculatedBreakdown.bindingCost + calculatedBreakdown.shippingCost;

    // Apply discount if coupon provided
    let discountResult = {
      applied: false,
      discountPercent: 0,
      discountAmount: 0,
      reason: null as "WELCOME" | "REFERRAL" | "COUPON" | null,
      appliedCouponCode: null as string | null,
    };

    if (body.couponCode && user) {
      const coupon = await getCouponByCode(body.couponCode);
      if (coupon) {
        discountResult = calculateDiscount({
          baseAmount,
          user,
          coupon,
          config,
          now: new Date(),
        });
      }
    }

    // Calculate final amounts
    const subtotalAfterDiscount = baseAmount - discountResult.discountAmount;
    const kdvAmount = Math.round(subtotalAfterDiscount * config.pricing.kdvRate * 100) / 100;
    const finalTotal = subtotalAfterDiscount + kdvAmount;

    // Validate that frontend and backend prices match (with discount)
    if (Math.abs(finalTotal - body.priceBreakdown.grandTotal) > 0.01) {
      return NextResponse.json(
        { error: "Fiyat hesaplama hatası. Lütfen tekrar deneyin." },
        { status: 400 }
      );
    }

    // Create order with pending status
    const order = await createOrder({
      userId: user?.id || null,
      customerName: body.customerName,
      email: body.email,
      phone: body.phone,
      address: body.address,
      notes: body.notes || "",
      size: body.size,
      color: body.color,
      side: body.side,
      bindingType: body.bindingType,
      ciltCount: body.ciltCount || 0,
      pageCount: body.pageCount,
      pdfPath: body.pdfPath,
      printCost: calculatedBreakdown.printCost,
      bindingCost: calculatedBreakdown.bindingCost,
      shippingCost: calculatedBreakdown.shippingCost,
      subtotal: baseAmount,
      discountPercent: discountResult.applied ? discountResult.discountPercent : undefined,
      discountAmount: discountResult.applied ? discountResult.discountAmount : undefined,
      appliedCouponCode: discountResult.appliedCouponCode,
      tax: kdvAmount,
      totalAmount: finalTotal,
      paytrStatus: "pending",
    });

    // Prepare PayTR payment data
    const merchantOid = order.id;
    const paymentAmount = finalTotal.toFixed(2);
    const currency = "TL";
    const testMode = PAYTR_TEST_MODE ? "1" : "0";

    // Get base URL from request
    const baseUrl = request.headers.get("origin") || "http://localhost:3000";
    const callbackUrl = `${baseUrl}/api/paytr/callback`;
    const returnUrl = `${baseUrl}/success?orderId=${order.id}`;

    // Build hash string
    const hashStr = `${PAYTR_MERCHANT_ID}${merchantOid}${body.email}${paymentAmount}${PAYTR_MERCHANT_SALT}`;
    const hash = crypto.createHash("sha256").update(hashStr).digest("base64");

    // Prepare form data for PayTR
    const paytrData = {
      merchant_id: PAYTR_MERCHANT_ID,
      merchant_key: PAYTR_MERCHANT_KEY,
      merchant_salt: PAYTR_MERCHANT_SALT,
      merchant_oid: merchantOid,
      email: body.email,
      payment_amount: paymentAmount,
      paytr_token: hash,
      currency: currency,
      test_mode: testMode,
      no_installment: "0",
      max_installment: "0",
      user_basket: Buffer.from(
        JSON.stringify([[`Dijital Çıktı Siparişi`, paymentAmount, "1"]])
      ).toString("base64"),
      user_name: body.customerName,
      user_address: body.address,
      user_phone: body.phone,
      user_ip: request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "127.0.0.1",
      callback_url: callbackUrl,
      return_url: returnUrl,
      lang: "tr",
    };

    // Send request to PayTR
    const paytrUrl = "https://www.paytr.com/odeme/api/get-token";
    const formData = new URLSearchParams();
    Object.entries(paytrData).forEach(([key, value]) => {
      formData.append(key, String(value));
    });

    const paytrResponse = await fetch(paytrUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: formData.toString(),
    });

    const paytrResult = await paytrResponse.json();

    if (paytrResult.status === "success") {
      return NextResponse.json({
        token: paytrResult.token,
        redirectUrl: `https://www.paytr.com/odeme/guvenli/${paytrResult.token}`,
        orderId: order.id,
      });
    } else {
      return NextResponse.json(
        { error: paytrResult.reason || "Ödeme başlatılamadı." },
        { status: 400 }
      );
    }
  } catch (error: any) {
    console.error("Error initializing PayTR payment:", error);
    return NextResponse.json(
      { error: error.message || "Ödeme başlatılamadı." },
      { status: 500 }
    );
  }
}
