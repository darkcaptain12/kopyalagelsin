import type { Metadata } from "next";
import Script from "next/script";
import "./globals.css";

export const metadata: Metadata = {
  title: "kopyalagelsin - Öğrenciler için Uygun Fiyatlı Dijital Çıktı Servisi",
  description: "PDF dosyanı yükle, baskı seçeneklerini seç, online öde, çıktın kapına gelsin. Öğrenciler için uygun fiyatlı dijital çıktı servisi",
  icons: {
    icon: "/logo/favicon.png",
    apple: "/logo/favicon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr">
      <body>
        {children}
        {/* Google Ads global etiketi (gtag.js) — tüm sayfalarda bir kez yüklenir */}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=AW-18469540227"
          strategy="afterInteractive"
        />
        <Script id="google-ads-gtag" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'AW-18469540227');
          `}
        </Script>
      </body>
    </html>
  );
}

