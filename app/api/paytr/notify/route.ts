import { NextRequest, NextResponse } from "next/server";
import { updateOrderStatus, getAllOrders } from "@/lib/ordersStore";
import { incrementCouponUsage } from "@/lib/couponsStore";
import { getUserById } from "@/lib/usersStore";
import { getConfig } from "@/lib/config";
import { createCoupon } from "@/lib/couponsStore";
import { verifyPaytrNotificationHash } from "@/lib/paytr";

export const dynamic = "force-dynamic";

/**
 * PayTR Bildirim URL (Notification Callback)
 * 
 * This endpoint receives asynchronous notifications from PayTR about payment status.
 * It MUST:
 * - Verify the hash to ensure authenticity
 * - Update order status only after verification
 * - Respond with plain text "OK" (no JSON, no HTML)
 * - Handle duplicate notifications idempotently
 * 
 * DO NOT rely on merchant_ok_url for order confirmation; only use this notification.
 */
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    
    // Extract all required fields from PayTR notification
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

    // Log incoming notification for debugging
    console.log("PayTR notification received:", {
      merchantOid,
      status,
      totalAmount,
      testMode,
      paymentType,
      currency,
      paymentAmount,
    });

    // Validate required fields
    if (!merchantOid || !status || !totalAmount || !hash) {
      console.error("PayTR notification missing required fields");
      return new NextResponse("FAILED: Missing required fields", { status: 400 });
    }

    // Verify hash to ensure notification authenticity
    const isValidHash = verifyPaytrNotificationHash({
      merchantOid,
      status,
      totalAmount,
      receivedHash: hash,
    });

    if (!isValidHash) {
      console.error("PayTR hash verification failed", {
        merchantOid,
        status,
        totalAmount,
      });
      // DO NOT return "OK" if hash verification fails
      return new NextResponse("FAILED: Hash verification failed", { status: 400 });
    }

    // Find order by merchant_oid
    // PayTR sends merchant_oid as alphanumeric only (no special characters, lowercase)
    // but our order.id is UUID with dashes, so we need to find order by comparing cleaned versions
    const allOrders = await getAllOrders();
    const cleanMerchantOid = merchantOid.toLowerCase();
    const order = allOrders.find(
      (o) => o.id.replace(/[^a-zA-Z0-9]/g, "").toLowerCase() === cleanMerchantOid
    );
    
    if (!order) {
      console.error(`Order not found for merchant_oid: ${merchantOid}`);
      // Still return "OK" to PayTR to prevent retries for non-existent orders
      return new NextResponse("OK", { status: 200 });
    }
    
    // Use original order.id (with dashes) for updates
    const orderId = order.id;
    
    // Handle idempotency: Only process if order is still pending
    // PayTR may send the same notification multiple times
    if (order.paytrStatus !== "pending") {
      console.log(`Order ${orderId} already processed with status: ${order.paytrStatus}`);
      // Still return "OK" to acknowledge the notification
      return new NextResponse("OK", { status: 200 });
    }
    
    // Update order status based on payment result
    if (status === "success") {
      // Mark order as paid
      await updateOrderStatus(orderId, "paid", merchantOid);

      // Increment coupon usage if coupon was used
      if (order.appliedCouponCode) {
        await incrementCouponUsage(order.appliedCouponCode);
      }

      // Handle referral coupon generation
      if (order.userId) {
        const user = await getUserById(order.userId);
        if (user && user.referredByUserId) {
          // Check if this is the user's first paid order
          // Count existing paid orders excluding current one
          const userPaidOrders = allOrders.filter(
            (o) =>
              o.userId === user.id &&
              o.paytrStatus === "paid" &&
              o.id !== order.id
          );

          // Only generate referral coupon if this is the first paid order
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
      // Mark order as failed
      await updateOrderStatus(orderId, "failed");
      
      // Log failure reason
      console.log(`Order ${orderId} payment failed:`, {
        failedReasonCode,
        failedReasonMsg,
      });
    }

    // PayTR expects "OK" as plain text response (no JSON, no HTML)
    return new NextResponse("OK", { status: 200 });
  } catch (error: any) {
    console.error("Error processing PayTR notification:", error);
    // Still return "OK" to prevent PayTR from retrying indefinitely
    // But log the error for debugging
    return new NextResponse("OK", { status: 200 });
  }
}
