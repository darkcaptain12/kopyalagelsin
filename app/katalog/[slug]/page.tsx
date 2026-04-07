import type { Metadata } from "next";
import KatalogDetailClient from "./KatalogDetailClient";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import AnnouncementBar from "@/components/AnnouncementBar";

interface Props {
  params: { slug: string };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const title = params.slug
    .replace(/-|_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
  return {
    title: `${title} | Kataloglar — Kopyala Gelsin`,
    description: `${title} kataloğunu çevrimiçi inceleyin.`,
  };
}

export default function KatalogDetailPage({ params }: Props) {
  const pdfPath = `/kataloglar/${params.slug}.pdf`;

  const title = params.slug
    .replace(/-|_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());

  return (
    <div className="min-h-screen flex flex-col">
      <AnnouncementBar />
      <Navbar />
      <main className="flex-1 bg-gray-50">
        {/* Breadcrumb + başlık */}
        <div className="bg-gradient-to-br from-blue-700 to-blue-900 text-white py-10 px-4">
          <div className="max-w-5xl mx-auto">
            <div className="flex items-center gap-2 text-blue-300 text-sm mb-3">
              <a href="/katalog" className="hover:text-white transition">Kataloglar</a>
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
              <span className="text-white">{title}</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-bold">{title}</h1>
          </div>
        </div>

        {/* Viewer */}
        <div className="max-w-5xl mx-auto px-4 py-8">
          <KatalogDetailClient pdfPath={pdfPath} title={title} />
        </div>

        {/* CTA */}
        <div className="max-w-5xl mx-auto px-4 pb-12">
          <div className="bg-white rounded-2xl shadow-sm border border-blue-100 p-7 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <h2 className="font-bold text-gray-900">Sipariş vermeye hazır mısınız?</h2>
              <p className="text-sm text-gray-500 mt-0.5">PDF dosyanızı yükleyin ve kapınıza teslim edelim.</p>
            </div>
            <a
              href="/#siparis"
              className="flex-shrink-0 inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700
                         text-white font-semibold px-7 py-3 rounded-xl transition-colors text-sm shadow-sm whitespace-nowrap"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
