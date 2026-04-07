"use client";

import { useEffect, useRef, useState, useCallback } from "react";

const PDFJS_CDN =
  "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js";
const PDFJS_WORKER =
  "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";

declare global {
  interface Window { pdfjsLib: any }
}

type ViewerStatus = "idle" | "loading-script" | "loading-pdf" | "rendering" | "ready" | "error";

interface KatalogViewerProps {
  pdfPath?: string;
}

export default function KatalogViewer({ pdfPath = "/kataloglar/ibe_ekatalog.pdf" }: KatalogViewerProps) {
  const canvasRef     = useRef<HTMLCanvasElement>(null);
  const containerRef  = useRef<HTMLDivElement>(null);
  const pdfDocRef     = useRef<any>(null);
  const renderTaskRef = useRef<any>(null);
  // Her renderPage çağrısı için nesil numarası — race condition'ı önler
  const renderGenRef  = useRef(0);

  const [status, setStatus]       = useState<ViewerStatus>("idle");
  const [errorMsg, setErrorMsg]   = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages]   = useState(0);
  // zoom: 1.0 = genişliğe sığdır (varsayılan), 1.5 = %150 büyük vb.
  const [zoom, setZoom]           = useState(1.0);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const touchStartX = useRef<number | null>(null);

  // ── 1. pdf.js CDN yükle ──────────────────────────────────────────────────
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.pdfjsLib) { loadPdf(); return; }

    setStatus("loading-script");
    const script = document.createElement("script");
    script.src = PDFJS_CDN;
    script.onload = () => {
      if (window.pdfjsLib) {
        window.pdfjsLib.GlobalWorkerOptions.workerSrc = PDFJS_WORKER;
        loadPdf();
      } else {
        setStatus("error");
        setErrorMsg("PDF görüntüleyici yüklenemedi. Sayfayı yenileyin.");
      }
    };
    script.onerror = () => {
      setStatus("error");
      setErrorMsg("PDF görüntüleyici yüklenemedi. İnternet bağlantınızı kontrol edin.");
    };
    document.head.appendChild(script);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function loadPdf() {
    setStatus("loading-pdf");
    try {
      const doc = await window.pdfjsLib.getDocument(pdfPath).promise;
      pdfDocRef.current = doc;
      setTotalPages(doc.numPages);
      // totalPages state değişince aşağıdaki effect ilk sayfayı render eder
    } catch (err: any) {
      setStatus("error");
      setErrorMsg(
        err?.message?.includes("404") || err?.message?.includes("not found")
          ? "Katalog dosyası bulunamadı."
          : "Katalog yüklenirken bir hata oluştu."
      );
    }
  }

  // ── 2. Sayfa render — race-condition'dan korumalı, DPR ile yüksek kalite ─
  const renderPage = useCallback(async (pageNum: number, zoomLevel: number) => {
    const pdfDoc = pdfDocRef.current;
    if (!pdfDoc) return;

    // Nesil numarasını artır; bu çağrıdan önceki tüm bekleyenler iptal olur
    renderGenRef.current += 1;
    const myGen = renderGenRef.current;

    // Önceki render task varsa iptal et
    if (renderTaskRef.current) {
      try { renderTaskRef.current.cancel(); } catch { /* ignore */ }
      renderTaskRef.current = null;
    }

    setStatus("rendering");

    try {
      const page = await pdfDoc.getPage(pageNum);
      if (myGen !== renderGenRef.current) return; // daha yeni bir çağrı başlamış

      const canvas = canvasRef.current;
      if (!canvas) return;

      // Ekran piksel yoğunluğu — mobilde 2–3× olur, bunu hesaba katarak
      // canvas'ı daha yüksek çözünürlükte render et
      const dpr = typeof window !== "undefined" ? (window.devicePixelRatio || 1) : 1;
      const containerWidth = containerRef.current?.clientWidth || 800;

      const unscaled  = page.getViewport({ scale: 1 });
      // Temel ölçek: konteynere tam sığdır
      const fitScale  = (containerWidth - 16) / unscaled.width;
      // Kullanıcı zoom'unu uygula
      const cssScale  = fitScale * zoomLevel;
      // Canvas'ı DPR ile yüksek çözünürlükte render et
      const renderScale = cssScale * dpr;

      // Mobil tarayıcılarda canvas boyutu sınırı (~16M piksel / kenar başına ~4096)
      const MAX_SIDE = 4096;
      const safeRenderScale = Math.min(
        renderScale,
        MAX_SIDE / Math.max(unscaled.width, unscaled.height)
      );

      const viewport = page.getViewport({ scale: safeRenderScale });

      // Fiziksel canvas boyutu (yüksek çözünürlük)
      canvas.width  = Math.floor(viewport.width);
      canvas.height = Math.floor(viewport.height);
      // CSS görüntü boyutu (mantıksal piksel — kullanıcının gördüğü boyut)
      canvas.style.width  = `${Math.floor(viewport.width  / dpr)}px`;
      canvas.style.height = `${Math.floor(viewport.height / dpr)}px`;

      if (myGen !== renderGenRef.current) return;

      const ctx = canvas.getContext("2d");
      if (!ctx) {
        setStatus("error");
        setErrorMsg("Görüntüleme bağlamı oluşturulamadı.");
        return;
      }

      const task = page.render({ canvasContext: ctx, viewport });
      renderTaskRef.current = task;

      await task.promise;
      if (myGen !== renderGenRef.current) return; // başka bir render daha hızlı tamamlandı

      renderTaskRef.current = null;
      setStatus("ready");
    } catch (err: any) {
      if (err?.name === "RenderingCancelledException") return; // kasıtlı iptal
      if (myGen !== renderGenRef.current) return;              // stale
      console.error("[KatalogViewer] Render hatası:", err);
      setStatus("error");
      setErrorMsg("Sayfa gösterilirken hata oluştu.");
    }
  }, []);

  // ilk yükleme: totalPages set edilince 1. sayfayı render et
  useEffect(() => {
    if (totalPages > 0) renderPage(1, zoom);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [totalPages]);

  // sayfa veya zoom değişince yeniden render et
  useEffect(() => {
    if (status === "rendering" || status === "ready") {
      renderPage(currentPage, zoom);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, zoom]);

  // pencere boyutu değişince (döndürme vb.) fit ölçeğini güncelle
  useEffect(() => {
    const handler = () => {
      if (status === "ready" || status === "rendering") {
        renderPage(currentPage, zoom);
      }
    };
    window.addEventListener("resize", handler);
    return () => window.removeEventListener("resize", handler);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, currentPage, zoom]);

  // ── Navigasyon ──────────────────────────────────────────────────────────
  const goTo = (page: number) => {
    const clamped = Math.max(1, Math.min(totalPages, page));
    if (clamped !== currentPage) setCurrentPage(clamped);
  };

  const zoomIn  = () => setZoom((z) => Math.min(parseFloat((z + 0.25).toFixed(2)), 4));
  const zoomOut = () => setZoom((z) => Math.max(parseFloat((z - 0.25).toFixed(2)), 0.25));
  const zoomReset = () => setZoom(1.0);

  const toggleFullscreen = () => {
    const el = containerRef.current;
    if (!el) return;
    if (!document.fullscreenElement) {
      el.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen();
    }
  };

  useEffect(() => {
    const handler = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", handler);
    return () => document.removeEventListener("fullscreenchange", handler);
  }, []);

  // Klavye kısayolları
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement) return;
      if (e.key === "ArrowRight" || e.key === "ArrowDown") goTo(currentPage + 1);
      if (e.key === "ArrowLeft"  || e.key === "ArrowUp")   goTo(currentPage - 1);
      if (e.key === "+" || e.key === "=") zoomIn();
      if (e.key === "-") zoomOut();
      if (e.key === "0") zoomReset();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, totalPages]);

  // Mobil swipe
  const onTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };
  const onTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const dx = e.changedTouches[0].clientX - touchStartX.current;
    if (Math.abs(dx) > 50) {
      if (dx < 0) goTo(currentPage + 1);
      else         goTo(currentPage - 1);
    }
    touchStartX.current = null;
  };

  const isLoading = ["idle", "loading-script", "loading-pdf", "rendering"].includes(status);
  const zoomPct   = Math.round(zoom * 100);

  return (
    <div
      ref={containerRef}
      className={`bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden
                  ${isFullscreen ? "fixed inset-0 z-50 rounded-none" : ""}`}
    >
      {/* ── Toolbar ─────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between gap-2 px-3 py-2.5 bg-gray-50
                      border-b border-gray-200 flex-wrap min-h-[48px]">

        {/* Sayfa navigasyon */}
        <div className="flex items-center gap-0.5">
          <button onClick={() => goTo(currentPage - 1)} disabled={currentPage <= 1 || isLoading}
            aria-label="Önceki sayfa"
            className="p-2 rounded-lg hover:bg-gray-200 disabled:opacity-30 transition-colors">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7"/>
            </svg>
          </button>

          <div className="flex items-center gap-1 px-1">
            <input
              type="number" min={1} max={totalPages || 1}
              value={currentPage}
              onChange={(e) => goTo(parseInt(e.target.value) || 1)}
              aria-label="Sayfa numarası"
              className="w-10 text-center text-sm font-medium border border-gray-300 rounded-md
                         px-1 py-0.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {totalPages > 0 && (
              <span className="text-sm text-gray-400 whitespace-nowrap">/ {totalPages}</span>
            )}
          </div>

          <button onClick={() => goTo(currentPage + 1)} disabled={currentPage >= totalPages || isLoading}
            aria-label="Sonraki sayfa"
            className="p-2 rounded-lg hover:bg-gray-200 disabled:opacity-30 transition-colors">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7"/>
            </svg>
          </button>
        </div>

        {/* Zoom kontrolleri */}
        <div className="flex items-center gap-0.5">
          <button onClick={zoomOut} disabled={zoom <= 0.25}
            aria-label="Uzaklaştır"
            className="p-2 rounded-lg hover:bg-gray-200 disabled:opacity-30 transition-colors">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM13 10H7"/>
            </svg>
          </button>

          <button onClick={zoomReset}
            aria-label="Sıfırla"
            className="min-w-[44px] text-xs font-medium text-gray-700 hover:bg-gray-200
                       px-2 py-1.5 rounded-lg transition-colors">
            {zoomPct}%
          </button>

          <button onClick={zoomIn} disabled={zoom >= 4}
            aria-label="Yaklaştır"
            className="p-2 rounded-lg hover:bg-gray-200 disabled:opacity-30 transition-colors">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7"/>
            </svg>
          </button>

          <button onClick={toggleFullscreen}
            aria-label={isFullscreen ? "Tam ekrandan çık" : "Tam ekran"}
            className="p-2 rounded-lg hover:bg-gray-200 transition-colors ml-0.5">
            {isFullscreen ? (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M9 9L4 4m0 0v5m0-5h5M15 9l5-5m0 0v5m0-5h-5M9 15l-5 5m0 0h5m-5 0v-5M15 15l5 5m0 0h-5m5 0v-5"/>
              </svg>
            ) : (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4"/>
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* ── Canvas alanı ─────────────────────────────────────────────────── */}
      <div
        className={`relative overflow-auto bg-gray-700
                    ${isFullscreen ? "h-[calc(100vh-48px)]" : "min-h-[60vh]"}`}
        style={{ WebkitOverflowScrolling: "touch" } as React.CSSProperties}
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
      >
        {/* Loading */}
        {isLoading && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-gray-700 z-10">
            <div className="w-10 h-10 border-4 border-gray-500 border-t-blue-400 rounded-full animate-spin"/>
            <p className="text-gray-300 text-sm">
              {status === "loading-script" && "Görüntüleyici yükleniyor..."}
              {status === "loading-pdf"    && "Katalog açılıyor..."}
              {status === "rendering"      && "Sayfa hazırlanıyor..."}
            </p>
          </div>
        )}

        {/* Hata */}
        {status === "error" && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 p-6 text-center">
            <svg className="w-14 h-14 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
            </svg>
            <p className="text-white font-semibold">Katalog Yüklenemedi</p>
            <p className="text-gray-400 text-sm">{errorMsg}</p>
            <button onClick={() => window.location.reload()}
              className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg text-sm transition-colors">
              Tekrar Dene
            </button>
          </div>
        )}

        {/* Canvas — her zaman DOM'da, yalnızca görünürlüğü değişir */}
        <div className="flex items-start justify-center py-6 px-3 min-h-full">
          <canvas
            ref={canvasRef}
            className="shadow-2xl rounded-sm"
            style={{
              display: status === "ready" || status === "rendering" ? "block" : "none",
              maxWidth: "none", // zoom > 1 iken taşmasına izin ver
            }}
          />
        </div>
      </div>

      {/* ── Alt bilgi çubuğu ─────────────────────────────────────────────── */}
      {totalPages > 0 && (
        <div className="flex items-center justify-between px-4 py-2 bg-gray-50
                        border-t border-gray-200 text-xs text-gray-500">
          <span className="hidden sm:block">← → sayfa · + − zoom · 0 sıfırla</span>
          <span className="sm:hidden">Kaydırarak sayfa geçişi</span>
          <div className="flex items-center gap-2">
            <div className="w-20 h-1.5 bg-gray-200 rounded-full overflow-hidden">
              <div className="h-full bg-blue-500 rounded-full transition-all duration-300"
                style={{ width: `${(currentPage / totalPages) * 100}%` }}/>
            </div>
            <span className="text-gray-400">{Math.round((currentPage / totalPages) * 100)}%</span>
          </div>
        </div>
      )}
    </div>
  );
}
