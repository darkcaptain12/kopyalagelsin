import type { Metadata } from "next";
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
      <body>{children}</body>
    </html>
  );
}

