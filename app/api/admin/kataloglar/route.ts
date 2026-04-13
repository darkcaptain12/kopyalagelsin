import { NextRequest, NextResponse } from "next/server";
import { del } from "@vercel/blob";
import { requireAdminAuth } from "@/lib/adminAuth";
import { readBlobJson, writeBlobJson } from "@/lib/blobStorage";
import type { KatalogMeta, KatalogFile } from "@/lib/kataloglarData";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const authError = requireAdminAuth(request);
  if (authError) return authError;

  try {
    const list = (await readBlobJson<KatalogFile[]>("katalog-files.json")) || [];
    const kataloglar = list.map((k) => ({
      filename: k.filename,
      path: k.blobUrl,
      size: k.size,
    }));
    return NextResponse.json({ kataloglar });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  const authError = requireAdminAuth(request);
  if (authError) return authError;

  try {
    const { filename, title, description } = await request.json();

    if (!filename || !filename.toLowerCase().endsWith(".pdf")) {
      return NextResponse.json({ error: "Geçersiz dosya adı." }, { status: 400 });
    }

    const meta = (await readBlobJson<KatalogMeta>("katalog-meta.json")) || {};
    meta[filename] = {
      title: (title || "").trim() || undefined,
      description: (description || "").trim() || undefined,
    };
    await writeBlobJson<KatalogMeta>("katalog-meta.json", meta);

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Metadata güncellenemedi." }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  const authError = requireAdminAuth(request);
  if (authError) return authError;

  try {
    const { filename } = await request.json();

    if (!filename || !filename.toLowerCase().endsWith(".pdf")) {
      return NextResponse.json({ error: "Geçersiz dosya adı." }, { status: 400 });
    }

    // Find in Redis list
    const list = (await readBlobJson<KatalogFile[]>("katalog-files.json")) || [];
    const entry = list.find((k) => k.filename === filename);

    if (!entry) {
      return NextResponse.json({ error: "Katalog bulunamadı." }, { status: 404 });
    }

    // Delete from Vercel Blob
    await del(entry.blobUrl);

    // Remove from Redis list
    const updated = list.filter((k) => k.filename !== filename);
    await writeBlobJson("katalog-files.json", updated);

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Dosya silinemedi." }, { status: 500 });
  }
}
