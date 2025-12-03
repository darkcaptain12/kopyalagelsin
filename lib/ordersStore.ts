import { readFile, writeFile, mkdir } from "fs/promises";
import { existsSync } from "fs";
import path from "path";
import { v4 as uuidv4 } from "uuid";
import { readBlobJson, writeBlobJson } from "./blobStorage";

export type PaytrStatus = "pending" | "paid" | "failed";

export interface Order {
  id: string;
  createdAt: string;
  userId?: string | null; // User ID if logged in
  customerName: string;
  email: string;
  phone: string;
  address: string;
  notes?: string;
  size: "A4" | "A3";
  color: "siyah_beyaz" | "renkli";
  side: "tek" | "cift";
  bindingType: "none" | "spiral" | "american";
  ciltCount: number;
  pageCount: number;
  pdfUrl: string; // Vercel Blob Storage URL
  pdfName?: string; // Original PDF filename
  pdfSize?: number; // PDF file size in bytes
  pdfPath?: string; // Deprecated: kept for backward compatibility, use pdfUrl instead
  printCost: number;
  bindingCost: number;
  shippingCost: number;
  subtotal: number; // Before discount and KDV
  discountPercent?: number; // Applied discount percentage
  discountAmount?: number; // Applied discount amount
  appliedCouponCode?: string | null; // Coupon code used
  tax: number; // KDV amount
  totalAmount: number; // Final amount after discount and KDV
  paytrStatus: PaytrStatus;
  paytrTransactionId?: string;
}

// Storage configuration
// On Vercel, file system is read-only, so use Blob Storage
// Check multiple Vercel environment indicators
const isVercel = 
  process.env.VERCEL === "1" || 
  !!process.env.VERCEL_ENV ||
  process.env.VERCEL_URL !== undefined ||
  (typeof process.cwd === "function" && process.cwd().includes("/var/task")); // Vercel uses /var/task

// Force Blob Storage on Vercel, allow override via env var for local testing
const USE_BLOB_STORAGE = isVercel || process.env.USE_BLOB_STORAGE === "1";

// Log storage method for debugging
if (typeof window === "undefined") { // Server-side only
  console.log("Orders storage configuration:", {
    isVercel,
    useBlobStorage: USE_BLOB_STORAGE,
    vercelEnv: process.env.VERCEL,
    vercelEnvVar: process.env.VERCEL_ENV,
    cwd: process.cwd(),
  });
}

// Local file system paths (for local development fallback)
const DATA_DIR = path.join(process.cwd(), "data");
const ORDERS_FILE = path.join(DATA_DIR, "orders.json");
const BLOB_FILENAME = "orders.json";

// Local file system helpers (for local dev only)
async function ensureDataDir(): Promise<void> {
  if (USE_BLOB_STORAGE) return; // Skip on Vercel
  
  if (!existsSync(DATA_DIR)) {
    await mkdir(DATA_DIR, { recursive: true });
  }
}

async function readOrdersFileLocal(): Promise<Order[]> {
  if (USE_BLOB_STORAGE) {
    throw new Error("Local file system should not be used when USE_BLOB_STORAGE is enabled");
  }
  
  await ensureDataDir();
  
  if (!existsSync(ORDERS_FILE)) {
    return [];
  }

  try {
    const content = await readFile(ORDERS_FILE, "utf-8");
    return JSON.parse(content);
  } catch (error) {
    console.error("Error reading orders file:", error);
    return [];
  }
}

async function writeOrdersFileLocal(orders: Order[]): Promise<void> {
  if (USE_BLOB_STORAGE) {
    throw new Error("Local file system should not be used when USE_BLOB_STORAGE is enabled");
  }
  
  await ensureDataDir();
  await writeFile(ORDERS_FILE, JSON.stringify(orders, null, 2), "utf-8");
}

// Blob Storage helpers (for Vercel production)
async function readOrdersBlob(): Promise<Order[]> {
  try {
    const orders = await readBlobJson<Order[]>(BLOB_FILENAME, {
      prefix: "app-data",
    });
    return orders || [];
  } catch (error: any) {
    console.error("Error reading orders from blob storage:", error);
    // If blob doesn't exist yet, return empty array
    if (error.statusCode === 404 || error.message?.includes("not found")) {
      return [];
    }
    // For other errors, still return empty array to prevent crashes
    return [];
  }
}

async function writeOrdersBlob(orders: Order[]): Promise<void> {
  try {
    await writeBlobJson(BLOB_FILENAME, orders, {
      prefix: "app-data",
    });
  } catch (error: any) {
    console.error("Error writing orders to blob storage:", error);
    throw new Error(`Sipariş kaydedilemedi: ${error.message || "Bilinmeyen hata"}`);
  }
}

// Unified read/write functions that switch based on environment
async function readOrdersFile(): Promise<Order[]> {
  if (USE_BLOB_STORAGE) {
    return await readOrdersBlob();
  } else {
    return await readOrdersFileLocal();
  }
}

async function writeOrdersFile(orders: Order[]): Promise<void> {
  if (USE_BLOB_STORAGE) {
    await writeOrdersBlob(orders);
  } else {
    await writeOrdersFileLocal(orders);
  }
}

export async function getAllOrders(): Promise<Order[]> {
  return await readOrdersFile();
}

export async function getOrderById(id: string): Promise<Order | null> {
  const orders = await readOrdersFile();
  return orders.find((o) => o.id === id) || null;
}

export async function getOrdersByUserId(userId: string): Promise<Order[]> {
  const orders = await readOrdersFile();
  return orders.filter((o) => o.userId === userId).sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

export async function createOrder(order: Omit<Order, "id" | "createdAt">): Promise<Order> {
  const orders = await readOrdersFile();
  const newOrder: Order = {
    ...order,
    id: uuidv4(),
    createdAt: new Date().toISOString(),
  };
  orders.push(newOrder);
  await writeOrdersFile(orders);
  return newOrder;
}

export async function updateOrderStatus(
  id: string,
  status: PaytrStatus,
  transactionId?: string
): Promise<Order | null> {
  const orders = await readOrdersFile();
  const orderIndex = orders.findIndex((o) => o.id === id);
  
  if (orderIndex === -1) {
    return null;
  }

  orders[orderIndex].paytrStatus = status;
  if (transactionId) {
    orders[orderIndex].paytrTransactionId = transactionId;
  }
  
  await writeOrdersFile(orders);
  return orders[orderIndex];
}
