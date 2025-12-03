import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import { existsSync } from "fs";
import path from "path";
import { v4 as uuidv4 } from "uuid";

// Vercel'de /tmp dizini kullanılabilir, local'de uploads dizini kullan
// Vercel serverless ortamında dosya sistemi kalıcı değildir
const isVercel = process.env.VERCEL === "1" || !!process.env.VERCEL_ENV;
// Vercel'de sadece /tmp dizini yazılabilir (geçici dosyalar için)
const UPLOAD_DIR = isVercel 
  ? "/tmp/uploads" 
  : path.join(process.cwd(), "uploads");

export const dynamic = "force-dynamic";
export const maxDuration = 30; // Vercel için max duration

async function ensureUploadDir(): Promise<void> {
  if (!existsSync(UPLOAD_DIR)) {
    try {
      await mkdir(UPLOAD_DIR, { recursive: true });
    } catch (error: any) {
      console.error("Error creating upload directory:", error);
      // Vercel'de /tmp dizini otomatik oluşturulur, hata olmamalı
      if (!isVercel) {
        throw error;
      }
    }
  }
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("pdf") as File;

    if (!file) {
      return NextResponse.json({ error: "PDF dosyası bulunamadı." }, { status: 400 });
    }

    if (file.type !== "application/pdf") {
      return NextResponse.json({ error: "Sadece PDF dosyası kabul edilir." }, { status: 400 });
    }

    if (file.size > 50 * 1024 * 1024) {
      return NextResponse.json(
        { error: "Dosya boyutu 50 MB'dan küçük olmalıdır." },
        { status: 400 }
      );
    }

    await ensureUploadDir();

    const fileId = uuidv4();
    const fileName = `${fileId}.pdf`;
    // For Vercel /tmp, use direct path; for local use path.join
    const filePath = isVercel 
      ? `${UPLOAD_DIR}/${fileName}` 
      : path.join(UPLOAD_DIR, fileName);

    const buffer = Buffer.from(await file.arrayBuffer());
    
    try {
      await writeFile(filePath, buffer);
      console.log(`PDF uploaded successfully: ${filePath} (Vercel: ${isVercel})`);
    } catch (writeError: any) {
      console.error("Error writing file:", {
        error: writeError,
        message: writeError.message,
        code: writeError.code,
        filePath,
        isVercel,
        uploadDir: UPLOAD_DIR,
      });
      
      // Vercel'de /tmp dizinine yazma hatası
      if (isVercel) {
        return NextResponse.json(
          { 
            error: "Dosya yazma hatası. Vercel'de dosya depolama için cloud storage kullanmanız önerilir.",
            details: writeError.message
          },
          { status: 500 }
        );
      }
      throw writeError;
    }

    return NextResponse.json({ 
      filePath: fileName, 
      fileId,
    });
  } catch (error: any) {
    console.error("Error uploading PDF:", error);
    console.error("Error details:", {
      message: error.message,
      code: error.code,
      stack: error.stack,
      isVercel,
      uploadDir: UPLOAD_DIR,
      vercel: process.env.VERCEL,
      vercelEnv: process.env.VERCEL_ENV,
    });
    return NextResponse.json(
      { 
        error: "Dosya yüklenemedi.",
        details: error.message || (isVercel ? "Vercel'de dosya depolama için cloud storage kullanmanız önerilir." : "Bilinmeyen hata")
      },
      { status: 500 }
    );
  }
}