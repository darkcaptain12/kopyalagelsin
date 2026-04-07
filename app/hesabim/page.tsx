"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import AnnouncementBar from "@/components/AnnouncementBar";
import Footer from "@/components/Footer";
import type { Coupon } from "@/lib/couponsStore";
import type { Order } from "@/lib/ordersStore";

interface User {
  id: string;
  name: string;
  email: string;
  referralCode: string;
}

export default function AccountPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"info" | "coupons" | "referral" | "orders">("info");

  const fetchUserData = useCallback(async () => {
    try {
      const userRes = await fetch("/api/auth/me");
      const userData = await userRes.json();

      if (!userData.user) {
        router.push("/giris");
        return;
      }

      setUser(userData.user);

      // Fetch coupons
      const couponsRes = await fetch(`/api/users/${userData.user.id}/coupons`);
      if (couponsRes.ok) {
        const couponsData = await couponsRes.json();
        setCoupons(couponsData.coupons || []);
      }

      // Fetch orders
      const ordersRes = await fetch(`/api/users/${userData.user.id}/orders`);
      if (ordersRes.ok) {
        const ordersData = await ordersRes.json();
        setOrders(ordersData.orders || []);
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    fetchUserData();
  }, [fetchUserData]);

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/");
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString("tr-TR");
  };

  const formatCurrency = (amount: number) => {
    return `${amount.toFixed(2)} ₺`;
  };

  const getCouponStatus = (coupon: Coupon) => {
    const now = new Date();
    const validFrom = new Date(coupon.validFrom);
    const validUntil = coupon.validUntil ? new Date(coupon.validUntil) : null;

    if (!coupon.isActive) return "Pasif";
    if (coupon.usedCount >= coupon.maxUses) return "Kullanıldı";
    if (now < validFrom) return "Henüz Geçerli Değil";
    if (validUntil && now > validUntil) return "Süresi Dolmuş";
    return "Kullanılabilir";
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const referralLink = `${typeof window !== "undefined" ? window.location.origin : ""}/uye-ol?ref=${user.referralCode}`;

  return (
    <div className="min-h-screen bg-gray-50">
      <AnnouncementBar />
      <Navbar />
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex justify-between items-center mb-6 border-b pb-4">
            <div className="flex items-center gap-4">
              <h1 className="text-2xl font-bold text-gray-900">Hesabım</h1>
              <Link
                href="/"
                className="text-sm text-blue-600 hover:text-blue-800 transition"
              >
                ← Anasayfaya Dön
              </Link>
            </div>
            <button
              onClick={handleLogout}
              className="text-sm text-gray-600 hover:text-gray-900"
            >
              Çıkış Yap
            </button>
          </div>

          {/* Tabs */}
          <div className="flex border-b mb-6">
            <button
              onClick={() => setActiveTab("info")}
              className={`px-6 py-3 font-medium ${
                activeTab === "info"
                  ? "border-b-2 border-blue-600 text-blue-600"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              Hesap Bilgileri
            </button>
            <button
              onClick={() => setActiveTab("coupons")}
              className={`px-6 py-3 font-medium ${
                activeTab === "coupons"
                  ? "border-b-2 border-blue-600 text-blue-600"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              Kuponlarım
            </button>
            <button
              onClick={() => setActiveTab("referral")}
              className={`px-6 py-3 font-medium ${
                activeTab === "referral"
                  ? "border-b-2 border-blue-600 text-blue-600"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              Referans Programı
            </button>
            <button
              onClick={() => setActiveTab("orders")}
              className={`px-6 py-3 font-medium ${
                activeTab === "orders"
                  ? "border-b-2 border-blue-600 text-blue-600"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              Siparişlerim
            </button>
          </div>

          {/* Tab Content */}
          {activeTab === "info" && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Ad Soyad</label>
                <p className="text-gray-900">{user.name}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">E-posta</label>
                <p className="text-gray-900">{user.email}</p>
              </div>
            </div>
          )}

          {activeTab === "coupons" && (
            <div>
              {coupons.length === 0 ? (
                <p className="text-gray-600 text-center py-8">Henüz kuponunuz bulunmamaktadır.</p>
              ) : (
                <div className="space-y-4">
                  {coupons.map((coupon) => (
                    <div
                      key={coupon.code}
                      className="border rounded-lg p-4 hover:shadow-md transition"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="font-semibold text-lg text-gray-900">{coupon.code}</div>
                          <div className="text-sm text-gray-600 mt-1">
                            Tip: {coupon.type === "WELCOME" ? "Hoş Geldin" : "Referans"}
                          </div>
                          <div className="text-sm text-gray-600">
                            İndirim: %{coupon.discountPercent}
                          </div>
                          <div className="text-sm text-gray-600">
                            Geçerlilik: {new Date(coupon.validFrom).toLocaleDateString("tr-TR")}
                            {coupon.validUntil
                              ? ` - ${new Date(coupon.validUntil).toLocaleDateString("tr-TR")}`
                              : " (Süresiz)"}
                          </div>
                          <div className="text-sm text-gray-600">
                            Durum: {getCouponStatus(coupon)}
                          </div>
                        </div>
                        <div className="text-right">
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-semibold ${
                              getCouponStatus(coupon) === "Kullanılabilir"
                                ? "bg-green-100 text-green-800"
                                : "bg-gray-100 text-gray-800"
                            }`}
                          >
                            {getCouponStatus(coupon)}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === "referral" && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-4">Referans Bilgileriniz</h3>
                <div className="bg-blue-50 rounded-lg p-4 space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Referans Kodunuz
                    </label>
                    <div className="flex items-center gap-2">
                      <code className="bg-white px-3 py-2 rounded border font-mono text-lg">
                        {user.referralCode}
                      </code>
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(user.referralCode);
                          alert("Kod kopyalandı!");
                        }}
                        className="text-blue-600 hover:text-blue-800 text-sm"
                      >
                        Kopyala
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Davet Linkiniz
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={referralLink}
                        readOnly
                        className="flex-1 bg-white px-3 py-2 rounded border text-sm"
                      />
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(referralLink);
                          alert("Link kopyalandı!");
                        }}
                        className="text-blue-600 hover:text-blue-800 text-sm whitespace-nowrap"
                      >
                        Kopyala
                      </button>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm text-gray-600">
                  Arkadaşlarınızı davet edin! Davet ettiğiniz kişi ilk siparişini tamamladığında,
                  hesabınıza %5 indirim kuponu tanımlanacak.
                </p>
              </div>
            </div>
          )}

          {activeTab === "orders" && (
            <div>
              {orders.length === 0 ? (
                <p className="text-gray-600 text-center py-8">Henüz siparişiniz bulunmamaktadır.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Sipariş No
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Tarih
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Tutar
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Durum
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {orders.map((order) => (
                        <tr key={order.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-900">
                            {order.id.substring(0, 8)}...
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {formatDate(order.createdAt)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {formatCurrency(order.totalAmount)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span
                              className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                order.paytrStatus === "paid"
                                  ? "bg-green-100 text-green-800"
                                  : order.paytrStatus === "pending"
                                  ? "bg-yellow-100 text-yellow-800"
                                  : "bg-red-100 text-red-800"
                              }`}
                            >
                              {order.paytrStatus === "paid"
                                ? "Ödendi"
                                : order.paytrStatus === "pending"
                                ? "Beklemede"
                                : "Başarısız"}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
}

