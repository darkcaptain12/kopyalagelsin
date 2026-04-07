"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface SignupPopupProps {
  enabled: boolean;
  discountPercent: number;
}

export default function SignupPopup({ enabled, discountPercent }: SignupPopupProps) {
  const router = useRouter();
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (!enabled) return;

    // Check if already shown in this session
    const hasSeenPopup = sessionStorage.getItem("signup_popup_shown");
    if (hasSeenPopup) return;

    // Check if user is logged in
    fetch("/api/auth/me")
      .then((res) => res.json())
      .then((data) => {
        if (!data.user) {
          // Show popup after a short delay
          setTimeout(() => setShow(true), 2000);
        }
      })
      .catch(() => {});
  }, [enabled]);

  const handleClose = () => {
    setShow(false);
    sessionStorage.setItem("signup_popup_shown", "true");
  };

  const handleSignup = () => {
    sessionStorage.setItem("signup_popup_shown", "true");
    router.push("/uye-ol");
  };

  const handleContinue = () => {
    handleClose();
  };

  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6 relative">
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>

        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          Üye Ol, %{discountPercent} İndirim Kazan!
        </h2>
        <p className="text-gray-600 mb-6">
          Üye olup sipariş verdiğinde, hesabına tanımlanan tek kullanımlık kupon ile %{discountPercent} indirim kazan. Dilersen üye olmadan da devam edebilirsin.
        </p>

        <div className="flex gap-3">
          <button
            onClick={handleSignup}
            className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-md font-semibold hover:bg-blue-700 transition-colors"
          >
            Üye Olarak Devam Et
          </button>
          <button
            onClick={handleContinue}
            className="flex-1 bg-gray-200 text-gray-800 px-4 py-2 rounded-md font-semibold hover:bg-gray-300 transition-colors"
          >
            Üyeliksiz Devam Et
          </button>
        </div>
      </div>
    </div>
  );
}

