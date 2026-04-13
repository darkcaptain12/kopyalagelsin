import { NextRequest, NextResponse } from "next/server";
import { readdirSync, statSync } from "fs";
import path from "path";
import { requireAdminAuth } from "@/lib/adminAuth";
import { readBlobJson, writeBlobJson } from "@/lib/blobStorage";
import type { KatalogMeta } from "@/lib/kataloglarData";

export const dynamic = "force-dynamic";

const KATALOG_DIR = path.join(process.cwd(), "public", "kataloglar");

export async function GET(request: NextRequest) {
  const authError = requireAdminAuth(request);
  if (authError) return authError;

  try {
    let files: string[] = [];
    try {
      files = readdirSync(KATALOG_DIR);
    } catch {
      return NextResponse.json({ kataloglar: [] });
    }

    let meta: KatalogMeta = {};
    try {
      meta = (await readBlobJson<KatalogMeta>("katalog-meta.json")) || {};
    } catch { /* Redis yoksa boş */ }

    const PINNED = "katalog_2026.pdf";
    const DEFAULT_TITLES: Record<string, string> = {
      "katalog_2026.pdf": "Ana Katalog",
      "ibe_ekatalog.pdf": "İşletmelerde Meslek Eğitimi Dosyası",
      "yaz_ekatalog.pdf": "Staj Dosyası",
      "yaz_stajı.pdf": "Staj Dosyası",
    };

    const kataloglar = files
      .filter((f) => f.toLowerCase().endsWith(".pdf"))
      .sort((a, b) => {
        if (a === PINNED) return -1;
        if (b === PINNED) return 1;
        return a.localeCompare(b);
      })
      .map((f) => ({
        filename: f,
        path: `/kataloglar/${f}`,
        size: statSync(path.join(KATALOG_DIR, f)).size,
        title: meta[f]?.title || DEFAULT_TITLES[f] || f.replace(/\.pdf$/i, "").replace(/[-_]/g, " "),
        description: meta[f]?.description || "",
        disabled: meta[f]?.disabled ?? false,
        pinned: f === PINNED,
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
    const { filename, title, description, disabled } = await request.json();

    if (!filename || !filename.toLowerCase().endsWith(".pdf")) {
      return NextResponse.json({ error: "Geçersiz dosya adı." }, { status: 400 });
    }

    const meta = (await readBlobJson<KatalogMeta>("katalog-meta.json")) || {};
    meta[filename] = {
      ...meta[filename],
      ...(title !== undefined ? { title: (title || "").trim() || undefined } : {}),
      ...(description !== undefined ? { description: (description || "").trim() || undefined } : {}),
      ...(disabled !== undefined ? { disabled: Boolean(disabled) } : {}),
    };
    await writeBlobJson<KatalogMeta>("katalog-meta.json", meta);

    return NextResponse.json({ success: true });
  } catch (e: any) {
    console.error("PATCH katalog meta error:", e?.message || e);
    return NextResponse.json({ error: e?.message || "Metadata güncellenemedi." }, { status: 500 });
  }
}
