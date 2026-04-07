"use client";

import { useEffect, useRef, useState } from "react";

interface PdfThumbnailProps {
  /** Yüklenen PDF File nesnesi (OrderForm'dan) */
  file?: File | null;
  /** Alternatif: sunucu URL'si (blob URL vb.) */
  url?: string | null;
  /** Canvas genişliği (px) — yükseklik orantılı hesaplanır */
  width?: number;
  className?: string;
}

declare global {
  interface Window {
    pdfjsLib: any;
  }
}

const PDFJS_CDN =
  "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js";
const PDFJS_WORKER =
  "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";

/** Yüklenen PDF'nin ilk sayfasını canvas'a render eder. */
export default function PdfThumbnail({
  file,
  url,
  width = 260,
  className = "",
}: PdfThumbnailProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  const [scriptLoaded, setScriptLoaded] = useState(
    typeof window !== "undefined" && !!window.pdfjsLib
  );

  // pdf.js CDN script'i yükle
  useEffect(() => {
    if (scriptLoaded) return;
    if (typeof window === "undefined") return;

    if (window.pdfjsLib) {
      setScriptLoaded(true);
      return;
    }

    const script = document.createElement("script");
    script.src = PDFJS_CDN;
    script.onload = () => {
      if (window.pdfjsLib) {
        window.pdfjsLib.GlobalWorkerOptions.workerSrc = PDFJS_WORKER;
      }
      setScriptLoaded(true);
    };
    script.onerror = () => setStatus("error");
    document.head.appendChild(script);
  }, [scriptLoaded]);

  // Script ve kaynak hazır olduğunda render et
  useEffect(() => {
    if (!scriptLoaded) return;
    if (!file && !url) {
      setStatus("error");
      return;
    }

    let cancelled = false;

    async function renderPage() {
      setStatus("loading");
      try {
        const pdfjs = window.pdfjsLib;
        if (!pdfjs) throw new Error("pdfjsLib yüklenemedi");

        let src: ArrayBuffer | string;
        if (file) {
          src = await file.arrayBuffer();
        } else {
          src = url!;
        }

        const loadingTask = pdfjs.getDocument(
          file ? { data: new Uint8Array(src as ArrayBuffer) } : { url: src }
        );
        const pdfDoc = await loadingTask.promise;
        if (cancelled) return;

        const page = await pdfDoc.getPage(1);
        if (cancelled) return;

        const canvas = canvasRef.current;
        if (!canvas) return;

        const unscaledViewport = page.getViewport({ scale: 1 });
        const scale = width / unscaledViewport.width;
        const viewport = page.getViewport({ scale });

        canvas.width = viewport.width;
        canvas.height = viewport.height;

        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        await page.render({ canvasContext: ctx, viewport }).promise;
        if (!cancelled) setStatus("ready");
      } catch (err) {
        if (!cancelled) {
          console.error("[PdfThumbnail] render hatası:", err);
          setStatus("error");
        }
      }
    }

    renderPage();

    return () => {
      cancelled = true;
    };
  }, [scriptLoaded, file, url, width]);

  return (
    <div
      className={`relative overflow-hidden rounded-lg border border-gray-200 bg-gray-50 ${className}`}
      style={{ width, minHeight: Math.round(width * 1.414) }}
    >
      {/* Canvas - görünmez, sadece render için */}
      <canvas
        ref={canvasRef}
        className="w-full h-auto"
        style={{ display: status === "ready" ? "block" : "none" }}
      />

      {/* Loading state */}
      {status === "loading" && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-gray-50">
          <div className="w-10 h-10 border-3 border-gray-300 border-t-blue-600 rounded-full animate-spin" />
          <p className="text-xs text-gray-500">Önizleme hazırlanıyor...</p>
        </div>
      )}

      {/* Error / fallback state */}
      {status === "error" && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-gray-50 text-gray-400">
          <svg
            className="w-12 h-12"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
          <p className="text-xs text-center px-3">Önizleme yüklenemedi</p>
        </div>
      )}

      {/* "1. Sayfa" etiketi */}
      {status === "ready" && (
        <div className="absolute bottom-2 left-2">
          <span className="bg-black/50 text-white text-[10px] px-2 py-0.5 rounded-full backdrop-blur-sm">
            1. Sayfa
          </span>
        </div>
      )}
    </div>
  );
}
