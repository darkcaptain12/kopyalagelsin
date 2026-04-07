import { NextRequest, NextResponse } from "next/server";
import { readFile } from "fs/promises";
import { existsSync } from "fs";
import path from "path";
import os from "os";

/**
 * @deprecated This route is deprecated. New orders use Vercel Blob Storage (pdfUrl).
 * This route is kept only for backward compatibility with old orders that use pdfPath.
 * 
 * New PDF files are stored in Vercel Blob Storage and accessed directly via their public URL.
 * Old PDF files might still be in /tmp (Vercel) or uploads/ (local).
 */
const isVercel = process.env.VERCEL === "1" || !!process.env.VERCEL_ENV;
const UPLOAD_DIR = isVercel 
  ? "/tmp/uploads" 
  : path.join(process.cwd(), "uploads");

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(
  request: NextRequest,
  { params }: { params: { filePath: string } }
) {
  try {
    const filePath = decodeURIComponent(params.filePath);
    const fullPath = path.join(UPLOAD_DIR, filePath);

    // Security: ensure file is within upload directory
    if (!fullPath.startsWith(UPLOAD_DIR)) {
      return NextResponse.json({ error: "Geçersiz dosya yolu." }, { status: 400 });
    }

    if (!existsSync(fullPath)) {
      return NextResponse.json({ 
        error: "Dosya bulunamadı.",
        note: "Bu dosya Vercel Blob Storage'da saklanıyor olabilir. Lütfen pdfUrl kullanın."
      }, { status: 404 });
    }

    const fileBuffer = await readFile(fullPath);

    return new NextResponse(fileBuffer, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${filePath}"`,
      },
    });
  } catch (error: any) {
    console.error("Error serving PDF:", error);
    return NextResponse.json({ error: "Dosya yüklenemedi." }, { status: 500 });
  }
}