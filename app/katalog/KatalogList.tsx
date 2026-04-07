"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import PdfThumbnail from "@/components/PdfThumbnail";

interface KatalogItem {
  slug: string;
  filename: string;
  title: string;
  path: string;
}

export default function KatalogList() {
  const [items, setItems] = useState<KatalogItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/kataloglar")
      .then((r) => r.json())
      .then((d) => setItems(d.kataloglar || []))
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

  if (items.length === 0) {
    return (
      <div className="text-center py-16">
        <svg className="w-16 h-16 text-gray-200 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
            d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
        <p className="text-gray-500 font-medium mb-1">Henüz katalog eklenmemiş</p>
        <p className="text-sm text-gray-400">
          <code className="bg-gray-100 px-1.5 py-0.5 rounded text-xs">public/kataloglar/</code> klasörüne PDF dosyası ekleyin.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {items.map((item) => (
        <KatalogCard key={item.slug} item={item} />
      ))}
    </div>
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
        {/* PDF rozeti */}
        <div className="absolute top-3 right-3 bg-red-500 text-white text-[10px] font-bold
                        px-2 py-0.5 rounded-md uppercase tracking-wide shadow-sm">
          PDF
        </div>
      </div>

      {/* Kart içeriği */}
      <div className="p-5">
        <h3 className="font-semibold text-gray-900 text-base mb-1 leading-snug line-clamp-2">
          {item.title}
        </h3>
        <p className="text-xs text-gray-400 mb-4 truncate">{item.filename}</p>

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
