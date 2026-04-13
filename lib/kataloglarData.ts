import { readdirSync, statSync } from "fs";
import path from "path";
import { readBlobJson } from "@/lib/blobStorage";

const KATALOG_DIR = path.join(process.cwd(), "public", "kataloglar");

/** katalog_2026.pdf her zaman en başta sabit */
const PINNED_FILENAME = "katalog_2026.pdf";

/** Dosya adına göre varsayılan görünür başlıklar */
const DEFAULT_TITLES: Record<string, string> = {
  "katalog_2026.pdf": "Ana Katalog",
  "ibe_ekatalog.pdf": "İşletmelerde Meslek Eğitimi Dosyası",
  "yaz_ekatalog.pdf": "Staj Dosyası",
  "yaz_stajı.pdf": "Staj Dosyası",
};

export type KatalogMeta = Record<string, { title?: string; description?: string }>;

export interface KatalogItem {
  slug: string;
  filename: string;
  title: string;
  description: string;
  path: string;
  pinned: boolean;
}

export function toTitle(filename: string): string {
  return (
    DEFAULT_TITLES[filename] ||
    filename
      .replace(/\.pdf$/i, "")
      .replace(/[-_]/g, " ")
      .replace(/\b\w/g, (c) => c.toUpperCase())
      .trim()
  );
}

export async function getKataloglar(): Promise<KatalogItem[]> {
  let meta: KatalogMeta = {};
  try {
    meta = (await readBlobJson<KatalogMeta>("katalog-meta.json")) || {};
  } catch { /* Redis yapılandırılmamışsa varsayılan başlıklar kullanılır */ }

  let files: string[] = [];
  try {
    files = readdirSync(KATALOG_DIR).filter((f) => {
      if (!f.toLowerCase().endsWith(".pdf")) return false;
      try {
        return statSync(path.join(KATALOG_DIR, f)).isFile();
      } catch {
        return false;
      }
    });
  } catch { /* klasör yok */ }

  const kataloglar: KatalogItem[] = files.map((f) => ({
    slug: f.replace(/\.pdf$/i, ""),
    filename: f,
    title: meta[f]?.title || toTitle(f),
    description: meta[f]?.description || "",
    path: `/kataloglar/${f}`,
    pinned: f === PINNED_FILENAME,
  }));

  // Sabit katalog önce, kalanlar alfabetik
  kataloglar.sort((a, b) => {
    if (a.pinned && !b.pinned) return -1;
    if (!a.pinned && b.pinned) return 1;
    return a.filename.localeCompare(b.filename);
  });

  return kataloglar;
}
