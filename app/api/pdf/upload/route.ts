import { NextRequest, NextResponse } from "next/server";
import { uploadOrderPdf } from "@/lib/pdfStorage";
import { checkRateLimit, getIpFromHeaders } from "@/lib/rateLimit";
import pdf from "pdf-parse";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 30; // Vercel için max duration

const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50 MB

/**
 * PDF Upload API Route
 *
 * 1. multipart/form-data ile PDF alır
 * 2. Vercel Blob Storage'a yükler
 * 3. Sayfa sayısını hesaplar
 * 4. URL ve metadata döner
 */
export async function POST(request: NextRequest) {
  // Rate limiting: 20 upload / 10 dakika / IP
  const ip = getIpFromHeaders(request.headers);
  const rl = checkRateLimit(`pdf:upload:${ip}`, 20, 10 * 60 * 1000);
  if (!rl.allowed) {
    return NextResponse.json(
      { error: `Çok fazla yükleme isteği. ${rl.retryAfter} saniye bekleyin.` },
      { status: 429 }
    );
  }

  try {
    const formData = await request.formData();
    const file = formData.get("pdf") as File | null;

    if (!file) {
      return NextResponse.json({ error: "PDF dosyası bulunamadı." }, { status: 400 });
    }

    // Tip kontrolü — sadece PDF kabul et
    if (file.type !== "application/pdf" && !file.name?.toLowerCase().endsWith(".pdf")) {
      return NextResponse.json(
        { error: "Yalnızca PDF formatı desteklenmektedir." },
        { status: 400 }
      );
    }

    // Boyut kontrolü
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: "Dosya boyutu 50 MB sınırını aşıyor." },
        { status: 400 }
      );
    }

    if (file.size === 0) {
      return NextResponse.json({ error: "Dosya boş." }, { status: 400 });
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
      { error: "PDF yükleme başarısız oldu." },
      { status: 500 }
    );
  }
}