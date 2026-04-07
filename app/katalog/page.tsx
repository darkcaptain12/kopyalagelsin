import type { Metadata } from "next";
import KatalogList from "./KatalogList";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import AnnouncementBar from "@/components/AnnouncementBar";

export const metadata: Metadata = {
  title: "Kataloglar | Kopyala Gelsin",
  description:
    "Kopyala Gelsin e-kataloglarını inceleyin. Baskı ürünleri, fiyatlandırma ve kurumsal çözümler hakkında detaylı bilgi edinin.",
  openGraph: {
    title: "Kataloglar | Kopyala Gelsin",
    description: "Dijital baskı hizmetlerimize ait katalogları inceleyin.",
    type: "website",
  },
};

export default function KatalogPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <AnnouncementBar />
      <Navbar />
      <main className="flex-1 bg-gray-50">
        {/* Hero */}
        <div className="bg-gradient-to-br from-blue-700 to-blue-900 text-white py-12 px-4">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 bg-white/10 rounded-full px-4 py-1.5 text-sm mb-4">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
              Dijital Kataloglar
            </div>
            <h1 className="text-3xl md:text-4xl font-bold mb-3">Kataloglarımız</h1>
            <p className="text-blue-200 text-base md:text-lg max-w-xl mx-auto">
              Ürün ve hizmet kataloglarımızı inceleyerek ihtiyacınıza uygun çözümü bulun.
            </p>
          </div>
        </div>

        {/* Kart Grid */}
        <div className="max-w-6xl mx-auto px-4 py-10">
          <KatalogList />
        </div>

        {/* CTA */}
        <div className="max-w-6xl mx-auto px-4 pb-14">
          <div className="bg-white rounded-2xl shadow-sm border border-blue-100 p-8 text-center">
            <h2 className="text-xl font-bold text-gray-900 mb-2">Sipariş vermeye hazır mısınız?</h2>
            <p className="text-gray-500 mb-6 max-w-md mx-auto text-sm">
              PDF dosyanızı yükleyin, seçeneklerinizi belirleyin ve kapınıza teslim edilsin.
            </p>
            <a
              href="/#siparis"
              className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700
                         text-white font-semibold px-8 py-3 rounded-xl transition-colors text-sm shadow-sm"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              Hemen Sipariş Ver
            </a>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
