import type { AppConfig } from "./config";
import type { User } from "./usersStore";
import type { Coupon } from "./couponsStore";

export interface DiscountContext {
  baseAmount: number; // print + binding + shipping
  user: User | null;
  coupon: Coupon | null;
  config: AppConfig;
  now: Date;
}

export interface DiscountResult {
  applied: boolean;
  discountPercent: number;
  discountAmount: number;
  reason: "WELCOME" | "REFERRAL" | "COUPON" | null;
  appliedCouponCode: string | null;
}

function isCouponValid(coupon: Coupon, now: Date): boolean {
  if (!coupon.isActive) return false;
  if (coupon.usedCount >= coupon.maxUses) return false;
  
  const nowTime = now.getTime();
  const validFromTime = new Date(coupon.validFrom).getTime();
  
  if (nowTime < validFromTime) return false;
  
  if (coupon.validUntil !== null) {
    const validUntilTime = new Date(coupon.validUntil).getTime();
    if (nowTime > validUntilTime) return false;
  }
  
  return true;
}

export function calculateDiscount(context: DiscountContext): DiscountResult {
  const { baseAmount, user, coupon, config, now } = context;

  // No discount if no coupon provided
  if (!coupon) {
    return {
      applied: false,
      discountPercent: 0,
      discountAmount: 0,
      reason: null,
      appliedCouponCode: null,
    };
  }

  // Validate coupon belongs to user
  if (user && coupon.userId !== user.id) {
    return {
      applied: false,
      discountPercent: 0,
      discountAmount: 0,
      reason: null,
      appliedCouponCode: null,
    };
  }

  // Validate coupon is valid
  if (!isCouponValid(coupon, now)) {
    return {
      applied: false,
      discountPercent: 0,
      discountAmount: 0,
      reason: null,
      appliedCouponCode: null,
    };
  }

  // Calculate discount
  const discountPercent = coupon.discountPercent;
  const discountAmount = Math.round((baseAmount * (discountPercent / 100)) * 100) / 100;

  return {
    applied: true,
    discountPercent,
    discountAmount,
    reason: coupon.type === "WELCOME" ? "WELCOME" : coupon.type === "REFERRAL" ? "REFERRAL" : "COUPON",
    appliedCouponCode: coupon.code,
  };
}

