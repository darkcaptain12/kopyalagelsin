import { put } from "@vercel/blob";

export interface UploadedPdfResult {
  url: string;
  name: string;
  size: number;
  buffer: Buffer;
}

/**
 * Upload PDF file to Vercel Blob Storage
 * 
 * @param file - The PDF File object from FormData
 * @param prefix - Optional prefix for the blob path (default: "pdfs")
 * @returns Uploaded PDF information including public URL
 */
export async function uploadOrderPdf(
  file: File,
  prefix: string = "pdfs"
): Promise<UploadedPdfResult> {
  if (!file) {
    throw new Error("PDF dosyası bulunamadı.");
  }

  if (file.type !== "application/pdf") {
    throw new Error("Sadece PDF dosyası kabul edilir.");
  }

  if (file.size > 50 * 1024 * 1024) {
    throw new Error("Dosya boyutu 50 MB'dan küçük olmalıdır.");
  }

  // Convert File to Buffer
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  // Generate unique filename
  const timestamp = Date.now();
  const sanitizedFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, "_");
  const blobPath = `${prefix}/${timestamp}-${sanitizedFileName}`;

  try {
    // Upload to Vercel Blob Storage
    const blob = await put(blobPath, buffer, {
      access: "public",
      contentType: file.type || "application/pdf",
    });

    return {
      url: blob.url,
      name: file.name,
      size: buffer.length,
      buffer,
    };
  } catch (error: any) {
    console.error("Error uploading PDF to Vercel Blob:", error);
    throw new Error(`PDF yükleme hatası: ${error.message || "Bilinmeyen hata"}`);
  }
}
