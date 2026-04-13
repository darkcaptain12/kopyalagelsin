import { NextRequest, NextResponse } from "next/server";
import { put } from "@vercel/blob";
import { requireAdminAuth } from "@/lib/adminAuth";
import { readBlobJson, writeBlobJson } from "@/lib/blobStorage";
import type { KatalogFile } from "@/lib/kataloglarData";

export const dynamic = "force-dynamic";
export const maxDuration = 30;

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

    // Determine filename from title or original name
    const baseName = title
      ? title.replace(/[^a-zA-Z0-9\-_\s]/g, "").replace(/\s+/g, "_").trim()
      : file.name.replace(/\.pdf$/i, "").replace(/[^a-zA-Z0-9\-_]/g, "_");
    const filename = `${baseName}.pdf`;

    // Upload to Vercel Blob
    const buffer = Buffer.from(await file.arrayBuffer());
    const blob = await put(`kataloglar/${filename}`, buffer, {
      access: "public",
      contentType: "application/pdf",
    });

    // Update Redis catalog list
    const list = (await readBlobJson<KatalogFile[]>("katalog-files.json")) || [];
    const filtered = list.filter((k) => k.filename !== filename);
    filtered.push({ filename, blobUrl: blob.url, size: buffer.length });
    await writeBlobJson("katalog-files.json", filtered);

    return NextResponse.json({ success: true, filename, path: blob.url });
  } catch (e: any) {
    console.error("Katalog upload error:", e);
    return NextResponse.json({ error: "Yükleme başarısız." }, { status: 500 });
  }
}
