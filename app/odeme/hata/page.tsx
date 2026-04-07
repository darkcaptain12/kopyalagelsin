"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

function PaymentErrorContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("orderId");

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-lg shadow-lg p-8 text-center">
            <div className="mb-6">
              <svg
                className="w-20 h-20 text-red-500 mx-auto"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>

            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              Ödeme İşlemi Başarısız
            </h1>

            <p className="text-gray-600 mb-6">
              Ödeme işleminiz tamamlanamadı. Lütfen tekrar deneyin.
            </p>

            {orderId && (
              <p className="text-sm text-gray-500 mb-6">
                Sipariş No: <span className="font-mono">{orderId}</span>
              </p>
            )}

            <p className="text-sm text-gray-500 mb-6">
              Ödeme sırasında bir sorun oluştu. Lütfen:
            </p>
            <ul className="text-sm text-gray-600 text-left max-w-md mx-auto mb-6 space-y-2">
              <li>• Kart bilgilerinizi kontrol edin</li>
              <li>• Bakiye yeterliliğinizi kontrol edin</li>
              <li>• İnternet bağlantınızı kontrol edin</li>
              <li>• Tekrar deneyin</li>
            </ul>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
              <Link
                href="/"
                className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                Ana Sayfaya Dön
              </Link>
              <Link
                href="/#siparis"
                className="px-6 py-3 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors"
              >
                Tekrar Dene
              </Link>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}

export default function PaymentErrorPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Yükleniyor...</p>
        </div>
      </div>
    }>
      <PaymentErrorContent />
    </Suspense>
  );
}
