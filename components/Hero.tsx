"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import type { AppConfig } from "@/lib/config";

export default function Hero() {
  const [config, setConfig] = useState<AppConfig | null>(null);

  useEffect(() => {
    // Add cache busting to ensure fresh config
    const loadConfig = () => {
      fetch(`/api/config?t=${Date.now()}`, {
        cache: "no-store",
        headers: {
          "Cache-Control": "no-cache",
        },
      })
        .then((res) => res.json())
        .then((data: AppConfig) => {
          setConfig(data);
        })
      .catch((err) => {
        console.error("Failed to load config:", err);
        // Fallback to minimal default config if API fails
        setConfig({
          ui: {
            banner: {
              title: "Öğrenciler için uygun fiyatlı dijital çıktı hizmeti",
              subtitle: "PDF dosyanı yükle, baskı seçeneklerini seç, online öde, çıktın kapına gelsin.",
              buttonText: "Çıktı Siparişi Ver",
              buttonLink: "#siparis",
              backgroundColor: "#2563eb",
              backgroundColorEnd: "#1e40af",
              textColor: "#ffffff",
              imageEnabled: true,
              imagePath: "/logo/favicon.png",
            },
            announcementBar: {
              enabled: false,
              text: "",
              link: null,
              backgroundColor: "#3b82f6",
              textColor: "#ffffff",
            },
            footer: {
              description: "",
              phone: "",
              email: "",
              address: "",
              copyright: "",
            },
          },
          season: {
            currentSeasonMode: "normal",
            seasons: {
              normal: { mode: "normal", bannerUrl: null, priceMultiplier: 1.0 },
              vize: { mode: "vize", bannerUrl: null, priceMultiplier: 1.0 },
              final: { mode: "final", bannerUrl: null, priceMultiplier: 1.0 },
              tez: { mode: "tez", bannerUrl: null, priceMultiplier: 1.0 },
            },
          },
        } as AppConfig);
      });
    };
    
    loadConfig();
    // Reload config every 30 seconds to catch updates
    const interval = setInterval(loadConfig, 30000);
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
  
  // Debug: log banner info
  if (typeof window !== "undefined") {
    console.log("Banner Debug:", {
      currentSeasonMode,
      seasonBannerUrl,
      defaultBannerPath: config.ui.banner.imagePath,
      finalBannerPath: bannerImagePath,
    });
  }
  
  // Add cache busting to banner image URL - use config timestamp for consistency
  const bannerImageUrl = bannerImagePath
    ? `${bannerImagePath}${bannerImagePath.includes("?") ? "&" : "?"}v=${Date.now()}`
    : null;

  // Aspect ratio: 2752 / 1536 ≈ 1.791
  const bannerAspectRatio = 2752 / 1536;

  return (
    <section className="relative w-full overflow-hidden">
      {/* Banner Background Image */}
      {banner.imageEnabled && bannerImagePath ? (
        <div className="relative w-full" style={{ aspectRatio: bannerAspectRatio }}>
          <div className="absolute inset-0 z-0">
            {bannerImageUrl && (bannerImageUrl.startsWith("http://") || bannerImageUrl.startsWith("https://")) ? (
              <img
                key={bannerImageUrl}
                src={bannerImageUrl}
                alt="Banner"
                className="w-full h-full object-contain"
                style={{ width: "100%", height: "100%", objectFit: "contain" }}
                onError={(e) => {
                  console.error("Banner image failed to load:", bannerImageUrl);
                }}
              />
            ) : bannerImagePath ? (
              <Image
                key={bannerImagePath}
                src={bannerImagePath}
                alt="Banner"
                fill
                className="object-contain"
                priority
                sizes="100vw"
              />
            ) : null}
            {/* Overlay for better text readability */}
            <div
              className="absolute inset-0"
              style={{
                background: `linear-gradient(to right, ${banner.backgroundColor}dd, ${banner.backgroundColorEnd}dd)`,
              }}
            />
          </div>
          
          {/* Content */}
          <div
            className="relative z-10 w-full h-full flex items-center justify-center"
            style={{
              color: banner.textColor,
            }}
          >
            <div className="container mx-auto px-4">
              <div className="max-w-3xl mx-auto text-center">
                <h1 className="text-4xl md:text-6xl font-bold mb-4 drop-shadow-lg">{banner.title}</h1>
                <p className="text-xl md:text-2xl mb-8 opacity-90 drop-shadow-md">{banner.subtitle}</p>
                {banner.buttonLink && (
                  <Link
                    href={banner.buttonLink}
                    className="inline-block bg-white px-8 py-4 rounded-lg font-semibold text-lg hover:opacity-90 transition shadow-lg"
                    style={{
                      color: banner.backgroundColor,
                    }}
                  >
                    {banner.buttonText || "Çıktı Siparişi Ver"}
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div
          className="w-full py-20"
          style={{
            background: `linear-gradient(to right, ${banner.backgroundColor}, ${banner.backgroundColorEnd})`,
            color: banner.textColor,
          }}
        >
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center">
              <h1 className="text-4xl md:text-6xl font-bold mb-4 drop-shadow-lg">{banner.title}</h1>
              <p className="text-xl md:text-2xl mb-8 opacity-90 drop-shadow-md">{banner.subtitle}</p>
              {banner.buttonLink && (
                <Link
                  href={banner.buttonLink}
                  className="inline-block bg-white px-8 py-4 rounded-lg font-semibold text-lg hover:opacity-90 transition shadow-lg"
                  style={{
                    color: banner.backgroundColor,
                  }}
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

