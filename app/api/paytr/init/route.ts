import { NextRequest, NextResponse } from "next/server";
import { getConfig } from "@/lib/config";
import { calculateTotals, type Size, type Color, type Side, type BindingType } from "@/lib/pricing";
import { createOrder } from "@/lib/ordersStore";
import { getSessionFromRequest } from "@/lib/auth";
import { getUserById } from "@/lib/usersStore";
import { getCouponByCode } from "@/lib/couponsStore";
import { calculateDiscount, type DiscountResult } from "@/lib/discounts";
import { createPaytrIframeToken, getClientIp } from "@/lib/paytr";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface RequestBody {
  size: Size;
  color: Color;
  side: Side;
  bindingType: BindingType;
  ciltCount: number;
  pageCount: number;
  pdfUrl: string; // Vercel Blob Storage URL
  pdfName?: string; // Original PDF filename
  pdfSize?: number; // PDF file size in bytes
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
    const body: RequestBody = await request.json();
    const config = await getConfig();
    const session = getSessionFromRequest(request);

    // Get user if logged in
    let user = null;
    if (session) {
      user = await getUserById(session.userId);
    }

    // Re-calculate price on backend for validation
    const calculatedBreakdown = calculateTotals(
      config.pricing,
      {
        size: body.size,
        color: body.color,
        side: body.side,
        bindingType: body.bindingType,
        ciltCount: body.ciltCount || 0,
        pageCount: body.pageCount,
      },
      config.season || null
    );

    // Base amount after season multiplier (use subtotal from breakdown which already includes season multiplier)
    const baseAmount = calculatedBreakdown.subtotal;

    // Apply discount if coupon provided
    let discountResult: DiscountResult = {
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
      pdfUrl: body.pdfUrl,
      pdfName: body.pdfName,
      pdfSize: body.pdfSize,
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
    // PayTR requires merchant_oid to be alphanumeric only (no special characters)
    // UUID format contains dashes, so we remove all non-alphanumeric characters
    let merchantOid = order.id.replace(/[^a-zA-Z0-9]/g, "").toLowerCase();
    
    // PayTR merchant_oid must be between 1-64 characters
    if (merchantOid.length > 64) {
      merchantOid = merchantOid.substring(0, 64);
    }
    
    // Validate merchant_oid is not empty
    if (!merchantOid || merchantOid.length === 0) {
      console.error("Invalid merchant_oid after cleaning:", order.id);
      return NextResponse.json(
        { error: "Sipariş ID'si oluşturulamadı. Lütfen tekrar deneyin." },
        { status: 500 }
      );
    }
    
    // Get client IP
    const clientIp = getClientIp(request);
    
    // Get base URL from request (for local development)
    const requestOrigin = request.headers.get("origin");
    const requestHost = request.headers.get("host");
    const protocol = request.headers.get("x-forwarded-proto") || (requestOrigin?.startsWith("https") ? "https" : "http");
    const baseUrl = requestOrigin || (requestHost ? `${protocol}://${requestHost}` : null);
    
    // Prepare basket for PayTR
    // PayTR expects: [[productName, unitPriceAsString, quantity], ...]
    // Prices should be in TL (not kuruş) for basket items
    const basket = [
      {
        name: "Dijital Çıktı Siparişi",
        price: finalTotal, // Total amount in TL
        quantity: 1,
      },
    ];
    
    // Create PayTR iframe token
    try {
      const paytrResult = await createPaytrIframeToken({
        merchantOid,
        userIp: clientIp,
        email: body.email,
        userName: body.customerName.trim(),
        userAddress: body.address.trim(),
        userPhone: body.phone.trim(),
        basket,
        paymentAmount: finalTotal, // Total in TL
        currency: "TL",
        noInstallment: 0,
        maxInstallment: 0,
        lang: "tr",
        baseUrl: baseUrl || undefined, // Pass base URL from request
      });
      
      return NextResponse.json({
        token: paytrResult.token,
        merchantOid: merchantOid,
        orderId: order.id,
      });
    } catch (paytrError: any) {
      console.error("PayTR token creation error:", paytrError);
      return NextResponse.json(
        { error: paytrError.message || "Ödeme başlatılamadı. Lütfen tekrar deneyin." },
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