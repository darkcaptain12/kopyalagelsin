"use client";

import { useEffect, useState, forwardRef, useCallback, useRef } from "react";
import * as pdfjsLib from "pdfjs-dist";
import HTMLFlipBook from "react-pageflip";

pdfjsLib.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.js";

const ASPECT = 594 / 420; // A4 oranı
const MIN_ZOOM = 0.5;
const MAX_ZOOM = 2.0;
const ZOOM_STEP = 0.25;

interface PageData {
  dataUrl: string | null;
}

const FlipPage = forwardRef<HTMLDivElement, { data: PageData; num: number; w: number; h: number }>(
  ({ data, num, w, h }, ref) => (
    <div
      ref={ref}
      style={{ width: w, height: h, background: "#fff", overflow: "hidden", userSelect: "none" }}
    >
      {data.dataUrl ? (
        <img
          src={data.dataUrl}
          draggable={false}
          alt={`Sayfa ${num}`}
          style={{ width: "100%", height: "100%", objectFit: "contain", display: "block" }}
        />
      ) : (
        <div style={{
          width: "100%", height: "100%", display: "flex",
          alignItems: "center", justifyContent: "center",
          color: "#d1d5db", fontSize: 13,
        }}>
          {num}
        </div>
      )}
    </div>
  )
);
FlipPage.displayName = "FlipPage";

interface Props {
  pdfUrl: string;
}

export default function PdfFlipBook({ pdfUrl }: Props) {
  const [pages, setPages] = useState<PageData[]>([]);
  const [ready, setReady] = useState(false);
  const [pageSize, setPageSize] = useState({ w: 360, h: 509 });
  const [zoom, setZoom] = useState(1);
  const flipBookRef = useRef<any>(null);

  // Responsive page size — always landscape (two pages), sized to fit viewport
  useEffect(() => {
    const update = () => {
      // Leave 48px padding total, max 900px for both pages combined
      const available = Math.min(window.innerWidth - 48, 900);
      const w = Math.floor(available / 2);
      setPageSize({ w, h: Math.floor(w * ASPECT) });
    };
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  const renderPage = useCallback(
    async (pdf: pdfjsLib.PDFDocumentProxy, num: number, w: number): Promise<string> => {
      const page = await pdf.getPage(num);
      const baseVp = page.getViewport({ scale: 1 });
      // Render at 2× display size for sharp text on all screens
      const scale = (w / baseVp.width) * 2;
      const viewport = page.getViewport({ scale });
      const canvas = document.createElement("canvas");
      canvas.width = Math.floor(viewport.width);
      canvas.height = Math.floor(viewport.height);
      const ctx = canvas.getContext("2d")!;
      await page.render({ canvasContext: ctx, viewport }).promise;
      return canvas.toDataURL("image/jpeg", 0.92);
    },
    []
  );

  useEffect(() => {
    let cancelled = false;
    setReady(false);
    setPages([]);

    (async () => {
      let pdf: pdfjsLib.PDFDocumentProxy;
      try {
        pdf = await pdfjsLib.getDocument(pdfUrl).promise;
      } catch (e) {
        console.error("PDF load error:", e);
        return;
      }
      if (cancelled) return;

      const n = pdf.numPages;
      setPages(Array.from({ length: n }, () => ({ dataUrl: null })));

      for (let i = 1; i <= Math.min(4, n); i++) {
        if (cancelled) return;
        const dataUrl = await renderPage(pdf, i, pageSize.w);
        if (cancelled) return;
        setPages((prev) => { const next = [...prev]; next[i - 1] = { dataUrl }; return next; });
      }
      if (!cancelled) setReady(true);

      for (let i = 5; i <= n; i++) {
        if (cancelled) return;
        const dataUrl = await renderPage(pdf, i, pageSize.w);
        if (cancelled) return;
        setPages((prev) => { const next = [...prev]; next[i - 1] = { dataUrl }; return next; });
      }
    })();

    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pdfUrl, renderPage]);

  const flipNext = () => flipBookRef.current?.pageFlip()?.flipNext();
  const flipPrev = () => flipBookRef.current?.pageFlip()?.flipPrev();
  const zoomIn = () => setZoom((z) => Math.min(MAX_ZOOM, +(z + ZOOM_STEP).toFixed(2)));
  const zoomOut = () => setZoom((z) => Math.max(MIN_ZOOM, +(z - ZOOM_STEP).toFixed(2)));

  if (!ready) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-3">
        <div className="w-10 h-10 border-4 border-white/20 border-t-white rounded-full animate-spin" />
        <p className="text-white/60 text-sm">Katalog yükleniyor…</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center h-full gap-3 py-2">
      {/* Flipbook — zoom via CSS scale */}
      <div
        style={{
          transform: `scale(${zoom})`,
          transformOrigin: "center center",
          transition: "transform 0.2s ease",
        }}
      >
        <HTMLFlipBook
          ref={flipBookRef}
          width={pageSize.w}
          height={pageSize.h}
          size="fixed"
          minWidth={pageSize.w}
          maxWidth={pageSize.w}
          minHeight={pageSize.h}
          maxHeight={pageSize.h}
          showCover={true}
          flippingTime={650}
          maxShadowOpacity={0.35}
          drawShadow={true}
          usePortrait={false}
          startZIndex={1}
          autoSize={false}
          useMouseEvents={true}
          swipeDistance={20}
          showPageCorners={true}
          disableFlipByClick={false}
          style={{}}
          startPage={0}
          className="shadow-2xl"
        >
          {pages.map((data, i) => (
            <FlipPage key={i} data={data} num={i + 1} w={pageSize.w} h={pageSize.h} />
          ))}
        </HTMLFlipBook>
      </div>

      {/* Kontroller */}
      <div className="flex items-center gap-2 flex-wrap justify-center">
        {/* Önceki / Sonraki */}
        <button
          onClick={flipPrev}
          className="flex items-center gap-1 px-3 py-2 bg-white/15 hover:bg-white/25 text-white text-sm rounded-lg transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Önceki
        </button>
        <button
          onClick={flipNext}
          className="flex items-center gap-1 px-3 py-2 bg-white/15 hover:bg-white/25 text-white text-sm rounded-lg transition-colors"
        >
          Sonraki
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>

        {/* Ayraç */}
        <span className="text-white/30 select-none">|</span>

        {/* Zoom Out */}
        <button
          onClick={zoomOut}
          disabled={zoom <= MIN_ZOOM}
          className="w-8 h-8 flex items-center justify-center bg-white/15 hover:bg-white/25 disabled:opacity-40 text-white rounded-lg transition-colors text-lg font-bold"
          title="Küçült"
        >
          −
        </button>
        {/* Zoom göstergesi */}
        <span className="text-white/70 text-xs w-10 text-center">{Math.round(zoom * 100)}%</span>
        {/* Zoom In */}
        <button
          onClick={zoomIn}
          disabled={zoom >= MAX_ZOOM}
          className="w-8 h-8 flex items-center justify-center bg-white/15 hover:bg-white/25 disabled:opacity-40 text-white rounded-lg transition-colors text-lg font-bold"
          title="Büyüt"
        >
          +
        </button>
      </div>
    </div>
  );
}
