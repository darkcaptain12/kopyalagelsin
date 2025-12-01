import { readFile, writeFile, mkdir } from "fs/promises";
import { existsSync } from "fs";
import path from "path";

export type CouponType = "WELCOME" | "REFERRAL";

export interface Coupon {
  code: string; // must follow KOPYALAGELSİN pattern
  userId: string; // owner user id
  type: CouponType;
  discountPercent: number; // e.g. 5 for %5
  validFrom: string; // ISO date
  validUntil: string | null;
  isActive: boolean;
  maxUses: number; // ALWAYS 1 (single-use per code)
  usedCount: number; // increments when used
  createdAt: string; // ISO
}

const DATA_DIR = path.join(process.cwd(), "data");
const COUPONS_FILE = path.join(DATA_DIR, "coupons.json");

async function ensureDataDir(): Promise<void> {
  if (!existsSync(DATA_DIR)) {
    await mkdir(DATA_DIR, { recursive: true });
  }
}

async function readCouponsFile(): Promise<Coupon[]> {
  await ensureDataDir();

  if (!existsSync(COUPONS_FILE)) {
    return [];
  }

  try {
    const content = await readFile(COUPONS_FILE, "utf-8");
    return JSON.parse(content);
  } catch (error) {
    console.error("Error reading coupons file:", error);
    return [];
  }
}

async function writeCouponsFile(coupons: Coupon[]): Promise<void> {
  await ensureDataDir();
  await writeFile(COUPONS_FILE, JSON.stringify(coupons, null, 2), "utf-8");
}

function generateCouponCode(discountPercent: number): string {
  const prefix = "KOPYALAGELSİN";
  const percentStr = discountPercent.toString();
  // Generate random 4-digit suffix, ensuring last char is a digit
  const randomSuffix = Math.floor(1000 + Math.random() * 9000).toString();
  return `${prefix}${percentStr}${randomSuffix}`;
}

export async function getAllCoupons(): Promise<Coupon[]> {
  return await readCouponsFile();
}

export async function getCouponByCode(code: string): Promise<Coupon | null> {
  const coupons = await readCouponsFile();
  return coupons.find((c) => c.code === code) || null;
}

export async function getUserCoupons(userId: string): Promise<Coupon[]> {
  const coupons = await readCouponsFile();
  return coupons.filter((c) => c.userId === userId);
}

export async function createCoupon(input: {
  userId: string;
  type: CouponType;
  discountPercent: number;
  validFrom: string;
  validUntil: string | null;
}): Promise<Coupon> {
  const coupons = await readCouponsFile();

  // Generate unique code
  let code = generateCouponCode(input.discountPercent);
  let attempts = 0;
  while (coupons.some((c) => c.code === code) && attempts < 10) {
    code = generateCouponCode(input.discountPercent);
    attempts++;
  }

  const newCoupon: Coupon = {
    code,
    userId: input.userId,
    type: input.type,
    discountPercent: input.discountPercent,
    validFrom: input.validFrom,
    validUntil: input.validUntil,
    isActive: true,
    maxUses: 1,
    usedCount: 0,
    createdAt: new Date().toISOString(),
  };

  coupons.push(newCoupon);
  await writeCouponsFile(coupons);

  return newCoupon;
}

export async function incrementCouponUsage(code: string): Promise<void> {
  const coupons = await readCouponsFile();
  const coupon = coupons.find((c) => c.code === code);

  if (coupon) {
    coupon.usedCount += 1;
    await writeCouponsFile(coupons);
  }
}

export async function deactivateCoupon(code: string): Promise<void> {
  const coupons = await readCouponsFile();
  const coupon = coupons.find((c) => c.code === code);

  if (coupon) {
    coupon.isActive = false;
    await writeCouponsFile(coupons);
  }
}

