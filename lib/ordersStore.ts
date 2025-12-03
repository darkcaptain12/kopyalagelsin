import { readFile, writeFile, mkdir } from "fs/promises";
import { existsSync } from "fs";
import path from "path";
import { v4 as uuidv4 } from "uuid";

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

const DATA_DIR = path.join(process.cwd(), "data");
const ORDERS_FILE = path.join(DATA_DIR, "orders.json");

async function ensureDataDir(): Promise<void> {
  if (!existsSync(DATA_DIR)) {
    await mkdir(DATA_DIR, { recursive: true });
  }
}

async function readOrdersFile(): Promise<Order[]> {
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

async function writeOrdersFile(orders: Order[]): Promise<void> {
  await ensureDataDir();
  await writeFile(ORDERS_FILE, JSON.stringify(orders, null, 2), "utf-8");
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

