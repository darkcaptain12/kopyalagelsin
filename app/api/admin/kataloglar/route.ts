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

    const kataloglar = files
      .filter((f) => f.toLowerCase().endsWith(".pdf"))
      .sort()
      .map((f) => ({
        filename: f,
        path: `/kataloglar/${f}`,
        size: statSync(path.join(KATALOG_DIR, f)).size,
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
