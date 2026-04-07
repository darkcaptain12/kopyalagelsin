"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

function SuccessContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("orderId");
  const [orderStatus, setOrderStatus] = useState<"loading" | "success" | "error">("loading");

  useEffect(() => {
    if (orderId) {
      // Check order status
      fetch(`/api/orders/${orderId}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.order && data.order.paytrStatus === "paid") {
            setOrderStatus("success");
          } else {
            setOrderStatus("error");
          }
        })
        .catch(() => {
          setOrderStatus("error");
        });
    } else {
      setOrderStatus("error");
    }
  }, [orderId]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
        {orderStatus === "loading" && (
          <>
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Sipariş kontrol ediliyor...</h1>
          </>
        )}

        {orderStatus === "success" && (
          <>
            <div className="mb-4">
              <svg
                className="mx-auto h-16 w-16 text-green-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Siparişiniz Alındı!</h1>
            <p className="text-gray-600 mb-6">
              Ödemeniz başarıyla tamamlandı. Siparişiniz en kısa sürede hazırlanacaktır.
            </p>
            {orderId && (
              <p className="text-sm text-gray-500 mb-6">Sipariş No: {orderId}</p>
            )}
            <Link
              href="/"
              className="inline-block bg-blue-600 text-white px-6 py-2 rounded-md font-semibold hover:bg-blue-700 transition-colors"
            >
              Ana Sayfaya Dön
            </Link>
          </>
        )}

        {orderStatus === "error" && (
          <>
            <div className="mb-4">
              <svg
                className="mx-auto h-16 w-16 text-red-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Bir Hata Oluştu</h1>
            <p className="text-gray-600 mb-6">
              Siparişiniz kontrol edilemedi. Lütfen daha sonra tekrar deneyin veya bizimle iletişime geçin.
            </p>
            <Link
              href="/"
              className="inline-block bg-blue-600 text-white px-6 py-2 rounded-md font-semibold hover:bg-blue-700 transition-colors"
            >
              Ana Sayfaya Dön
            </Link>
          </>
        )}
      </div>
    </div>
  );
}

export default function SuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
          <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Yükleniyor...</h1>
          </div>
        </div>
      }
    >
      <SuccessContent />
    </Suspense>
  );
}

