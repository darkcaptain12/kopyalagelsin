import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import { existsSync } from "fs";
import path from "path";
import { requireAdminAuth } from "@/lib/adminAuth";

export const dynamic = "force-dynamic";
export const maxDuration = 30;

const KATALOG_DIR = path.join(process.cwd(), "public", "kataloglar");
const MAX_SIZE = 100 * 1024 * 1024; // 100 MB

export async function POST(request: NextRequest) {
  const authError = requireAdminAuth(request);
  if (authError) return authError;

  try {
    const formData = await request.formData();
    const file = formData.get("pdf") as File | null;
    const title = ((formData.get("title") as string | null) || "").trim();

    if (!file) {
      return NextResponse.json({ error: "PDF dosyası bulunamadı." }, { status: 400 });
    }

    if (file.type !== "application/pdf" && !file.name.toLowerCase().endsWith(".pdf")) {
      return NextResponse.json({ error: "Sadece PDF kabul edilir." }, { status: 400 });
    }

    if (file.size > MAX_SIZE) {
      return NextResponse.json({ error: "Dosya 100 MB'dan küçük olmalı." }, { status: 400 });
    }

    if (!existsSync(KATALOG_DIR)) {
      await mkdir(KATALOG_DIR, { recursive: true });
    }

    // Dosya adı: verilen başlık varsa kullan, yoksa orijinal adı temizle
    const baseName = title
      ? title.replace(/[^a-zA-Z0-9\-_\s]/g, "").replace(/\s+/g, "_")
      : file.name.replace(/\.pdf$/i, "").replace(/[^a-zA-Z0-9\-_]/g, "_");
    const fileName = `${baseName}.pdf`;
    const filePath = path.join(KATALOG_DIR, fileName);

    const buffer = Buffer.from(await file.arrayBuffer());
    await writeFile(filePath, buffer);

    return NextResponse.json({ success: true, filename: fileName, path: `/kataloglar/${fileName}` });
  } catch (e: any) {
    console.error("Katalog upload error:", e);
    return NextResponse.json({ error: "Yükleme başarısız." }, { status: 500 });
  }
}
