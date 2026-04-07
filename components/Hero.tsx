"use client";

import Link from "next/link";
import { useEffect, useState, useRef } from "react";
import type { AppConfig } from "@/lib/config";

export default function Hero() {
  const [config, setConfig] = useState<AppConfig | null>(null);
  const configVersionRef = useRef<string>("");

  useEffect(() => {
    const loadConfig = () => {
      fetch(`/api/config?t=${Date.now()}`, { cache: "no-store" })
        .then((res) => res.json())
        .then((data: AppConfig) => {
          // imagePath veya diğer banner alanları değiştiyse state güncelle
          const newVersion = JSON.stringify(data.ui?.banner) + JSON.stringify(data.season);
          if (newVersion !== configVersionRef.current) {
            configVersionRef.current = newVersion;
            setConfig(data);
          }
        })
        .catch(() => {/* sessizce atla */});
    };

    loadConfig();
    const interval = setInterval(loadConfig, 5000); // 5 saniyede bir kontrol
    return () => clearInterval(interval);
  }, []);

  if (!config?.ui?.banner) {
    return null;
  }

  // Use season banner if available, otherwise use default banner
  const currentSeasonMode = config.season?.currentSeasonMode || "normal";
  const seasons = config.season?.seasons;
  const seasonBannerUrl = seasons?.[currentSeasonMode]?.bannerUrl;
  
  // Use season banner if available, fallback to default banner
  const bannerImagePath = seasonBannerUrl || config.ui.banner.imagePath || "/logo/favicon.png";
  const banner = config.ui.banner;
  
  // Cache-bust: path değiştiğinde tarayıcı önbelleğini atla
  const cacheBust = `?v=${configVersionRef.current.length}`;
  const bannerSrc = bannerImagePath
    ? `${bannerImagePath}${bannerImagePath.includes("?") ? "&" : "?"}cb=${encodeURIComponent(bannerImagePath)}`
    : null;

  const fitMode = banner.imageFit || "cover";
  const textColor = banner.textColor || "#ffffff";
  const bgColor   = banner.backgroundColor || "#2563eb";

  return (
    <section className="relative w-full overflow-hidden">
      {banner.imageEnabled && bannerSrc ? (
        /* ── Görsel banner ── */
        <div className="relative w-full">
          {/* <img> kullanıyoruz: Next.js Image cache sorununu önler */}
          <img
            key={bannerSrc}                      // path değişince React remount yapar
            src={bannerSrc}
            alt="Banner"
            className="w-full block"
            style={{
              objectFit: fitMode,
              // contain modunda görsel tam sığar, cover modunda dolar
              maxHeight: fitMode === "contain" ? "none" : "85vh",
              width: "100%",
            }}
          />

          {/* Overlay: buton her zaman, yazı sadece imageHasText=false ise */}
          <div className="absolute inset-0 flex flex-col items-center justify-end pb-8 md:pb-12 pointer-events-none">
            <div className="pointer-events-auto text-center px-4">
              {!banner.imageHasText && (
                <div className="mb-4" style={{ color: textColor }}>
                  {banner.title && (
                    <h1 className="text-3xl md:text-5xl font-bold drop-shadow-lg mb-3">
                      {banner.title}
                    </h1>
                  )}
                  {banner.subtitle?.trim() && (
                    <p className="text-lg md:text-xl opacity-90 drop-shadow-md">
                      {banner.subtitle}
                    </p>
                  )}
                </div>
              )}
              {banner.buttonLink && (
                <Link
                  href={banner.buttonLink}
                  className="inline-block bg-white px-6 py-3 md:px-8 md:py-4 rounded-lg font-semibold text-sm md:text-lg hover:opacity-90 transition shadow-lg"
                  style={{ color: bgColor }}
                >
                  {banner.buttonText || "Çıktı Siparişi Ver"}
                </Link>
              )}
            </div>
          </div>
        </div>
      ) : (
        /* ── Renkli gradient banner (görsel yok) ── */
        <div
          className="w-full py-20"
          style={{
            background: `linear-gradient(to right, ${bgColor}, ${banner.backgroundColorEnd || "#1e40af"})`,
            color: textColor,
          }}
        >
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center pt-12 md:pt-16">
              <h1 className="text-4xl md:text-6xl font-bold mb-4 drop-shadow-lg">{banner.title}</h1>
              <p className="text-xl md:text-2xl mb-6 md:mb-8 opacity-90 drop-shadow-md">{banner.subtitle}</p>
              {banner.buttonLink && (
                <Link
                  href={banner.buttonLink}
                  className="inline-block bg-white px-5 py-2.5 md:px-8 md:py-4 rounded-lg font-semibold text-sm md:text-lg hover:opacity-90 transition shadow-lg mt-3 md:mt-4"
                  style={{ color: bgColor }}
                >
                  {banner.buttonText || "Çıktı Siparişi Ver"}
                </Link>
              )}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

