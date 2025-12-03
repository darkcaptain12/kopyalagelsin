import { NextRequest, NextResponse } from "next/server";
import { uploadOrderPdf } from "@/lib/pdfStorage";
import pdf from "pdf-parse";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 30; // Vercel için max duration

/**
 * PDF Upload API Route
 * 
 * This route:
 * 1. Receives PDF file via multipart/form-data
 * 2. Uploads it to Vercel Blob Storage
 * 3. Calculates page count
 * 4. Returns PDF URL and metadata
 */
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("pdf") as File | null;

    if (!file) {
      return NextResponse.json({ error: "PDF dosyası bulunamadı." }, { status: 400 });
    }

    // Upload PDF to Vercel Blob Storage
    const uploadedPdf = await uploadOrderPdf(file);

    // Calculate page count from buffer (in-memory)
    let pageCount = 0;
    try {
      const pdfData = await pdf(uploadedPdf.buffer);
      pageCount = pdfData.numpages;
    } catch (pdfError: any) {
      console.error("Error parsing PDF for page count:", pdfError);
      // Continue even if page count detection fails - can be set manually later
      pageCount = 0;
    }

    return NextResponse.json({
      success: true,
      pdfUrl: uploadedPdf.url,
      pdfName: uploadedPdf.name,
      pdfSize: uploadedPdf.size,
      pageCount,
      fileId: uploadedPdf.name.split(".")[0], // Extract ID from filename if needed
    });
  } catch (error: any) {
    console.error("Error uploading PDF:", error);
    return NextResponse.json(
      {
        error: error.message || "PDF yükleme başarısız oldu.",
        details: error.stack,
      },
      { status: 500 }
    );
  }
}