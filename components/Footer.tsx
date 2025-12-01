"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { UIConfig } from "@/lib/config";

export default function Footer() {
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
          footer: {
            description: "Öğrenciler için uygun fiyatlı dijital çıktı hizmeti. PDF dosyanızı yükleyin, çıktınızı alın.",
            phone: "+90 (XXX) XXX XX XX",
            email: "info@dijitalcikti.com",
            address: "Örnek Mahalle, Örnek Sokak No:1, İstanbul",
            copyright: `© ${new Date().getFullYear()} kopyalagelsin. Tüm hakları saklıdır.`,
          },
          announcementBar: {
            enabled: false,
            text: "",
            link: null,
            backgroundColor: "#3b82f6",
            textColor: "#ffffff",
          },
        });
      });
  }, []);

  const footer = uiConfig?.footer || {
    description: "Öğrenciler için uygun fiyatlı dijital çıktı hizmeti. PDF dosyanızı yükleyin, çıktınızı alın.",
    phone: "+90 (XXX) XXX XX XX",
    email: "info@dijitalcikti.com",
    address: "Örnek Mahalle, Örnek Sokak No:1, İstanbul",
    copyright: `© ${new Date().getFullYear()} kopyalagelsin. Tüm hakları saklıdır.`,
  };

  return (
    <footer id="iletisim" className="bg-gray-900 text-white mt-20">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-lg font-semibold mb-4">kopyalagelsin</h3>
            <p className="text-gray-400">{footer.description}</p>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4">İletişim</h3>
            <p className="text-gray-400 mb-2">
              <strong>Telefon:</strong> {footer.phone}
            </p>
            <p className="text-gray-400 mb-2">
              <strong>E-posta:</strong> {footer.email}
            </p>
            <p className="text-gray-400">
              <strong>Adres:</strong> {footer.address}
            </p>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4">Yasal</h3>
            <ul className="space-y-2 text-gray-400">
              <li>
                <Link href="/kvkk" className="hover:text-white transition">
                  KVKK Aydınlatma Metni
                </Link>
              </li>
              <li>
                <Link href="/uyelik-sozlesmesi" className="hover:text-white transition">
                  Üyelik Sözleşmesi
                </Link>
              </li>
              <li>
                <Link href="/gizlilik-politikasi" className="hover:text-white transition">
                  Gizlilik Politikası
                </Link>
              </li>
              <li>
                <Link href="/iade-iptal-politikasi" className="hover:text-white transition">
                  İade ve İptal Politikası
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
          <p dangerouslySetInnerHTML={{ __html: footer.copyright }} />
        </div>
      </div>
    </footer>
  );
}

