import { NextResponse } from "next/server";
import { readdirSync, statSync } from "fs";
import path from "path";

const KATALOG_DIR = path.join(process.cwd(), "public", "kataloglar");

/** Dosya adından okunabilir başlık üret */
function toTitle(filename: string): string {
  return filename
    .replace(/\.pdf$/i, "")
    .replace(/[-_]/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase())
    .trim();
}

/**
 * public/kataloglar klasöründeki PDF'leri listeler.
 * Yeni PDF eklenince otomatik gözükür.
 */
export async function GET() {
  try {
    let files: string[] = [];
    try {
      files = readdirSync(KATALOG_DIR);
    } catch {
      return NextResponse.json({ kataloglar: [] });
    }

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
        title: toTitle(f),
        path: `/kataloglar/${f}`,
      }));

    return NextResponse.json({ kataloglar });
  } catch (err: any) {
    return NextResponse.json({ kataloglar: [], error: err.message });
  }
}
