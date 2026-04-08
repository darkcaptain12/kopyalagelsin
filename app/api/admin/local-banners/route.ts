import { NextResponse } from "next/server";
import { readdirSync, statSync } from "fs";
import { requireAdminAuth } from "@/lib/adminAuth";
import path from "path";

export const dynamic = "force-dynamic";

const ALLOWED_EXT = [".jpg", ".jpeg", ".png", ".webp", ".gif"];

// Taranacak klasörler ve URL prefix'leri
const BANNER_DIRS = [
  {
    dir: path.join(process.cwd(), "public", "kopyalagelsin_banner"),
    urlPrefix: "/kopyalagelsin_banner",
  },
  {
    dir: path.join(process.cwd(), "public", "banners"),
    urlPrefix: "/banners",
  },
];

/**
 * public/kopyalagelsin_banner ve public/banners klasörlerindeki
 * resimleri listeler. GitHub'dan yüklenen dosyalar otomatik görünür.
 */
import { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  const authError = requireAdminAuth(request);
  if (authError) return authError;

  try {
    const allBanners: { filename: string; path: string; folder: string }[] = [];

    for (const { dir, urlPrefix } of BANNER_DIRS) {
      let files: string[] = [];
      try {
        files = readdirSync(dir);
      } catch {
        continue; // Klasör yoksa atla
      }

      const filtered = files
        .filter((f) => {
          const ext = path.extname(f).toLowerCase();
          if (!ALLOWED_EXT.includes(ext)) return false;
          try {
            return statSync(path.join(dir, f)).isFile();
          } catch {
            return false;
          }
        })
        .sort()
        .map((f) => ({
          filename: f,
          path: `${urlPrefix}/${f}`,
          folder: urlPrefix.replace("/", ""),
        }));

      allBanners.push(...filtered);
    }

    return NextResponse.json({ banners: allBanners });
  } catch (err: any) {
    return NextResponse.json({ banners: [], error: err.message });
  }
}
