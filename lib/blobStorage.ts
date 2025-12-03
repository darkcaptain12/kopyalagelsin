import { put, list } from "@vercel/blob";

/**
 * Helper for storing JSON data in Vercel Blob Storage
 * Used for orders, users, coupons, and config files
 * 
 * Note: @vercel/blob v2.0.0 doesn't export 'get' method.
 * We use 'list' to find blobs by prefix, then fetch by URL.
 */

const BLOB_PREFIX = process.env.BLOB_STORAGE_PREFIX || "app-data";

export interface BlobJsonStorageOptions {
  prefix?: string;
}

/**
 * Read JSON data from Vercel Blob Storage
 * Uses list to find the blob by path, then fetches the URL
 */
export async function readBlobJson<T>(
  filename: string,
  options?: BlobJsonStorageOptions
): Promise<T | null> {
  try {
    const prefix = options?.prefix || BLOB_PREFIX;
    const blobPath = `${prefix}/${filename}`;
    
    // List blobs with the prefix to find our file
    const { blobs } = await list({
      prefix: `${prefix}/`,
      limit: 100, // Should be enough for JSON files
    });
    
    if (!blobs || blobs.length === 0) {
      return null;
    }
    
    // Find exact match by pathname
    const blob = blobs.find(b => {
      // Match exact path or path with same filename
      return b.pathname === blobPath || b.pathname.endsWith(`/${filename}`);
    });
    
    if (!blob) {
      return null;
    }
    
    // Fetch the JSON content from the blob URL
    const response = await fetch(blob.url);
    if (!response.ok) {
      if (response.status === 404) {
        return null;
      }
      throw new Error(`Failed to fetch blob: ${response.statusText}`);
    }
    
    const text = await response.text();
    return JSON.parse(text) as T;
  } catch (error: any) {
    // If blob doesn't exist, return null (not an error)
    if (error.statusCode === 404 || 
        error.message?.includes("not found") || 
        error.message?.includes("404") ||
        error.message?.includes("Failed to fetch")) {
      return null;
    }
    console.error(`Error reading blob ${filename}:`, error);
    throw error;
  }
}

/**
 * Write JSON data to Vercel Blob Storage
 * Returns the blob URL for future reference
 */
export async function writeBlobJson<T>(
  filename: string,
  data: T,
  options?: BlobJsonStorageOptions
): Promise<string> {
  try {
    const prefix = options?.prefix || BLOB_PREFIX;
    const blobPath = `${prefix}/${filename}`;
    const jsonString = JSON.stringify(data, null, 2);
    const buffer = Buffer.from(jsonString, "utf-8");
    
    // Use put without addRandomSuffix to overwrite existing file
    const blob = await put(blobPath, buffer, {
      access: "public",
      contentType: "application/json",
      addRandomSuffix: false,
    });
    
    return blob.url;
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
    const prefix = options?.prefix || BLOB_PREFIX;
    const blobPath = `${prefix}/${filename}`;
    
    const { blobs } = await list({
      prefix: `${prefix}/`,
      limit: 100,
    });
    
    if (!blobs || blobs.length === 0) {
      return false;
    }
    
    return blobs.some(b => 
      b.pathname === blobPath || b.pathname.endsWith(`/${filename}`)
    );
  } catch (error: any) {
    if (error.statusCode === 404 || error.message?.includes("not found")) {
      return false;
    }
    throw error;
  }
}
