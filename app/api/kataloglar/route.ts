import { NextResponse } from "next/server";
import { readdirSync, statSync } from "fs";
import path from "path";
import { readBlobJson } from "@/lib/blobStorage";

export const dynamic = "force-dynamic";

const KATALOG_DIR = path.join(process.cwd(), "public", "kataloglar");

/** Dosya adından okunabilir başlık üret */
function toTitle(filename: string): string {
  return filename
    .replace(/\.pdf$/i, "")
    .replace(/[-_]/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase())
    .trim();
}

export type KatalogMeta = Record<string, { title?: string; description?: string }>;

/**
 * public/kataloglar klasöründeki PDF'leri listeler.
 * Başlık/açıklama için Redis'teki metadata ile birleştirir.
 */
export async function GET() {
  try {
    let files: string[] = [];
    try {
      files = readdirSync(KATALOG_DIR);
    } catch {
      return NextResponse.json({ kataloglar: [] });
    }

    // Redis'ten metadata çek (yoksa boş dict)
    const meta = (await readBlobJson<KatalogMeta>("katalog-meta.json")) || {};

    const kataloglar = files
      .filter((f) => {
        if (!f.toLowerCase().endsWith(".pdf")) return false;
        try {
          return statSync(path.join(KATALOG_DIR, f)).isFile();
        } catch {
          return false;
        }
      })
      .sort()
      .map((f) => ({
        slug: f.replace(/\.pdf$/i, ""),
        filename: f,
        title: meta[f]?.title || toTitle(f),
        description: meta[f]?.description || "",
        path: `/kataloglar/${f}`,
      }));

    return NextResponse.json({ kataloglar });
  } catch (err: any) {
    return NextResponse.json({ kataloglar: [], error: err.message });
  }
}
