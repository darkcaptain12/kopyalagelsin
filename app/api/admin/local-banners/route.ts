import { NextResponse } from "next/server";
import { readdirSync, statSync } from "fs";
import path from "path";

const BANNER_DIR = path.join(process.cwd(), "public", "kopyalagelsin_banner");
const ALLOWED_EXT = [".jpg", ".jpeg", ".png", ".webp", ".gif"];

/**
 * public/kopyalagelsin_banner klasöründeki resimleri listeler.
 * Yeni dosya eklendikçe otomatik görünür.
 */
export async function GET() {
  try {
    let files: string[] = [];

    try {
      files = readdirSync(BANNER_DIR);
    } catch {
      // Klasör yoksa boş döndür
      return NextResponse.json({ banners: [] });
    }

    const banners = files
      .filter((f) => {
        const ext = path.extname(f).toLowerCase();
        if (!ALLOWED_EXT.includes(ext)) return false;
        try {
          return statSync(path.join(BANNER_DIR, f)).isFile();
        } catch {
          return false;
        }
      })
      .sort()
      .map((f) => ({
        filename: f,
        path: `/kopyalagelsin_banner/${f}`,
      }));

    return NextResponse.json({ banners });
  } catch (err: any) {
    return NextResponse.json({ banners: [], error: err.message });
  }
}
