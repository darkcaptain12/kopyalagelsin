import { Redis } from "@upstash/redis";

/**
 * JSON data storage via Upstash Redis
 * Replaces Vercel Blob for config, orders, users, coupons
 * PDF files still use Vercel Blob (pdfStorage.ts)
 */

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

const BLOB_PREFIX = process.env.BLOB_STORAGE_PREFIX || "app-data";

export interface BlobJsonStorageOptions {
  prefix?: string;
}

/**
 * Read JSON data from Redis
 */
export async function readBlobJson<T>(
  filename: string,
  options?: BlobJsonStorageOptions
): Promise<T | null> {
  const prefix = options?.prefix || BLOB_PREFIX;
  const key = `${prefix}:${filename}`;
  try {
    const data = await redis.get<T>(key);
    return data ?? null;
  } catch (error: any) {
    console.error(`Error reading Redis key ${key}:`, error);
    throw error;
  }
}

/**
 * Write JSON data to Redis
 * Returns the key as identifier (replaces blob URL)
 */
export async function writeBlobJson<T>(
  filename: string,
  data: T,
  options?: BlobJsonStorageOptions
): Promise<string> {
  const prefix = options?.prefix || BLOB_PREFIX;
  const key = `${prefix}:${filename}`;
  try {
    await redis.set(key, data);
    return key;
  } catch (error: any) {
    console.error(`Error writing Redis key ${key}:`, error);
    throw error;
  }
}

/**
 * Check if a key exists in Redis
 */
export async function blobExists(
  filename: string,
  options?: BlobJsonStorageOptions
): Promise<boolean> {
  const prefix = options?.prefix || BLOB_PREFIX;
  const key = `${prefix}:${filename}`;
  try {
    const exists = await redis.exists(key);
    return exists === 1;
  } catch (error: any) {
    console.error(`Error checking Redis key ${key}:`, error);
    return false;
  }
}
