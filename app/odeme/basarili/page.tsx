"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

function PaymentSuccessContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("orderId");
  const [orderStatus, setOrderStatus] = useState<"pending" | "paid" | "failed" | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Poll order status if orderId is provided
    if (orderId) {
      const checkOrderStatus = async () => {
        try {
          const response = await fetch(`/api/orders/${orderId}`);
          if (response.ok) {
            const order = await response.json();
            setOrderStatus(order.paytrStatus || "pending");
          }
        } catch (error) {
          console.error("Error checking order status:", error);
        } finally {
          setLoading(false);
        }
      };

      // Check immediately
      checkOrderStatus();

      // Poll every 2 seconds for up to 30 seconds
      const pollInterval = setInterval(() => {
        checkOrderStatus();
      }, 2000);

      const timeout = setTimeout(() => {
        clearInterval(pollInterval);
        setLoading(false);
      }, 30000);

      return () => {
        clearInterval(pollInterval);
        clearTimeout(timeout);
      };
    } else {
      setLoading(false);
    }
  }, [orderId]);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-lg shadow-lg p-8 text-center">
            <div className="mb-6">
              <svg
                className="w-20 h-20 text-green-500 mx-auto"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>

            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              Ödeme Başarılı!
            </h1>

            {loading ? (
              <p className="text-gray-600 mb-6">
                Sipariş durumu kontrol ediliyor...
              </p>
            ) : orderStatus === "paid" ? (
              <div>
                <p className="text-gray-600 mb-6">
                  Ödemeniz başarıyla tamamlandı. Siparişiniz alındı ve işleme konuldu.
                </p>
                {orderId && (
                  <p className="text-sm text-gray-500 mb-6">
                    Sipariş No: <span className="font-mono">{orderId}</span>
                  </p>
                )}
                <p className="text-gray-600 mb-6">
                  Siparişiniz en kısa sürede hazırlanacak ve size ulaştırılacaktır.
                </p>
              </div>
            ) : (
              <div>
                <p className="text-gray-600 mb-6">
                  Ödemeniz başarıyla tamamlandı. Siparişiniz alındı.
                </p>
                {orderId && (
                  <p className="text-sm text-gray-500 mb-6">
                    Sipariş No: <span className="font-mono">{orderId}</span>
                  </p>
                )}
                <p className="text-sm text-gray-500 mb-6">
                  Sipariş durumunuzu hesabım sayfasından takip edebilirsiniz.
                </p>
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
              <Link
                href="/"
                className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                Ana Sayfaya Dön
              </Link>
              {orderId && (
                <Link
                  href={`/hesabim?orderId=${orderId}`}
                  className="px-6 py-3 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors"
                >
                  Siparişimi Görüntüle
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}

export default function PaymentSuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Yükleniyor...</p>
        </div>
      </div>
    }>
      <PaymentSuccessContent />
    </Suspense>
  );
}
