import { readdirSync, statSync } from "fs";
import path from "path";
import { readBlobJson } from "@/lib/blobStorage";

const KATALOG_DIR = path.join(process.cwd(), "public", "kataloglar");

export type KatalogMeta = Record<string, { title?: string; description?: string }>;

export interface KatalogFile {
  filename: string;
  blobUrl: string;
  size: number;
}

export interface KatalogItem {
  slug: string;
  filename: string;
  title: string;
  description: string;
  path: string;
}

export function toTitle(filename: string): string {
  return filename
    .replace(/\.pdf$/i, "")
    .replace(/[-_]/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase())
    .trim();
}

export async function getKataloglar(): Promise<KatalogItem[]> {
  const meta = (await readBlobJson<KatalogMeta>("katalog-meta.json")) || {};

  // Static files from public/kataloglar/
  let staticFiles: string[] = [];
  try {
    staticFiles = readdirSync(KATALOG_DIR).filter((f) => {
      if (!f.toLowerCase().endsWith(".pdf")) return false;
      try {
        return statSync(path.join(KATALOG_DIR, f)).isFile();
      } catch {
        return false;
      }
    });
  } catch { /* directory doesn't exist */ }

  // Blob-uploaded catalogs from Redis
  const blobList = (await readBlobJson<KatalogFile[]>("katalog-files.json")) || [];
  const blobFilenames = new Set(blobList.map((k) => k.filename));

  const staticKatalogs: KatalogItem[] = staticFiles
    .filter((f) => !blobFilenames.has(f))
    .sort()
    .map((f) => ({
      slug: f.replace(/\.pdf$/i, ""),
      filename: f,
      title: meta[f]?.title || toTitle(f),
      description: meta[f]?.description || "",
      path: `/kataloglar/${f}`,
    }));

  const blobKatalogs: KatalogItem[] = blobList
    .sort((a, b) => a.filename.localeCompare(b.filename))
    .map((k) => ({
      slug: k.filename.replace(/\.pdf$/i, ""),
      filename: k.filename,
      title: meta[k.filename]?.title || toTitle(k.filename),
      description: meta[k.filename]?.description || "",
      path: k.blobUrl,
    }));

  return [...staticKatalogs, ...blobKatalogs];
}
