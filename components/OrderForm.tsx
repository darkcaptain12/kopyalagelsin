"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Script from "next/script";
import Image from "next/image";
import type { OrderFormData, PriceBreakdown } from "@/lib/types";
import type { AppConfig } from "@/lib/config";
import { calculateTotals } from "@/lib/pricing";
import type { Size, Color, Side, BindingType } from "@/lib/pricing";
import type { Coupon } from "@/lib/couponsStore";
import { calculateDiscount } from "@/lib/discounts";
import type { User } from "@/lib/usersStore";

// API'den dönen user objesi için tip
interface APIUser {
  id: string;
  name: string;
  email: string;
  referralCode?: string;
}

export default function OrderForm() {
  const [config, setConfig] = useState<AppConfig | null>(null);
  const [user, setUser] = useState<APIUser | null>(null);
  const [userLoading, setUserLoading] = useState(true);
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [selectedCouponCode, setSelectedCouponCode] = useState<string>("");
  const [formData, setFormData] = useState<OrderFormData>({
    size: "",
    color: "",
    side: "",
    bindingType: "",
    ciltCount: 1,
    pageCount: 0,
    customerName: "",
    email: "",
    phone: "",
    address: "",
    notes: "",
  });

  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [pdfPageCount, setPdfPageCount] = useState<number | null>(null);
  const [isDetectingPages, setIsDetectingPages] = useState(false);
  const [priceBreakdown, setPriceBreakdown] = useState<PriceBreakdown | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string>("");
  const [paymentToken, setPaymentToken] = useState<string | null>(null);
  const [orderId, setOrderId] = useState<string | null>(null);

  // Fetch config and user on mount
  useEffect(() => {
    // Check for URL error parameters
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const urlError = params.get("error");
      if (urlError === "payment_failed") {
        setError("Ödeme işlemi başarısız oldu. Lütfen tekrar deneyin.");
        // Clean URL
        window.history.replaceState({}, "", window.location.pathname);
      }
    }

    fetch("/api/config")
      .then((res) => res.json())
      .then((data) => setConfig(data))
      .catch(() => setError("Config yüklenemedi"));

    // Check if user is logged in
    fetch("/api/auth/me")
      .then((res) => res.json())
      .then((data) => {
        if (data.user) {
          setUser(data.user);
          // Fetch user coupons
          fetch(`/api/users/${data.user.id}/coupons`)
            .then((res) => res.json())
            .then((couponsData) => {
              const validCoupons = (couponsData.coupons || []).filter((c: Coupon) => {
                const now = new Date();
                const validFrom = new Date(c.validFrom);
                const validUntil = c.validUntil ? new Date(c.validUntil) : null;
                return (
                  c.isActive &&
                  c.usedCount < c.maxUses &&
                  now >= validFrom &&
                  (!validUntil || now <= validUntil)
                );
              });
              setCoupons(validCoupons);
              // Auto-select best coupon (highest discount)
              if (validCoupons.length > 0) {
                const bestCoupon = validCoupons.reduce((best: Coupon, current: Coupon) =>
                  current.discountPercent > best.discountPercent ? current : best
                );
                setSelectedCouponCode(bestCoupon.code);
              }
            });
        }
        setUserLoading(false);
      })
      .catch(() => {
        setUserLoading(false);
      });
  }, []);

  // Calculate price breakdown when form data changes
  useEffect(() => {
    if (
      config &&
      formData.size &&
      formData.color &&
      formData.side &&
      formData.bindingType &&
      formData.pageCount > 0
    ) {
      try {
        const pricingConfig = config.pricing || config;
        const breakdown = calculateTotals(
          pricingConfig,
          {
            size: formData.size as Size,
            color: formData.color as Color,
            side: formData.side as Side,
            bindingType: formData.bindingType as BindingType,
            ciltCount: formData.ciltCount || 0,
            pageCount: formData.pageCount,
          },
          config.season || null
        );

        // Apply discount if coupon selected
        let finalBreakdown = breakdown;
        if (selectedCouponCode && user && config) {
          const selectedCoupon = coupons.find((c) => c.code === selectedCouponCode);
          if (selectedCoupon) {
            // Base amount after season multiplier (use subtotal from breakdown which already includes season multiplier)
            const baseAmount = breakdown.subtotal;
            
            // Create full User object from API response for calculateDiscount
            // calculateDiscount only needs user.id, so we create a minimal User object
            const fullUser: User = {
              id: user.id,
              name: user.name,
              email: user.email,
              createdAt: new Date().toISOString(), // Default value since not available from API
              passwordHash: "", // Not needed for discount calculation
              referralCode: user.referralCode || "",
              referredByUserId: null,
            };
            
            const discountResult = calculateDiscount({
              baseAmount,
              user: fullUser,
              coupon: selectedCoupon,
              config,
              now: new Date(),
            });

            if (discountResult.applied) {
              const subtotalAfterDiscount = baseAmount - discountResult.discountAmount;
              const taxAfterDiscount = Math.round(subtotalAfterDiscount * config.pricing.kdvRate * 100) / 100;
              finalBreakdown = {
                ...breakdown,
                subtotal: subtotalAfterDiscount,
                tax: taxAfterDiscount,
                grandTotal: subtotalAfterDiscount + taxAfterDiscount,
              };
            }
          }
        }

        setPriceBreakdown(finalBreakdown);
      } catch (err) {
        setPriceBreakdown(null);
      }
    } else {
      setPriceBreakdown(null);
    }
  }, [config, formData.size, formData.color, formData.side, formData.bindingType, formData.ciltCount, formData.pageCount, selectedCouponCode, user, coupons]);

  // Scroll to form if hash is present and load merged PDF from sessionStorage
  useEffect(() => {
    const scrollToForm = () => {
      if (typeof window !== "undefined" && window.location.hash === "#siparis") {
        setTimeout(() => {
          const formElement = document.getElementById("siparis");
          if (formElement) {
            formElement.scrollIntoView({ behavior: "smooth", block: "start" });
          }
        }, 300); // Small delay to ensure DOM is ready
      }
    };

    scrollToForm();

    const loadMergedPdf = async () => {
      try {
        const mergedPdfData = sessionStorage.getItem("mergedPdfData");
        const mergedPdfFileName = sessionStorage.getItem("mergedPdfFileName");

        if (mergedPdfData && mergedPdfFileName) {
          // Convert base64 back to File
          const binaryString = atob(mergedPdfData);
          const bytes = new Uint8Array(binaryString.length);
          for (let i = 0; i < binaryString.length; i++) {
            bytes[i] = binaryString.charCodeAt(i);
          }
          const blob = new Blob([bytes], { type: "application/pdf" });
          const file = new File([blob], mergedPdfFileName, { type: "application/pdf" });

          setPdfFile(file);
          setError("");

          // Auto-detect page count
          const formData = new FormData();
          formData.append("pdf", file);
          setIsDetectingPages(true);
          fetch("/api/pdf/pages", {
            method: "POST",
            body: formData,
          })
            .then((res) => res.json())
            .then((data) => {
              if (data.pageCount) {
                setPdfPageCount(data.pageCount);
              }
            })
            .catch(() => {
              // Silent fail - user can enter page count manually
            })
            .finally(() => {
              setIsDetectingPages(false);
            });

          // Clear sessionStorage after loading
          sessionStorage.removeItem("mergedPdfData");
          sessionStorage.removeItem("mergedPdfFileName");

          // Scroll to form after PDF is loaded
          setTimeout(() => {
            const formElement = document.getElementById("siparis");
            if (formElement) {
              formElement.scrollIntoView({ behavior: "smooth", block: "start" });
            }
          }, 500);
        }
      } catch (error) {
        console.error("Error loading merged PDF from sessionStorage:", error);
      }
    };

    loadMergedPdf();
  }, []);

  // Listen for merged PDF from PDF merge tool (for same-page transfers)
  useEffect(() => {
    const handleMergedPdf = (event: Event) => {
      const customEvent = event as CustomEvent<{ file: File }>;
      if (customEvent.detail?.file) {
        setPdfFile(customEvent.detail.file);
        setError("");
        // Auto-detect page count for merged PDF
        const formData = new FormData();
        formData.append("pdf", customEvent.detail.file);
        setIsDetectingPages(true);
        fetch("/api/pdf/pages", {
          method: "POST",
          body: formData,
        })
          .then((res) => res.json())
          .then((data) => {
            if (data.pageCount) {
              setPdfPageCount(data.pageCount);
            }
          })
          .catch(() => {
            // Silent fail - user can enter page count manually
          })
          .finally(() => {
            setIsDetectingPages(false);
          });
      }
    };

    window.addEventListener("mergedPdfReady", handleMergedPdf as EventListener);
    return () => {
      window.removeEventListener("mergedPdfReady", handleMergedPdf as EventListener);
    };
  }, []);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== "application/pdf") {
      setError("Lütfen sadece PDF dosyası yükleyin.");
      return;
    }

    if (file.size > 50 * 1024 * 1024) {
      setError("Dosya boyutu 50 MB'dan küçük olmalıdır.");
      return;
    }

    setError("");
    setPdfFile(file);
    setPdfPageCount(null);

    setIsDetectingPages(true);
    const formData = new FormData();
    formData.append("pdf", file);

    try {
      const response = await fetch("/api/pdf/pages", {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        setPdfPageCount(data.pageCount);
      }
    } catch (err) {
      console.error("Error detecting page count:", err);
    } finally {
      setIsDetectingPages(false);
    }
  };

  const applyDetectedPageCount = () => {
    if (pdfPageCount !== null) {
      setFormData((prev) => ({ ...prev, pageCount: pdfPageCount }));
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "pageCount" || name === "ciltCount" ? parseInt(value) || 0 : value,
    }));
  };

  const handleRadioChange = (name: keyof OrderFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Reset ciltCount if binding is set to "none"
    if (name === "bindingType" && value === "none") {
      setFormData((prev) => ({ ...prev, ciltCount: 1 }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    console.log("Form submit başladı", { formData, priceBreakdown, pdfFile });

    if (!formData.size || !formData.color || !formData.side || !formData.bindingType) {
      const errorMsg = "Lütfen tüm baskı seçeneklerini doldurun.";
      setError(errorMsg);
      console.error("Validation error:", errorMsg);
      return;
    }

    if (!formData.pageCount || formData.pageCount <= 0) {
      const errorMsg = "Lütfen geçerli bir sayfa sayısı girin.";
      setError(errorMsg);
      console.error("Validation error:", errorMsg);
      return;
    }

    if (formData.bindingType !== "none" && (!formData.ciltCount || formData.ciltCount <= 0)) {
      const errorMsg = "Ciltleme seçildiğinde cilt sayısı gerekli.";
      setError(errorMsg);
      console.error("Validation error:", errorMsg);
      return;
    }

    if (!pdfFile) {
      const errorMsg = "Lütfen bir PDF dosyası yükleyin.";
      setError(errorMsg);
      console.error("Validation error:", errorMsg);
      return;
    }

    if (!formData.customerName || !formData.email || !formData.phone || !formData.address) {
      const errorMsg = "Lütfen tüm müşteri bilgilerini doldurun.";
      setError(errorMsg);
      console.error("Validation error:", errorMsg);
      return;
    }

    if (!priceBreakdown) {
      const errorMsg = "Fiyat hesaplanamadı. Lütfen formu kontrol edin.";
      setError(errorMsg);
      console.error("Validation error:", errorMsg, { config, formData });
      return;
    }

    setIsSubmitting(true);

    try {
      const uploadFormData = new FormData();
      uploadFormData.append("pdf", pdfFile);

      const uploadResponse = await fetch("/api/pdf/upload", {
        method: "POST",
        body: uploadFormData,
      });

      if (!uploadResponse.ok) {
        throw new Error("PDF yükleme başarısız oldu.");
      }

      const uploadData = await uploadResponse.json();
      
      // Extract PDF URL and metadata from upload response
      const pdfUrl = uploadData.pdfUrl;
      const pdfName = uploadData.pdfName;
      const pdfSize = uploadData.pdfSize;
      const uploadedPageCount = uploadData.pageCount || formData.pageCount;

      if (!pdfUrl) {
        throw new Error("PDF URL alınamadı. Lütfen tekrar deneyin.");
      }

      const paymentResponse = await fetch("/api/paytr/init", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          size: formData.size as Size,
          color: formData.color as Color,
          side: formData.side as Side,
          bindingType: formData.bindingType as BindingType,
          pageCount: uploadedPageCount, // Use page count from upload response
          pdfUrl,
          pdfName,
          pdfSize,
          priceBreakdown,
          couponCode: selectedCouponCode || null,
        }),
      });

      if (!paymentResponse.ok) {
        const errorData = await paymentResponse.json();
        throw new Error(errorData.error || "Ödeme başlatılamadı.");
      }

      const paymentData = await paymentResponse.json();

      if (paymentData.token) {
        // Set payment token to show iframe
        setPaymentToken(paymentData.token);
        setOrderId(paymentData.orderId || null);
        setIsSubmitting(false);
        // Scroll to payment iframe
        setTimeout(() => {
          const paymentElement = document.getElementById("paytr-iframe-container");
          if (paymentElement) {
            paymentElement.scrollIntoView({ behavior: "smooth", block: "center" });
          }
        }, 100);
      } else {
        throw new Error("Ödeme token'ı alınamadı.");
      }
    } catch (err: any) {
      console.error("Ödeme başlatma hatası:", err);
      const errorMessage = err.message || "Bir hata oluştu. Lütfen tekrar deneyin.";
      setError(errorMessage);
      setIsSubmitting(false);
      // Hata mesajını daha görünür hale getir
      setTimeout(() => {
        const errorElement = document.querySelector('[data-error="true"]');
        if (errorElement) {
          errorElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 100);
    }
  };

  return (
    <>
      {/* PayTR iFrame Resizer Script */}
      {paymentToken && (
        <Script
          src="https://www.paytr.com/js/iframeResizer.min.js"
          strategy="afterInteractive"
          onLoad={() => {
            // Initialize iframe resizer after script loads
            if (typeof window !== "undefined" && (window as any).iFrameResize) {
              (window as any).iFrameResize({}, "#paytriframe");
            }
          }}
        />
      )}
      
      <section id="siparis" className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 text-gray-900">
            Sipariş Formu
          </h2>

        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Form */}
          <div className="lg:col-span-2">
            <form 
              onSubmit={(e) => {
                console.log("Form onSubmit tetiklendi");
                handleSubmit(e);
              }} 
              className="bg-white rounded-lg shadow-lg p-6 space-y-6"
              noValidate
            >
              {error && (
                <div data-error="true" className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                  <strong>Hata:</strong> {error}
                </div>
              )}

              {/* Baskı Seçenekleri */}
              <div className="border-b pb-6">
                <h3 className="text-xl font-semibold mb-6 flex items-center gap-2">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Baskı Seçenekleri
                </h3>

                {/* Baskı Ebadı */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Baskı Ebadı <span className="text-red-500">*</span>
                  </label>
                  <div className="grid grid-cols-2 gap-4">
                    <label
                      className={`relative flex flex-col items-center justify-center p-4 border-2 rounded-lg cursor-pointer transition-all ${
                        formData.size === "A4"
                          ? "border-blue-600 bg-blue-50 shadow-md"
                          : "border-gray-300 hover:border-gray-400"
                      }`}
                    >
                      <input
                        type="radio"
                        name="size"
                        value="A4"
                        checked={formData.size === "A4"}
                        onChange={(e) => handleRadioChange("size", e.target.value)}
                        className="sr-only"
                      />
                      <div className="text-2xl font-bold mb-1">A4</div>
                      <div className="text-xs text-gray-600">Standart Boyut</div>
                      {formData.size === "A4" && (
                        <div className="absolute top-2 right-2">
                          <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                        </div>
                      )}
                    </label>
                    <label
                      className={`relative flex flex-col items-center justify-center p-4 border-2 rounded-lg cursor-pointer transition-all ${
                        formData.size === "A3"
                          ? "border-blue-600 bg-blue-50 shadow-md"
                          : "border-gray-300 hover:border-gray-400"
                      }`}
                    >
                      <input
                        type="radio"
                        name="size"
                        value="A3"
                        checked={formData.size === "A3"}
                        onChange={(e) => handleRadioChange("size", e.target.value)}
                        className="sr-only"
                      />
                      <div className="text-2xl font-bold mb-1">A3</div>
                      <div className="text-xs text-gray-600">Büyük Boyut</div>
                      {formData.size === "A3" && (
                        <div className="absolute top-2 right-2">
                          <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                        </div>
                      )}
                    </label>
                  </div>
                </div>

                {/* Baskı Rengi */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Baskı Rengi <span className="text-red-500">*</span>
                  </label>
                  <div className="grid grid-cols-2 gap-4">
                    <label
                      className={`relative flex flex-col items-center justify-center p-4 border-2 rounded-lg cursor-pointer transition-all ${
                        formData.color === "siyah_beyaz"
                          ? "border-blue-600 bg-blue-50 shadow-md"
                          : "border-gray-300 hover:border-gray-400"
                      }`}
                    >
                      <input
                        type="radio"
                        name="color"
                        value="siyah_beyaz"
                        checked={formData.color === "siyah_beyaz"}
                        onChange={(e) => handleRadioChange("color", e.target.value)}
                        className="sr-only"
                      />
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-8 h-8 rounded border-2 border-gray-800 bg-white"></div>
                        <span className="font-semibold">Siyah Beyaz</span>
                      </div>
                      <div className="text-xs text-gray-600">Ekonomik Seçenek</div>
                      {formData.color === "siyah_beyaz" && (
                        <div className="absolute top-2 right-2">
                          <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                        </div>
                      )}
                    </label>
                    <label
                      className={`relative flex flex-col items-center justify-center p-4 border-2 rounded-lg cursor-pointer transition-all ${
                        formData.color === "renkli"
                          ? "border-blue-600 bg-blue-50 shadow-md"
                          : "border-gray-300 hover:border-gray-400"
                      }`}
                    >
                      <input
                        type="radio"
                        name="color"
                        value="renkli"
                        checked={formData.color === "renkli"}
                        onChange={(e) => handleRadioChange("color", e.target.value)}
                        className="sr-only"
                      />
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-8 h-8 rounded bg-gradient-to-br from-red-500 via-yellow-500 to-blue-500"></div>
                        <span className="font-semibold">Renkli</span>
                      </div>
                      <div className="text-xs text-gray-600">Canlı Renkler</div>
                      {formData.color === "renkli" && (
                        <div className="absolute top-2 right-2">
                          <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                        </div>
                      )}
                    </label>
                  </div>
                </div>

                {/* Baskı Yönü */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Baskı Yönü <span className="text-red-500">*</span>
                  </label>
                  <div className="grid grid-cols-2 gap-4">
                    <label
                      className={`relative flex flex-col items-center justify-center p-4 border-2 rounded-lg cursor-pointer transition-all ${
                        formData.side === "tek"
                          ? "border-blue-600 bg-blue-50 shadow-md"
                          : "border-gray-300 hover:border-gray-400"
                      }`}
                    >
                      <input
                        type="radio"
                        name="side"
                        value="tek"
                        checked={formData.side === "tek"}
                        onChange={(e) => handleRadioChange("side", e.target.value)}
                        className="sr-only"
                      />
                      <div className="relative w-16 h-16 mb-2">
                        <Image
                          src="/urun_tipleri/tek_yön.png"
                          alt="Tek Yön"
                          fill
                          className="object-contain"
                        />
                      </div>
                      <span className="font-semibold">Tek Yön</span>
                      {formData.side === "tek" && (
                        <div className="absolute top-2 right-2">
                          <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                        </div>
                      )}
                    </label>
                    <label
                      className={`relative flex flex-col items-center justify-center p-4 border-2 rounded-lg cursor-pointer transition-all ${
                        formData.side === "cift"
                          ? "border-blue-600 bg-blue-50 shadow-md"
                          : "border-gray-300 hover:border-gray-400"
                      }`}
                    >
                      <input
                        type="radio"
                        name="side"
                        value="cift"
                        checked={formData.side === "cift"}
                        onChange={(e) => handleRadioChange("side", e.target.value)}
                        className="sr-only"
                      />
                      <div className="relative w-16 h-16 mb-2">
                        <Image
                          src="/urun_tipleri/çift_yön.png"
                          alt="Çift Yön"
                          fill
                          className="object-contain"
                        />
                      </div>
                      <span className="font-semibold">Çift Yön</span>
                      {formData.side === "cift" && (
                        <div className="absolute top-2 right-2">
                          <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                        </div>
                      )}
                    </label>
                  </div>
                </div>

                {/* Ciltleme */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Ciltleme Tipi <span className="text-red-500">*</span>
                  </label>
                  <div className="grid grid-cols-3 gap-4">
                    <label
                      className={`relative flex flex-col items-center justify-center p-4 border-2 rounded-lg cursor-pointer transition-all ${
                        formData.bindingType === "none"
                          ? "border-blue-600 bg-blue-50 shadow-md"
                          : "border-gray-300 hover:border-gray-400"
                      }`}
                    >
                      <input
                        type="radio"
                        name="bindingType"
                        value="none"
                        checked={formData.bindingType === "none"}
                        onChange={(e) => handleRadioChange("bindingType", e.target.value)}
                        className="sr-only"
                      />
                      <svg className="w-8 h-8 mb-2 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                      <span className="font-semibold text-sm">Yok</span>
                      {formData.bindingType === "none" && (
                        <div className="absolute top-2 right-2">
                          <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                        </div>
                      )}
                    </label>
                    <label
                      className={`relative flex flex-col items-center justify-center p-4 border-2 rounded-lg cursor-pointer transition-all ${
                        formData.bindingType === "spiral"
                          ? "border-blue-600 bg-blue-50 shadow-md"
                          : "border-gray-300 hover:border-gray-400"
                      }`}
                    >
                      <input
                        type="radio"
                        name="bindingType"
                        value="spiral"
                        checked={formData.bindingType === "spiral"}
                        onChange={(e) => handleRadioChange("bindingType", e.target.value)}
                        className="sr-only"
                      />
                      <svg className="w-8 h-8 mb-2 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                      <span className="font-semibold text-sm">Spiral</span>
                      {formData.bindingType === "spiral" && (
                        <div className="absolute top-2 right-2">
                          <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                        </div>
                      )}
                    </label>
                    <label
                      className={`relative flex flex-col items-center justify-center p-4 border-2 rounded-lg cursor-pointer transition-all ${
                        formData.bindingType === "american"
                          ? "border-blue-600 bg-blue-50 shadow-md"
                          : "border-gray-300 hover:border-gray-400"
                      }`}
                    >
                      <input
                        type="radio"
                        name="bindingType"
                        value="american"
                        checked={formData.bindingType === "american"}
                        onChange={(e) => handleRadioChange("bindingType", e.target.value)}
                        className="sr-only"
                      />
                      <svg className="w-8 h-8 mb-2 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                      </svg>
                      <span className="font-semibold text-sm">Amerikan</span>
                      {formData.bindingType === "american" && (
                        <div className="absolute top-2 right-2">
                          <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                        </div>
                      )}
                    </label>
                  </div>
                </div>

                {/* Cilt Sayısı */}
                {formData.bindingType !== "none" && (
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Cilt Sayısı <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      name="ciltCount"
                      value={formData.ciltCount || ""}
                      onChange={handleInputChange}
                      min="1"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                )}

                {/* Sayfa Sayısı */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Sayfa Sayısı <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <input
                      type="number"
                      name="pageCount"
                      value={formData.pageCount || ""}
                      onChange={handleInputChange}
                      min="1"
                      className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                      placeholder="Sayfa sayısını girin"
                      required
                    />
                  </div>
                  {pdfPageCount !== null && (
                    <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span className="text-sm font-medium text-green-800">
                          PDF sayfa sayısı otomatik tespit edildi: <strong>{pdfPageCount} sayfa</strong>
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={applyDetectedPageCount}
                        className="text-sm bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors font-medium"
                      >
                        Buraya Aktar
                      </button>
                    </div>
                  )}
                  {isDetectingPages && (
                    <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg flex items-center gap-2">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
                      <p className="text-sm text-blue-800">Sayfa sayısı tespit ediliyor...</p>
                    </div>
                  )}
                </div>

                {/* PDF Yükleme */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-medium text-gray-700">
                      PDF Dosyası <span className="text-red-500">*</span>
                    </label>
                    <Link
                      href="/pdf-birlestir"
                      className="text-xs text-blue-600 hover:text-blue-800 underline flex items-center gap-1 transition"
                    >
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 4v16m8-8H4"
                        />
                      </svg>
                      PDF Birleştir
                    </Link>
                  </div>
                  <div className="relative">
                    <input
                      type="file"
                      accept="application/pdf"
                      onChange={handleFileChange}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      required
                      id="pdf-upload"
                    />
                    <label
                      htmlFor="pdf-upload"
                      className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 hover:border-blue-500 transition-colors"
                    >
                      {pdfFile ? (
                        <>
                          <svg className="w-10 h-10 text-green-500 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <p className="text-sm font-medium text-gray-700">{pdfFile.name}</p>
                          <p className="text-xs text-gray-500">({(pdfFile.size / 1024 / 1024).toFixed(2)} MB)</p>
                        </>
                      ) : (
                        <>
                          <svg className="w-10 h-10 text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                          </svg>
                          <p className="text-sm text-gray-600">
                            <span className="font-semibold text-blue-600">Dosya seçmek için tıklayın</span> veya sürükleyip bırakın
                          </p>
                          <p className="text-xs text-gray-500 mt-1">PDF formatında (Maks. 50MB)</p>
                        </>
                      )}
                    </label>
                  </div>
                </div>
              </div>

              {/* Kupon Seçimi ve Üyelik Bilgilendirmesi */}
              {!user && (
                <div className="border-b pb-6 mb-6 bg-blue-50 p-4 rounded-lg">
                  <p className="text-sm text-blue-800">
                    <strong>💡 İpucu:</strong> Üye olup giriş yaparsanız, hesabınıza tanımlanan indirim kuponlarını kullanabilirsiniz. 
                    <Link href="/uye-ol" className="text-blue-600 underline ml-1">Üye Ol</Link> veya{" "}
                    <Link href="/giris" className="text-blue-600 underline">Giriş Yap</Link>
                  </p>
                </div>
              )}
              {user && coupons.length > 0 && (
                <div className="border-b pb-6 mb-6">
                  <h3 className="text-xl font-semibold mb-4">Kupon Kullan</h3>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Kupon Seçin
                    </label>
                    <select
                      value={selectedCouponCode}
                      onChange={(e) => setSelectedCouponCode(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Kupon kullanma</option>
                      {coupons.map((coupon) => (
                        <option key={coupon.code} value={coupon.code}>
                          {coupon.code} – %{coupon.discountPercent} (
                          {coupon.type === "WELCOME" ? "Hoş Geldin" : "Referans"})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              )}

              {/* Müşteri Bilgileri */}
              <div className="border-b pb-6">
                <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  Müşteri Bilgileri
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Ad Soyad <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="customerName"
                      value={formData.customerName}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      E-posta <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Telefon <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                </div>

                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Teslimat Adresi <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Not (Opsiyonel)
                  </label>
                  <textarea
                    name="notes"
                    value={formData.notes}
                    onChange={handleInputChange}
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting || !priceBreakdown}
                className="w-full bg-blue-600 text-white py-3 px-4 rounded-md font-semibold hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                onClick={() => {
                  console.log("Ödeme butonu tıklandı", { 
                    isSubmitting, 
                    priceBreakdown: !!priceBreakdown, 
                    formData,
                    config: !!config 
                  });
                }}
              >
                {isSubmitting 
                  ? "İşleniyor..." 
                  : !priceBreakdown 
                    ? "Fiyat Hesaplanıyor..." 
                    : "Ödemeye Geç"}
              </button>
              {!priceBreakdown && (
                <p className="text-sm text-gray-500 mt-2 text-center">
                  Fiyat hesaplamak için tüm form alanlarını doldurun.
                </p>
              )}
            </form>
            
            {/* PayTR Payment iFrame */}
            {paymentToken && (
              <div id="paytr-iframe-container" className="mt-6 bg-white rounded-lg shadow-lg p-6">
                <h3 className="text-xl font-semibold mb-4">Ödeme İşlemi</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Lütfen aşağıdaki ödeme formunu doldurun. Güvenli ödeme için PayTR altyapısı kullanılmaktadır.
                </p>
                <div className="border border-gray-200 rounded-lg overflow-hidden">
                  <iframe
                    src={`https://www.paytr.com/odeme/guvenli/${paymentToken}`}
                    id="paytriframe"
                    frameBorder="0"
                    scrolling="no"
                    style={{ width: "100%", minHeight: "600px" }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Price Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-lg p-6 sticky top-20">
              <h3 className="text-xl font-semibold mb-4">Canlı Fiyat Hesaplama</h3>
              {priceBreakdown ? (
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span>Baskı Ücreti:</span>
                    <span className="font-medium">{priceBreakdown.printCost.toFixed(2)} ₺</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Ciltleme Ücreti:</span>
                    <span className="font-medium">{priceBreakdown.bindingCost.toFixed(2)} ₺</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Kargo Ücreti:</span>
                    <span className="font-medium">{priceBreakdown.shippingCost.toFixed(2)} ₺</span>
                  </div>
                  <div className="border-t border-gray-300 pt-3 flex justify-between">
                    <span>Ara Toplam (KDV Hariç):</span>
                    <span className="font-medium">{(priceBreakdown.subtotal || 0).toFixed(2)} ₺</span>
                  </div>
                  {selectedCouponCode && user && (
                    <div className="flex justify-between text-green-600">
                      <span>İndirim:</span>
                      <span className="font-medium">
                        -{((priceBreakdown.printCost + priceBreakdown.bindingCost + priceBreakdown.shippingCost) - (priceBreakdown.subtotal || 0)).toFixed(2)} ₺
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span>KDV (%{priceBreakdown.subtotal > 0 ? ((priceBreakdown.tax / priceBreakdown.subtotal) * 100).toFixed(0) : '0'}):</span>
                    <span className="font-medium">{(priceBreakdown.tax || 0).toFixed(2)} ₺</span>
                  </div>
                  <div className="border-t border-gray-300 pt-3 flex justify-between text-lg font-bold">
                    <span>Genel Toplam:</span>
                    <span className="text-blue-600">{priceBreakdown.grandTotal.toFixed(2)} ₺</span>
                  </div>

                  {/* Cilt Tipi Görseli */}
                  {formData.bindingType === "spiral" && (
                    <div className="mt-6 pt-6 border-t border-gray-300">
                      <h4 className="text-sm font-semibold text-gray-700 mb-3 text-center">
                        Spiral Cilt Görünümü
                      </h4>
                      <div className="relative w-full h-48 rounded-lg overflow-hidden">
                        <Image
                          src="/urun_tipleri/tel.png"
                          alt="Spiral Cilt"
                          fill
                          className="object-contain"
                          priority={false}
                        />
                      </div>
                    </div>
                  )}

                  {formData.bindingType === "american" && (
                    <div className="mt-6 pt-6 border-t border-gray-300">
                      <h4 className="text-sm font-semibold text-gray-700 mb-3 text-center">
                        Amerikan Cilt Görünümü
                      </h4>
                      <div className="relative w-full h-48 rounded-lg overflow-hidden">
                        <Image
                          src="/urun_tipleri/amerikan.png"
                          alt="Amerikan Cilt"
                          fill
                          className="object-contain"
                          priority={false}
                        />
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-gray-500 text-sm">
                  Fiyat hesaplamak için lütfen form alanlarını doldurun.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
    </>
  );
}

