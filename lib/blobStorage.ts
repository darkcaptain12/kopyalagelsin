import { put, get, del, list } from "@vercel/blob";

/**
 * Helper for storing JSON data in Vercel Blob Storage
 * Used for orders, users, coupons, and config files
 */

const BLOB_PREFIX = process.env.BLOB_STORAGE_PREFIX || "app-data";

export interface BlobJsonStorageOptions {
  prefix?: string;
}

/**
 * Read JSON data from Vercel Blob Storage
 */
export async function readBlobJson<T>(
  filename: string,
  options?: BlobJsonStorageOptions
): Promise<T | null> {
  try {
    const blobPath = `${options?.prefix || BLOB_PREFIX}/${filename}`;
    const blob = await get(blobPath);
    
    if (!blob) {
      return null;
    }
    
    const text = await blob.text();
    return JSON.parse(text) as T;
  } catch (error: any) {
    // If blob doesn't exist, return null (not an error)
    if (error.statusCode === 404 || error.message?.includes("not found")) {
      return null;
    }
    console.error(`Error reading blob ${filename}:`, error);
    throw error;
  }
}

/**
 * Write JSON data to Vercel Blob Storage
 */
export async function writeBlobJson<T>(
  filename: string,
  data: T,
  options?: BlobJsonStorageOptions
): Promise<void> {
  try {
    const blobPath = `${options?.prefix || BLOB_PREFIX}/${filename}`;
    const jsonString = JSON.stringify(data, null, 2);
    const buffer = Buffer.from(jsonString, "utf-8");
    
    // Use put without addRandomSuffix to overwrite existing file
    // Note: Vercel Blob allows overwriting by using the same path
    await put(blobPath, buffer, {
      access: "public",
      contentType: "application/json",
      addRandomSuffix: false,
    });
  } catch (error: any) {
    console.error(`Error writing blob ${filename}:`, error);
    throw error;
  }
}

/**
 * Check if a blob exists
 */
export async function blobExists(
  filename: string,
  options?: BlobJsonStorageOptions
): Promise<boolean> {
  try {
    const blobPath = `${options?.prefix || BLOB_PREFIX}/${filename}`;
    await get(blobPath);
    return true;
  } catch (error: any) {
    if (error.statusCode === 404 || error.message?.includes("not found")) {
      return false;
    }
    throw error;
  }
}
