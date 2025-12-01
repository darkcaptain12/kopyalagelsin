"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import type { UIConfig } from "@/lib/config";

export default function Hero() {
  const [uiConfig, setUiConfig] = useState<UIConfig | null>(null);

  useEffect(() => {
    fetch("/api/config")
      .then((res) => res.json())
      .then((data) => {
        if (data.ui) {
          setUiConfig(data.ui);
        }
      })
      .catch(() => {
        // Fallback to default if API fails
        setUiConfig({
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
        });
      });
  }, []);

  if (!uiConfig?.banner) {
    return null;
  }

  const banner = uiConfig.banner;

  // Aspect ratio: 2752 / 1536 ≈ 1.791
  const bannerAspectRatio = 2752 / 1536;

  return (
    <section className="relative w-full overflow-hidden">
      {/* Banner Background Image */}
      {banner.imageEnabled && banner.imagePath ? (
        <div className="relative w-full" style={{ aspectRatio: bannerAspectRatio }}>
          <div className="absolute inset-0 z-0">
            {banner.imagePath.startsWith("http://") || banner.imagePath.startsWith("https://") ? (
              <img
                src={banner.imagePath}
                alt="Banner"
                className="w-full h-full object-contain"
                style={{ width: "100%", height: "100%", objectFit: "contain" }}
              />
            ) : (
              <Image
                src={banner.imagePath}
                alt="Banner"
                fill
                className="object-contain"
                priority
                sizes="100vw"
              />
            )}
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

