import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { updateOrderStatus, getOrderById } from "@/lib/ordersStore";
import { incrementCouponUsage } from "@/lib/couponsStore";
import { getUserById } from "@/lib/usersStore";
import { getConfig } from "@/lib/config";
import { createCoupon } from "@/lib/couponsStore";
import { getAllOrders } from "@/lib/ordersStore";

const PAYTR_MERCHANT_KEY = process.env.PAYTR_MERCHANT_KEY || "";
const PAYTR_MERCHANT_SALT = process.env.PAYTR_MERCHANT_SALT || "";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const merchantOid = formData.get("merchant_oid") as string;
    const status = formData.get("status") as string;
    const totalAmount = formData.get("total_amount") as string;
    const hash = formData.get("hash") as string;
    const failedReasonCode = formData.get("failed_reason_code") as string;
    const failedReasonMsg = formData.get("failed_reason_msg") as string;
    const testMode = formData.get("test_mode") as string;
    const paymentType = formData.get("payment_type") as string;
    const currency = formData.get("currency") as string;
    const paymentAmount = formData.get("payment_amount") as string;

    // Verify hash
    const hashStr = `${merchantOid}${PAYTR_MERCHANT_SALT}${status}${totalAmount}`;
    const calculatedHash = crypto
      .createHmac("sha256", PAYTR_MERCHANT_KEY)
      .update(hashStr)
      .digest("base64");

    if (hash !== calculatedHash) {
      console.error("PayTR hash verification failed");
      return new NextResponse("FAILED", { status: 400 });
    }

    // Get order before updating status (needed for referral check)
    const order = await getOrderById(merchantOid);
    if (!order) {
      return new NextResponse("ORDER_NOT_FOUND", { status: 404 });
    }
    
    // Update order status
    if (status === "success") {
      await updateOrderStatus(merchantOid, "paid", merchantOid);

      // Increment coupon usage if coupon was used
      if (order.appliedCouponCode) {
        await incrementCouponUsage(order.appliedCouponCode);
      }

      // Handle referral coupon generation
      if (order.userId) {
        const user = await getUserById(order.userId);
        if (user && user.referredByUserId) {
          // Check if this is the user's first paid order
          // Note: We check BEFORE updating status, so we need to count existing paid orders
          const allOrders = await getAllOrders();
          const userPaidOrders = allOrders.filter(
            (o) => o.userId === user.id && o.paytrStatus === "paid" && o.id !== order.id
          );

          // Only generate referral coupon if this is the first paid order (no previous paid orders)
          if (userPaidOrders.length === 0) {
            const referrer = await getUserById(user.referredByUserId);
            if (referrer) {
              const config = await getConfig();
              if (config.marketing.enableReferralProgram) {
                const now = new Date();
                const validFrom = config.marketing.referralValidFrom
                  ? new Date(config.marketing.referralValidFrom)
                  : now;
                const validUntil = config.marketing.referralValidUntil
                  ? new Date(config.marketing.referralValidUntil)
                  : null;

                // Check if current time is within valid range
                const isValidTime =
                  (!config.marketing.referralValidFrom || now >= validFrom) &&
                  (!config.marketing.referralValidUntil || now <= validUntil!);

                if (isValidTime) {
                  await createCoupon({
                    userId: referrer.id,
                    type: "REFERRAL",
                    discountPercent: config.marketing.referralDiscountPercent,
                    validFrom: validFrom.toISOString(),
                    validUntil: validUntil?.toISOString() || null,
                  });
                }
              }
            }
          }
        }
      }
    } else {
      await updateOrderStatus(merchantOid, "failed");
    }

    // PayTR expects "OK" as plain text response
    return new NextResponse("OK", { status: 200 });
  } catch (error: any) {
    console.error("Error processing PayTR callback:", error);
    return new NextResponse("ERROR", { status: 500 });
  }
}

