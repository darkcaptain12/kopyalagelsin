"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import PdfThumbnail from "@/components/PdfThumbnail";

// Dynamically import to avoid SSR issues with pdfjs-dist
const PdfFlipBook = dynamic(() => import("@/components/PdfFlipBook"), { ssr: false });

interface KatalogItem {
  slug: string;
  filename: string;
  title: string;
  description?: string;
  path: string;
  pinned?: boolean;
}

interface FlipItem {
  slug: string;
  title: string;
  subtitle: string;
  pdfPath: string;
}

const FLIP_CATALOGS: FlipItem[] = [
  {
    slug: "ibe-ekatalog",
    title: "İşletmelerde Meslek Eğitimi Dosyası",
    subtitle: "Dijital Flip Katalog",
    pdfPath: "/kataloglar/ibe_ekatalog.pdf",
  },
];

export default function KatalogList() {
  const [items, setItems] = useState<KatalogItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/kataloglar")
      .then((r) => r.json())
      .then((d) => {
          // Exclude PDFs that are shown as FlipCards above
          const flipPaths = new Set(FLIP_CATALOGS.map((f) => f.pdfPath));
          setItems((d.kataloglar || []).filter((k: KatalogItem) => !flipPaths.has(k.path)));
        })
      .catch(() => setError("Kataloglar yüklenemedi."))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden animate-pulse">
            <div className="bg-gray-200 aspect-[3/4]" />
            <div className="p-5 space-y-3">
              <div className="h-4 bg-gray-200 rounded w-3/4" />
              <div className="h-3 bg-gray-100 rounded w-1/2" />
              <div className="h-9 bg-gray-200 rounded-lg" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-16">
        <svg className="w-12 h-12 text-gray-300 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
        <p className="text-gray-500">{error}</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {FLIP_CATALOGS.map((item) => (
        <FlipHtml5Card key={item.slug} item={item} />
      ))}
      {items.map((item) => (
        <KatalogCard key={item.slug} item={item} />
      ))}
    </div>
  );
}

function FlipHtml5Card({ item }: { item: FlipItem }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <div className="group bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden
                      hover:shadow-md hover:-translate-y-0.5 transition-all duration-200">
        {/* Kapak */}
        <div className="relative bg-gradient-to-br from-orange-50 to-amber-100 flex items-center justify-center overflow-hidden"
             style={{ minHeight: "240px" }}>
          {/* Kitap ikonu */}
          <div className="flex flex-col items-center gap-3 select-none">
            <svg className="w-20 h-20 text-amber-400 drop-shadow" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.2}
                d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
            <span className="text-amber-600 text-xs font-semibold tracking-wide">Sayfaları çevirin</span>
          </div>
          {/* Rozet */}
          <div className="absolute top-3 right-3 bg-amber-500 text-white text-[10px] font-bold
                          px-2 py-0.5 rounded-md uppercase tracking-wide shadow-sm">
            FLIP
          </div>
        </div>

        {/* Kart içeriği */}
        <div className="p-5">
          <h3 className="font-semibold text-gray-900 text-base mb-1 leading-snug line-clamp-2">
            {item.title}
          </h3>
          <p className="text-xs text-gray-400 mb-4 truncate">{item.subtitle}</p>

          <button
            onClick={() => setOpen(true)}
            className="flex items-center justify-center gap-2 w-full py-2.5 px-4
                       bg-amber-500 hover:bg-amber-600 text-white text-sm font-semibold
                       rounded-xl transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
            İncele
          </button>
        </div>
      </div>

      {/* Modal */}
      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-2 sm:p-4"
          onClick={() => setOpen(false)}
        >
          <div
            className="relative w-full max-w-5xl bg-neutral-900 rounded-xl sm:rounded-2xl shadow-2xl flex flex-col overflow-hidden"
            style={{ height: "92vh" }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Üst bar */}
            <div className="flex items-center justify-between px-4 py-2 border-b border-white/10 flex-shrink-0">
              <span className="text-white/80 text-sm font-medium">{item.title}</span>
              <button
                onClick={() => setOpen(false)}
                className="bg-white/15 hover:bg-white/30 text-white rounded-lg w-8 h-8 flex items-center justify-center transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            {/* Flipbook alanı */}
            <div className="flex-1 min-h-0">
              <PdfFlipBook pdfUrl={item.pdfPath} />
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function KatalogCard({ item }: { item: KatalogItem }) {
  return (
    <div className="group bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden
                    hover:shadow-md hover:-translate-y-0.5 transition-all duration-200">
      {/* Kapak görseli */}
      <div className="relative bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center overflow-hidden"
           style={{ minHeight: "240px" }}>
        <PdfThumbnail
          url={item.path}
          width={220}
          className="shadow-lg"
        />
        {/* Rozetler */}
        {item.pinned ? (
          <div className="absolute top-3 right-3 bg-blue-600 text-white text-[10px] font-bold
                          px-2 py-0.5 rounded-md uppercase tracking-wide shadow-sm">
            SABİT
          </div>
        ) : (
          <div className="absolute top-3 right-3 bg-red-500 text-white text-[10px] font-bold
                          px-2 py-0.5 rounded-md uppercase tracking-wide shadow-sm">
            PDF
          </div>
        )}
      </div>

      {/* Kart içeriği */}
      <div className="p-5">
        <h3 className="font-semibold text-gray-900 text-base mb-1 leading-snug line-clamp-2">
          {item.title}
        </h3>
        <p className="text-xs text-gray-400 mb-4 truncate">{item.description || item.filename}</p>

        <Link
          href={`/katalog/${item.slug}`}
          className="flex items-center justify-center gap-2 w-full py-2.5 px-4
                     bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold
                     rounded-xl transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
          </svg>
          İncele
        </Link>
      </div>
    </div>
  );
}
