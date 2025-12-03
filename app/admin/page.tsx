"use client";

import { useState, useEffect } from "react";
import type { Order } from "@/lib/ordersStore";
import type { AppConfig } from "@/lib/config";
import type { Coupon } from "@/lib/couponsStore";

type Tab = "orders" | "pricing" | "marketing" | "ui" | "campaign";

export default function AdminPage() {
  const [password, setPassword] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>("orders");
  const [orders, setOrders] = useState<Order[]>([]);
  const [config, setConfig] = useState<AppConfig | null>(null);
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [saveLoading, setSaveLoading] = useState(false);
  const [bannerUploading, setBannerUploading] = useState(false);
  const [showClearOrdersModal, setShowClearOrdersModal] = useState(false);
  const [clearConfirmText, setClearConfirmText] = useState("");
  const [clearLoading, setClearLoading] = useState(false);
  const [showLogModal, setShowLogModal] = useState(false);
  const [logMessage, setLogMessage] = useState("");
  const [logs, setLogs] = useState<any[]>([]);
  const [logLoading, setLogLoading] = useState(false);
  
  // Filter states
  const [searchName, setSearchName] = useState("");
  const [searchOrderId, setSearchOrderId] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [filterView, setFilterView] = useState<"all" | "today" | "archive">("today");


  const fetchOrders = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (searchName) params.append("searchName", searchName);
      if (searchOrderId) params.append("searchOrderId", searchOrderId);
      if (dateFrom) params.append("dateFrom", dateFrom);
      if (dateTo) params.append("dateTo", dateTo);
      if (selectedDate) params.append("selectedDate", selectedDate);
      
      // If viewing today, set selectedDate to today
      if (filterView === "today") {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        params.append("selectedDate", today.toISOString().split("T")[0]);
      }
      
      const queryString = params.toString();
      const url = `/api/admin/orders${queryString ? `?${queryString}` : ""}`;
      
      const response = await fetch(url);
      if (response.ok) {
        const data = await response.json();
        setOrders(data.orders || []);
      }
    } catch (err) {
      setError("Siparişler yüklenemedi.");
    } finally {
      setLoading(false);
    }
  };
  
  // Initial load
  useEffect(() => {
    const authStatus = sessionStorage.getItem("admin_authenticated");
    if (authStatus === "true") {
      setIsAuthenticated(true);
    } else {
      setLoading(false);
    }
  }, []);
  
  // Load data after authentication and when filters change
  useEffect(() => {
    if (isAuthenticated) {
      fetchOrders();
      fetchConfig();
      fetchCoupons();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, searchName, searchOrderId, dateFrom, dateTo, selectedDate, filterView]);

  const fetchConfig = async () => {
    try {
      const response = await fetch("/api/config");
      if (response.ok) {
        const data = await response.json();
        setConfig(data);
      }
    } catch (err) {
      console.error("Config yüklenemedi:", err);
    }
  };

  const fetchCoupons = async () => {
    try {
      const response = await fetch("/api/admin/coupons");
      if (response.ok) {
        const data = await response.json();
        setCoupons(data.coupons || []);
      }
    } catch (err) {
      console.error("Kuponlar yüklenemedi:", err);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      const response = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });

      if (response.ok) {
        setIsAuthenticated(true);
        sessionStorage.setItem("admin_authenticated", "true");
        fetchOrders();
        fetchConfig();
      } else {
        setError("Yanlış şifre.");
      }
    } catch (err) {
      setError("Giriş başarısız oldu.");
    }
  };

  const handleSaveConfig = async () => {
    if (!config) return;

    setSaveLoading(true);
    setError("");

    try {
      const response = await fetch("/api/config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(config),
      });

      if (response.ok) {
        alert("Fiyatlandırma başarıyla kaydedildi!");
      } else {
        const data = await response.json();
        setError(data.error || "Kayıt başarısız oldu.");
      }
    } catch (err) {
      setError("Kayıt başarısız oldu.");
    } finally {
      setSaveLoading(false);
    }
  };

  const handleClearOrders = async () => {
    if (clearConfirmText !== "EVET_SIFIRLA") {
      setError("Lütfen onay metnini doğru girin: EVET_SIFIRLA");
      return;
    }

    setClearLoading(true);
    setError("");

    try {
      const response = await fetch("/api/admin/orders/clear", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          confirm: clearConfirmText,
          adminUser: "Admin",
        }),
      });

      const data = await response.json();

      if (response.ok) {
        alert(data.message || "Siparişler başarıyla sıfırlandı!");
        setShowClearOrdersModal(false);
        setClearConfirmText("");
        fetchOrders(); // Refresh orders list
      } else {
        setError(data.error || "Siparişler sıfırlanamadı.");
      }
    } catch (err) {
      setError("Siparişler sıfırlanamadı.");
    } finally {
      setClearLoading(false);
    }
  };

  const fetchLogs = async () => {
    setLogLoading(true);
    try {
      const response = await fetch("/api/admin/logs");
      if (response.ok) {
        const data = await response.json();
        setLogs(data.logs || []);
      }
    } catch (err) {
      console.error("Loglar yüklenemedi:", err);
    } finally {
      setLogLoading(false);
    }
  };

  const handleAddLog = async () => {
    if (!logMessage.trim()) {
      setError("Lütfen log mesajı girin.");
      return;
    }

    setLogLoading(true);
    setError("");

    try {
      const response = await fetch("/api/admin/logs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "add",
          message: logMessage,
          adminUser: "Admin",
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setLogMessage("");
        await fetchLogs(); // Refresh logs
        alert("Log başarıyla kaydedildi!");
      } else {
        setError(data.error || "Log kaydedilemedi.");
      }
    } catch (err) {
      setError("Log kaydedilemedi.");
    } finally {
      setLogLoading(false);
    }
  };

  const handleDownloadPDF = (order: Order) => {
    // Use pdfUrl (Vercel Blob) if available, fallback to old pdfPath for backward compatibility
    if (order.pdfUrl) {
      window.open(order.pdfUrl, "_blank", "noopener,noreferrer");
    } else if (order.pdfPath) {
      // Legacy support: try to serve via old route
      window.open(`/api/admin/pdf/${encodeURIComponent(order.pdfPath)}`, "_blank");
    } else {
      alert("PDF bulunamadı.");
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString("tr-TR");
  };

  const formatCurrency = (amount: number) => {
    return `${amount.toFixed(2)} ₺`;
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "paid": return "Ödendi";
      case "pending": return "Beklemede";
      case "failed": return "Başarısız";
      default: return status;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "paid": return "bg-green-100 text-green-800";
      case "pending": return "bg-yellow-100 text-yellow-800";
      case "failed": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-6 text-center">Admin Girişi</h1>
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}
          <form onSubmit={handleLogin}>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Şifre</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md font-semibold hover:bg-blue-700 transition-colors"
            >
              Giriş Yap
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex justify-between items-center mb-6 border-b pb-4">
            <h1 className="text-2xl font-bold text-gray-900">Admin Paneli</h1>
            <button
              onClick={() => {
                sessionStorage.removeItem("admin_authenticated");
                setIsAuthenticated(false);
              }}
              className="text-sm text-gray-600 hover:text-gray-900"
            >
              Çıkış
            </button>
          </div>

          {/* Tabs */}
          <div className="flex border-b mb-6">
            <button
              onClick={() => setActiveTab("orders")}
              className={`px-6 py-3 font-medium ${
                activeTab === "orders"
                  ? "border-b-2 border-blue-600 text-blue-600"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              Siparişler
            </button>
            <button
              onClick={() => setActiveTab("pricing")}
              className={`px-6 py-3 font-medium ${
                activeTab === "pricing"
                  ? "border-b-2 border-blue-600 text-blue-600"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              Fiyatlandırma
            </button>
            <button
              onClick={() => setActiveTab("marketing")}
              className={`px-6 py-3 font-medium ${
                activeTab === "marketing"
                  ? "border-b-2 border-blue-600 text-blue-600"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              İndirimler & Kampanyalar
            </button>
            <button
              onClick={() => setActiveTab("ui")}
              className={`px-6 py-3 font-medium ${
                activeTab === "ui"
                  ? "border-b-2 border-blue-600 text-blue-600"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              Sayfa Tasarımı
            </button>
            <button
              onClick={() => setActiveTab("campaign")}
              className={`px-6 py-3 font-medium ${
                activeTab === "campaign"
                  ? "border-b-2 border-blue-600 text-blue-600"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              Kampanya Modu
            </button>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}

          {/* Orders Tab */}
          {activeTab === "orders" && (
            <>
              {/* Filter Section */}
              <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                <div className="mb-4">
                  <h3 className="text-lg font-semibold mb-4">Filtreleme & Arama</h3>
                  
                  {/* View Toggle */}
                  <div className="flex gap-2 mb-4">
                    <button
                      onClick={() => {
                        setFilterView("today");
                        setSelectedDate("");
                        setDateFrom("");
                        setDateTo("");
                      }}
                      className={`px-4 py-2 rounded-lg font-medium transition ${
                        filterView === "today"
                          ? "bg-blue-600 text-white"
                          : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                      }`}
                    >
                      Bugünün Siparişleri
                    </button>
                    <button
                      onClick={() => {
                        setFilterView("archive");
                        const today = new Date();
                        today.setHours(0, 0, 0, 0);
                        setSelectedDate(today.toISOString().split("T")[0]);
                        setDateFrom("");
                        setDateTo("");
                      }}
                      className={`px-4 py-2 rounded-lg font-medium transition ${
                        filterView === "archive"
                          ? "bg-blue-600 text-white"
                          : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                      }`}
                    >
                      Günlük Arşiv
                    </button>
                    <button
                      onClick={() => {
                        setFilterView("all");
                        setSelectedDate("");
                        setDateFrom("");
                        setDateTo("");
                      }}
                      className={`px-4 py-2 rounded-lg font-medium transition ${
                        filterView === "all"
                          ? "bg-blue-600 text-white"
                          : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                      }`}
                    >
                      Tüm Siparişler
                    </button>
                  </div>

                  {/* Archive Date Picker */}
                  {filterView === "archive" && (
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Arşiv Tarihi Seçin
                      </label>
                      <input
                        type="date"
                        value={selectedDate}
                        onChange={(e) => setSelectedDate(e.target.value)}
                        max={new Date().toISOString().split("T")[0]}
                        className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  )}

                  {/* Search Fields */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Ad Soyad ile Ara
                      </label>
                      <input
                        type="text"
                        value={searchName}
                        onChange={(e) => setSearchName(e.target.value)}
                        placeholder="Müşteri adı soyadı..."
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Sipariş No ile Ara
                      </label>
                      <input
                        type="text"
                        value={searchOrderId}
                        onChange={(e) => setSearchOrderId(e.target.value)}
                        placeholder="Sipariş ID..."
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  {/* Date Range Filter (for "all" view) */}
                  {filterView === "all" && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Başlangıç Tarihi
                        </label>
                        <input
                          type="date"
                          value={dateFrom}
                          onChange={(e) => setDateFrom(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Bitiş Tarihi
                        </label>
                        <input
                          type="date"
                          value={dateTo}
                          onChange={(e) => setDateTo(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>
                  )}

                  {/* Clear Filters Button */}
                  {(searchName || searchOrderId || dateFrom || dateTo || selectedDate) && (
                    <div className="mt-4">
                      <button
                        onClick={() => {
                          setSearchName("");
                          setSearchOrderId("");
                          setDateFrom("");
                          setDateTo("");
                          setSelectedDate("");
                        }}
                        className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition"
                      >
                        Filtreleri Temizle
                      </button>
                    </div>
                  )}
                </div>
                
                {/* Results Count */}
                <div className="text-sm text-gray-600">
                  <strong>{orders.length}</strong> sipariş bulundu
                </div>
              </div>

              {loading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="mt-2 text-gray-600">Yükleniyor...</p>
                </div>
              ) : orders.length === 0 ? (
                <p className="text-gray-600 text-center py-8">Filtrelere uygun sipariş bulunamadı.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tarih</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Müşteri</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">E-posta</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Telefon</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tutar</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Durum</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">PDF</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {orders.map((order) => (
                        <tr key={order.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-900">
                            <span className="font-semibold" title={order.id}>
                              {order.id}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {formatDate(order.createdAt)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {order.customerName}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{order.email}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{order.phone}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {formatCurrency(order.totalAmount)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span
                              className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(
                                order.paytrStatus
                              )}`}
                            >
                              {getStatusText(order.paytrStatus)}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            <button
                              onClick={() => handleDownloadPDF(order)}
                              className="text-blue-600 hover:text-blue-900"
                              disabled={!order.pdfUrl && !order.pdfPath}
                            >
                              İndir
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Admin Actions Section */}
              <div className="mt-8 bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-semibold mb-4">Yönetim İşlemleri</h3>
                <div className="flex flex-wrap gap-4">
                  <button
                    onClick={() => setShowClearOrdersModal(true)}
                    className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition font-medium"
                  >
                    Tüm Siparişleri Sıfırla
                  </button>
                  <button
                    onClick={() => {
                      setShowLogModal(true);
                      fetchLogs();
                    }}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition font-medium"
                  >
                    Manuel Log Kaydet
                  </button>
                </div>
              </div>
            </>
          )}

          {/* Clear Orders Modal */}
          {showClearOrdersModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full mx-4">
                <h3 className="text-xl font-bold text-gray-900 mb-4">Siparişleri Sıfırla</h3>
                <p className="text-gray-700 mb-4">
                  <strong className="text-red-600">UYARI:</strong> Bu işlem tüm siparişleri kalıcı olarak silecektir. 
                  Bu işlem geri alınamaz!
                </p>
                <p className="text-gray-600 mb-4">
                  Toplam <strong>{orders.length}</strong> sipariş silinecek.
                </p>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Onaylamak için <strong>EVET_SIFIRLA</strong> yazın:
                  </label>
                  <input
                    type="text"
                    value={clearConfirmText}
                    onChange={(e) => setClearConfirmText(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                    placeholder="EVET_SIFIRLA"
                  />
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={handleClearOrders}
                    disabled={clearLoading || clearConfirmText !== "EVET_SIFIRLA"}
                    className="flex-1 bg-red-600 text-white px-4 py-2 rounded-md font-semibold hover:bg-red-700 disabled:bg-gray-400 transition"
                  >
                    {clearLoading ? "Sıfırlanıyor..." : "Siparişleri Sıfırla"}
                  </button>
                  <button
                    onClick={() => {
                      setShowClearOrdersModal(false);
                      setClearConfirmText("");
                    }}
                    disabled={clearLoading}
                    className="flex-1 bg-gray-200 text-gray-700 px-4 py-2 rounded-md font-semibold hover:bg-gray-300 transition"
                  >
                    İptal
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Log Modal */}
          {showLogModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg shadow-xl p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
                <h3 className="text-xl font-bold text-gray-900 mb-4">Log Yönetimi</h3>
                
                {/* Add Log Form */}
                <div className="mb-6 border-b pb-4">
                  <h4 className="text-lg font-semibold mb-3">Manuel Log Kaydet</h4>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Log Mesajı <span className="text-red-500">*</span>
                      </label>
                      <textarea
                        value={logMessage}
                        onChange={(e) => setLogMessage(e.target.value)}
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Log mesajınızı buraya yazın..."
                      />
                    </div>
                    <button
                      onClick={handleAddLog}
                      disabled={!logMessage.trim() || logLoading}
                      className="w-full bg-blue-600 text-white px-4 py-2 rounded-md font-semibold hover:bg-blue-700 disabled:bg-gray-400 transition"
                    >
                      {logLoading ? "Kaydediliyor..." : "Log Kaydet"}
                    </button>
                  </div>
                </div>

                {/* Logs List */}
                <div>
                  <div className="flex justify-between items-center mb-3">
                    <h4 className="text-lg font-semibold">Log Geçmişi</h4>
                    <button
                      onClick={fetchLogs}
                      className="text-sm text-blue-600 hover:text-blue-800"
                    >
                      Yenile
                    </button>
                  </div>
                  {logLoading && logs.length === 0 ? (
                    <div className="text-center py-4">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
                    </div>
                  ) : logs.length === 0 ? (
                    <p className="text-gray-600 text-center py-4">Henüz log kaydı bulunmamaktadır.</p>
                  ) : (
                    <div className="space-y-2 max-h-96 overflow-y-auto">
                      {logs.map((log) => (
                        <div
                          key={log.id}
                          className="border rounded-lg p-3 bg-gray-50 text-sm"
                        >
                          <div className="flex justify-between items-start mb-1">
                            <span className="font-semibold text-gray-900">
                              {log.type === "manual" ? "📝 Manuel" : 
                               log.type === "admin" ? "⚙️ Admin" :
                               log.type === "system" ? "🔧 Sistem" :
                               log.type === "order" ? "📦 Sipariş" :
                               "💳 Ödeme"}
                            </span>
                            <span className="text-gray-500 text-xs">
                              {new Date(log.timestamp).toLocaleString("tr-TR")}
                            </span>
                          </div>
                          <p className="text-gray-700">{log.message}</p>
                          {log.adminUser && (
                            <p className="text-xs text-gray-500 mt-1">Admin: {log.adminUser}</p>
                          )}
                          {log.details && Object.keys(log.details).length > 0 && (
                            <details className="mt-2">
                              <summary className="text-xs text-blue-600 cursor-pointer">Detaylar</summary>
                              <pre className="text-xs bg-white p-2 rounded mt-1 overflow-x-auto">
                                {JSON.stringify(log.details, null, 2)}
                              </pre>
                            </details>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="mt-4 flex justify-end">
                  <button
                    onClick={() => {
                      setShowLogModal(false);
                      setLogMessage("");
                    }}
                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md font-semibold hover:bg-gray-300 transition"
                  >
                    Kapat
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Pricing Tab */}
          {activeTab === "pricing" && config && (
            <div className="space-y-6">
              {/* A4 Pricing */}
              <div className="border rounded-lg p-6">
                <h3 className="text-lg font-semibold mb-4">A4 Baskı Fiyatları (Sayfa Başı)</h3>

                {/* Siyah Beyaz */}
                <div className="mb-6">
                  <h4 className="font-medium mb-3">Siyah Beyaz</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm text-gray-700 mb-1">Tek Yön (0-100 sf)</label>
                      <input
                        type="number"
                        step="0.01"
                        value={config.pricing.a4.blackWhite.single.upTo100}
                        onChange={(e) =>
                          setConfig({
                            ...config,
                            pricing: {
                              ...config.pricing,
                              a4: {
                                ...config.pricing.a4,
                                blackWhite: {
                                  ...config.pricing.a4.blackWhite,
                                  single: { ...config.pricing.a4.blackWhite.single, upTo100: parseFloat(e.target.value) || 0 },
                                },
                              },
                            },
                          })
                        }
                        className="w-full px-3 py-2 border rounded-md"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-700 mb-1">Tek Yön (101+ sf)</label>
                      <input
                        type="number"
                        step="0.01"
                        value={config.pricing.a4.blackWhite.single.over100}
                        onChange={(e) =>
                          setConfig({
                            ...config,
                            pricing: {
                              ...config.pricing,
                              a4: {
                                ...config.pricing.a4,
                                blackWhite: {
                                  ...config.pricing.a4.blackWhite,
                                  single: { ...config.pricing.a4.blackWhite.single, over100: parseFloat(e.target.value) || 0 },
                                },
                              },
                            },
                          })
                        }
                        className="w-full px-3 py-2 border rounded-md"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-700 mb-1">Çift Yön (0-100 sf)</label>
                      <input
                        type="number"
                        step="0.01"
                        value={config.pricing.a4.blackWhite.double.upTo100}
                        onChange={(e) =>
                          setConfig({
                            ...config,
                            pricing: {
                              ...config.pricing,
                              a4: {
                                ...config.pricing.a4,
                                blackWhite: {
                                  ...config.pricing.a4.blackWhite,
                                  double: { ...config.pricing.a4.blackWhite.double, upTo100: parseFloat(e.target.value) || 0 },
                                },
                              },
                            },
                          })
                        }
                        className="w-full px-3 py-2 border rounded-md"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-700 mb-1">Çift Yön (101+ sf)</label>
                      <input
                        type="number"
                        step="0.01"
                        value={config.pricing.a4.blackWhite.double.over100}
                        onChange={(e) =>
                          setConfig({
                            ...config,
                            pricing: {
                              ...config.pricing,
                              a4: {
                                ...config.pricing.a4,
                                blackWhite: {
                                  ...config.pricing.a4.blackWhite,
                                  double: { ...config.pricing.a4.blackWhite.double, over100: parseFloat(e.target.value) || 0 },
                                },
                              },
                            },
                          })
                        }
                        className="w-full px-3 py-2 border rounded-md"
                      />
                    </div>
                  </div>
                </div>

                {/* Renkli */}
                <div>
                  <h4 className="font-medium mb-3">Renkli</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm text-gray-700 mb-1">Tek Yön (0-100 sf)</label>
                      <input
                        type="number"
                        step="0.01"
                        value={config.pricing.a4.color.single.upTo100}
                        onChange={(e) =>
                          setConfig({
                            ...config,
                            pricing: {
                              ...config.pricing,
                              a4: {
                                ...config.pricing.a4,
                                color: {
                                  ...config.pricing.a4.color,
                                  single: { ...config.pricing.a4.color.single, upTo100: parseFloat(e.target.value) || 0 },
                                },
                              },
                            },
                          })
                        }
                        className="w-full px-3 py-2 border rounded-md"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-700 mb-1">Tek Yön (101+ sf)</label>
                      <input
                        type="number"
                        step="0.01"
                        value={config.pricing.a4.color.single.over100}
                        onChange={(e) =>
                          setConfig({
                            ...config,
                            pricing: {
                              ...config.pricing,
                              a4: {
                                ...config.pricing.a4,
                                color: {
                                  ...config.pricing.a4.color,
                                  single: { ...config.pricing.a4.color.single, over100: parseFloat(e.target.value) || 0 },
                                },
                              },
                            },
                          })
                        }
                        className="w-full px-3 py-2 border rounded-md"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-700 mb-1">Çift Yön (0-100 sf)</label>
                      <input
                        type="number"
                        step="0.01"
                        value={config.pricing.a4.color.double.upTo100}
                        onChange={(e) =>
                          setConfig({
                            ...config,
                            pricing: {
                              ...config.pricing,
                              a4: {
                                ...config.pricing.a4,
                                color: {
                                  ...config.pricing.a4.color,
                                  double: { ...config.pricing.a4.color.double, upTo100: parseFloat(e.target.value) || 0 },
                                },
                              },
                            },
                          })
                        }
                        className="w-full px-3 py-2 border rounded-md"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-700 mb-1">Çift Yön (101+ sf)</label>
                      <input
                        type="number"
                        step="0.01"
                        value={config.pricing.a4.color.double.over100}
                        onChange={(e) =>
                          setConfig({
                            ...config,
                            pricing: {
                              ...config.pricing,
                              a4: {
                                ...config.pricing.a4,
                                color: {
                                  ...config.pricing.a4.color,
                                  double: { ...config.pricing.a4.color.double, over100: parseFloat(e.target.value) || 0 },
                                },
                              },
                            },
                          })
                        }
                        className="w-full px-3 py-2 border rounded-md"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* A3 Multiplier */}
              <div className="border rounded-lg p-6">
                <h3 className="text-lg font-semibold mb-4">A3 Çarpan</h3>
                <div>
                  <label className="block text-sm text-gray-700 mb-1">
                    A3 fiyatları A4 fiyatlarının kaç katı?
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={config.pricing.a3Multiplier}
                    onChange={(e) =>
                      setConfig({ ...config, pricing: { ...config.pricing, a3Multiplier: parseFloat(e.target.value) || 1 } })
                    }
                    className="w-full px-3 py-2 border rounded-md"
                  />
                </div>
              </div>

              {/* Binding Prices */}
              <div className="border rounded-lg p-6">
                <h3 className="text-lg font-semibold mb-4">Ciltleme Fiyatları (Cilt Başı)</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-medium mb-3">Spiral Cilt</h4>
                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm text-gray-700 mb-1">1-10 cilt</label>
                        <input
                          type="number"
                          step="0.01"
                          value={config.pricing.binding.spiral.upTo10}
                          onChange={(e) =>
                            setConfig({
                              ...config,
                              pricing: {
                                ...config.pricing,
                                binding: {
                                  ...config.pricing.binding,
                                  spiral: { ...config.pricing.binding.spiral, upTo10: parseFloat(e.target.value) || 0 },
                                },
                              },
                            })
                          }
                          className="w-full px-3 py-2 border rounded-md"
                        />
                      </div>
                      <div>
                        <label className="block text-sm text-gray-700 mb-1">11+ cilt</label>
                        <input
                          type="number"
                          step="0.01"
                          value={config.pricing.binding.spiral.over10}
                          onChange={(e) =>
                            setConfig({
                              ...config,
                              pricing: {
                                ...config.pricing,
                                binding: {
                                  ...config.pricing.binding,
                                  spiral: { ...config.pricing.binding.spiral, over10: parseFloat(e.target.value) || 0 },
                                },
                              },
                            })
                          }
                          className="w-full px-3 py-2 border rounded-md"
                        />
                      </div>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-medium mb-3">Amerikan Cilt</h4>
                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm text-gray-700 mb-1">1-10 cilt</label>
                        <input
                          type="number"
                          step="0.01"
                          value={config.pricing.binding.american.upTo10}
                          onChange={(e) =>
                            setConfig({
                              ...config,
                              pricing: {
                                ...config.pricing,
                                binding: {
                                  ...config.pricing.binding,
                                  american: { ...config.pricing.binding.american, upTo10: parseFloat(e.target.value) || 0 },
                                },
                              },
                            })
                          }
                          className="w-full px-3 py-2 border rounded-md"
                        />
                      </div>
                      <div>
                        <label className="block text-sm text-gray-700 mb-1">11+ cilt</label>
                        <input
                          type="number"
                          step="0.01"
                          value={config.pricing.binding.american.over10}
                          onChange={(e) =>
                            setConfig({
                              ...config,
                              pricing: {
                                ...config.pricing,
                                binding: {
                                  ...config.pricing.binding,
                                  american: { ...config.pricing.binding.american, over10: parseFloat(e.target.value) || 0 },
                                },
                              },
                            })
                          }
                          className="w-full px-3 py-2 border rounded-md"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Shipping Tiers */}
              <div className="border rounded-lg p-6">
                <h3 className="text-lg font-semibold mb-4">Kargo Ücretleri</h3>
                <div className="space-y-3">
                  {config.pricing.shipping.map((tier, index) => (
                    <div key={index} className="flex gap-4 items-end">
                      <div className="flex-1">
                        <label className="block text-sm text-gray-700 mb-1">
                          {tier.maxPages === null
                            ? "2000+ sayfa (Ücretsiz)"
                            : `0-${tier.maxPages} sayfa arası`}
                        </label>
                        <input
                          type="number"
                          step="0.01"
                          value={tier.price}
                          onChange={(e) => {
                            const newShipping = [...config.pricing.shipping];
                            newShipping[index] = { ...tier, price: parseFloat(e.target.value) || 0 };
                            setConfig({ ...config, pricing: { ...config.pricing, shipping: newShipping } });
                          }}
                          className="w-full px-3 py-2 border rounded-md"
                          disabled={tier.maxPages === null && tier.price === 0}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* KDV Oranı */}
              <div className="border rounded-lg p-6">
                <h3 className="text-lg font-semibold mb-4">KDV Oranı</h3>
                <div>
                  <label className="block text-sm text-gray-700 mb-1">
                    KDV Oranı (0.20 = %20, 0.18 = %18, vb.)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    max="1"
                    value={config.pricing.kdvRate}
                    onChange={(e) =>
                      setConfig({ ...config, pricing: { ...config.pricing, kdvRate: parseFloat(e.target.value) || 0 } })
                    }
                    className="w-full px-3 py-2 border rounded-md"
                  />
                  <p className="text-sm text-gray-500 mt-2">
                    Mevcut KDV: %{(config.pricing.kdvRate * 100).toFixed(0)}
                  </p>
                </div>
              </div>

              <button
                onClick={handleSaveConfig}
                disabled={saveLoading}
                className="w-full bg-blue-600 text-white py-3 px-4 rounded-md font-semibold hover:bg-blue-700 disabled:bg-gray-400 transition-colors"
              >
                {saveLoading ? "Kaydediliyor..." : "Fiyatlandırmayı Kaydet"}
              </button>
            </div>
          )}

          {/* Marketing Tab */}
          {activeTab === "marketing" && config && (
            <div className="space-y-6">
              {/* Signup Popup */}
              <div className="border rounded-lg p-6">
                <h3 className="text-lg font-semibold mb-4">Üyelik Pop-up</h3>
                <div className="flex items-center mb-4">
                  <input
                    type="checkbox"
                    checked={config.marketing.enableSignupPopup}
                    onChange={(e) =>
                      setConfig({
                        ...config,
                        marketing: { ...config.marketing, enableSignupPopup: e.target.checked },
                      })
                    }
                    className="mr-2"
                  />
                  <label className="text-sm text-gray-700">
                    Üyelik pop-up&apos;ını etkinleştir
                  </label>
                </div>
              </div>

              {/* Welcome Discount */}
              <div className="border rounded-lg p-6">
                <h3 className="text-lg font-semibold mb-4">Hoş Geldin İndirimi</h3>
                <div className="space-y-4">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      checked={config.marketing.enableMemberWelcomeDiscount}
                      onChange={(e) =>
                        setConfig({
                          ...config,
                          marketing: {
                            ...config.marketing,
                            enableMemberWelcomeDiscount: e.target.checked,
                          },
                        })
                      }
                      className="mr-2"
                    />
                    <label className="text-sm text-gray-700">
                      Üye olana hoş geldin indirim kuponu tanımla
                    </label>
                  </div>
                  <div>
                    <label className="block text-sm text-gray-700 mb-1">
                      Hoş geldin indirim oranı (%)
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={config.marketing.memberWelcomeDiscountPercent}
                      onChange={(e) =>
                        setConfig({
                          ...config,
                          marketing: {
                            ...config.marketing,
                            memberWelcomeDiscountPercent: parseInt(e.target.value) || 0,
                          },
                        })
                      }
                      className="w-full px-3 py-2 border rounded-md"
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm text-gray-700 mb-1">
                        Geçerlilik Başlangıcı (Opsiyonel)
                      </label>
                      <input
                        type="datetime-local"
                        value={
                          config.marketing.memberWelcomeValidFrom
                            ? new Date(config.marketing.memberWelcomeValidFrom)
                                .toISOString()
                                .slice(0, 16)
                            : ""
                        }
                        onChange={(e) =>
                          setConfig({
                            ...config,
                            marketing: {
                              ...config.marketing,
                              memberWelcomeValidFrom: e.target.value
                                ? new Date(e.target.value).toISOString()
                                : null,
                            },
                          })
                        }
                        className="w-full px-3 py-2 border rounded-md"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-700 mb-1">
                        Geçerlilik Bitişi (Opsiyonel)
                      </label>
                      <input
                        type="datetime-local"
                        value={
                          config.marketing.memberWelcomeValidUntil
                            ? new Date(config.marketing.memberWelcomeValidUntil)
                                .toISOString()
                                .slice(0, 16)
                            : ""
                        }
                        onChange={(e) =>
                          setConfig({
                            ...config,
                            marketing: {
                              ...config.marketing,
                              memberWelcomeValidUntil: e.target.value
                                ? new Date(e.target.value).toISOString()
                                : null,
                            },
                          })
                        }
                        className="w-full px-3 py-2 border rounded-md"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Referral Program */}
              <div className="border rounded-lg p-6">
                <h3 className="text-lg font-semibold mb-4">Referans Programı</h3>
                <div className="space-y-4">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      checked={config.marketing.enableReferralProgram}
                      onChange={(e) =>
                        setConfig({
                          ...config,
                          marketing: {
                            ...config.marketing,
                            enableReferralProgram: e.target.checked,
                          },
                        })
                      }
                      className="mr-2"
                    />
                    <label className="text-sm text-gray-700">
                      Referans programını etkinleştir (arkadaşını davet et, %X indirim kazan)
                    </label>
                  </div>
                  <div>
                    <label className="block text-sm text-gray-700 mb-1">
                      Referans indirim oranı (%)
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={config.marketing.referralDiscountPercent}
                      onChange={(e) =>
                        setConfig({
                          ...config,
                          marketing: {
                            ...config.marketing,
                            referralDiscountPercent: parseInt(e.target.value) || 0,
                          },
                        })
                      }
                      className="w-full px-3 py-2 border rounded-md"
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm text-gray-700 mb-1">
                        Geçerlilik Başlangıcı (Opsiyonel)
                      </label>
                      <input
                        type="datetime-local"
                        value={
                          config.marketing.referralValidFrom
                            ? new Date(config.marketing.referralValidFrom).toISOString().slice(0, 16)
                            : ""
                        }
                        onChange={(e) =>
                          setConfig({
                            ...config,
                            marketing: {
                              ...config.marketing,
                              referralValidFrom: e.target.value
                                ? new Date(e.target.value).toISOString()
                                : null,
                            },
                          })
                        }
                        className="w-full px-3 py-2 border rounded-md"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-700 mb-1">
                        Geçerlilik Bitişi (Opsiyonel)
                      </label>
                      <input
                        type="datetime-local"
                        value={
                          config.marketing.referralValidUntil
                            ? new Date(config.marketing.referralValidUntil)
                                .toISOString()
                                .slice(0, 16)
                            : ""
                        }
                        onChange={(e) =>
                          setConfig({
                            ...config,
                            marketing: {
                              ...config.marketing,
                              referralValidUntil: e.target.value
                                ? new Date(e.target.value).toISOString()
                                : null,
                            },
                          })
                        }
                        className="w-full px-3 py-2 border rounded-md"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Coupons List */}
              <div className="border rounded-lg p-6">
                <h3 className="text-lg font-semibold mb-4">Tüm Kuponlar</h3>
                {coupons.length === 0 ? (
                  <p className="text-gray-600 text-center py-4">Henüz kupon bulunmamaktadır.</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                            Kod
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                            Tip
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                            Kullanıcı ID
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                            İndirim %
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                            Geçerlilik
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                            Kullanım
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                            Durum
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {coupons.map((coupon) => (
                          <tr key={coupon.code} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-900">
                              {coupon.code}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {coupon.type === "WELCOME" ? "Hoş Geldin" : "Referans"}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {coupon.userId.substring(0, 8)}...
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              %{coupon.discountPercent}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {new Date(coupon.validFrom).toLocaleDateString("tr-TR")}
                              {coupon.validUntil
                                ? ` - ${new Date(coupon.validUntil).toLocaleDateString("tr-TR")}`
                                : " (Süresiz)"}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {coupon.usedCount} / {coupon.maxUses}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <input
                                type="checkbox"
                                checked={coupon.isActive}
                                onChange={async (e) => {
                                  const response = await fetch("/api/admin/coupons/toggle", {
                                    method: "POST",
                                    headers: { "Content-Type": "application/json" },
                                    body: JSON.stringify({
                                      code: coupon.code,
                                      isActive: e.target.checked,
                                    }),
                                  });
                                  if (response.ok) {
                                    fetchCoupons();
                                  }
                                }}
                                className="mr-2"
                              />
                              <span className="text-xs text-gray-500">
                                {coupon.isActive ? "Aktif" : "Pasif"}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              <button
                onClick={handleSaveConfig}
                disabled={saveLoading}
                className="w-full bg-blue-600 text-white py-3 px-4 rounded-md font-semibold hover:bg-blue-700 disabled:bg-gray-400 transition-colors"
              >
                {saveLoading ? "Kaydediliyor..." : "Ayarları Kaydet"}
              </button>
            </div>
          )}

          {/* UI Tab */}
          {activeTab === "ui" && (
            <div className="space-y-6">
              {!config ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="mt-2 text-gray-600">Yükleniyor...</p>
                </div>
              ) : (
                <>
                  <div className="bg-gray-50 rounded-lg p-6 space-y-6">
                    <h2 className="text-xl font-semibold text-gray-900">Kayar Yazı (Announcement Bar)</h2>
                    
                    <div className="space-y-4">
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          checked={config.ui?.announcementBar?.enabled || false}
                          onChange={(e) => {
                            setConfig({
                              ...config,
                              ui: {
                                ...config.ui,
                                announcementBar: {
                                  ...config.ui?.announcementBar,
                                  enabled: e.target.checked,
                                },
                              },
                            });
                          }}
                          className="mr-2"
                        />
                        <label className="text-sm font-medium text-gray-700">
                          Kayar yazıyı etkinleştir
                        </label>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Yazı Metni
                        </label>
                        <input
                          type="text"
                          value={config.ui?.announcementBar?.text || ""}
                          onChange={(e) => {
                            setConfig({
                              ...config,
                              ui: {
                                ...config.ui,
                                announcementBar: {
                                  ...config.ui?.announcementBar,
                                  text: e.target.value,
                                },
                              },
                            });
                          }}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Örn: 🎉 Yeni üyelere özel %5 indirim!"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Link (Opsiyonel)
                        </label>
                        <input
                          type="text"
                          value={config.ui?.announcementBar?.link || ""}
                          onChange={(e) => {
                            setConfig({
                              ...config,
                              ui: {
                                ...config.ui,
                                announcementBar: {
                                  ...config.ui?.announcementBar,
                                  link: e.target.value || null,
                                },
                              },
                            });
                          }}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="/uye-ol"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Arka Plan Rengi
                          </label>
                          <input
                            type="color"
                            value={config.ui?.announcementBar?.backgroundColor || "#3b82f6"}
                            onChange={(e) => {
                              setConfig({
                                ...config,
                                ui: {
                                  ...config.ui,
                                  announcementBar: {
                                    ...config.ui?.announcementBar,
                                    backgroundColor: e.target.value,
                                  },
                                },
                              });
                            }}
                            className="w-full h-10 border border-gray-300 rounded-md"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Metin Rengi
                          </label>
                          <input
                            type="color"
                            value={config.ui?.announcementBar?.textColor || "#ffffff"}
                            onChange={(e) => {
                              setConfig({
                                ...config,
                                ui: {
                                  ...config.ui,
                                  announcementBar: {
                                    ...config.ui?.announcementBar,
                                    textColor: e.target.value,
                                  },
                                },
                              });
                            }}
                            className="w-full h-10 border border-gray-300 rounded-md"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-6 space-y-6">
                    <h2 className="text-xl font-semibold text-gray-900">Banner Ayarları (Ana Sayfa Hero Bölümü)</h2>
                    
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Başlık
                        </label>
                        <input
                          type="text"
                          value={config.ui?.banner?.title || ""}
                          onChange={(e) => {
                            setConfig({
                              ...config,
                              ui: {
                                ...config.ui,
                                banner: {
                                  ...config.ui?.banner,
                                  title: e.target.value,
                                },
                              },
                            });
                          }}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Öğrenciler için uygun fiyatlı dijital çıktı hizmeti"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Alt Başlık / Açıklama
                        </label>
                        <textarea
                          value={config.ui?.banner?.subtitle || ""}
                          onChange={(e) => {
                            setConfig({
                              ...config,
                              ui: {
                                ...config.ui,
                                banner: {
                                  ...config.ui?.banner,
                                  subtitle: e.target.value,
                                },
                              },
                            });
                          }}
                          rows={2}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="PDF dosyanı yükle, baskı seçeneklerini seç, online öde, çıktın kapına gelsin."
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Buton Metni
                          </label>
                          <input
                            type="text"
                            value={config.ui?.banner?.buttonText || ""}
                            onChange={(e) => {
                              setConfig({
                                ...config,
                                ui: {
                                  ...config.ui,
                                  banner: {
                                    ...config.ui?.banner,
                                    buttonText: e.target.value,
                                  },
                                },
                              });
                            }}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Çıktı Siparişi Ver"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Buton Linki
                          </label>
                          <input
                            type="text"
                            value={config.ui?.banner?.buttonLink || ""}
                            onChange={(e) => {
                              setConfig({
                                ...config,
                                ui: {
                                  ...config.ui,
                                  banner: {
                                    ...config.ui?.banner,
                                    buttonLink: e.target.value,
                                  },
                                },
                              });
                            }}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="#siparis"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Arka Plan Rengi (Başlangıç)
                          </label>
                          <input
                            type="color"
                            value={config.ui?.banner?.backgroundColor || "#2563eb"}
                            onChange={(e) => {
                              setConfig({
                                ...config,
                                ui: {
                                  ...config.ui,
                                  banner: {
                                    ...config.ui?.banner,
                                    backgroundColor: e.target.value,
                                  },
                                },
                              });
                            }}
                            className="w-full h-10 border border-gray-300 rounded-md"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Arka Plan Rengi (Bitiş)
                          </label>
                          <input
                            type="color"
                            value={config.ui?.banner?.backgroundColorEnd || "#1e40af"}
                            onChange={(e) => {
                              setConfig({
                                ...config,
                                ui: {
                                  ...config.ui,
                                  banner: {
                                    ...config.ui?.banner,
                                    backgroundColorEnd: e.target.value,
                                  },
                                },
                              });
                            }}
                            className="w-full h-10 border border-gray-300 rounded-md"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Metin Rengi
                          </label>
                          <input
                            type="color"
                            value={config.ui?.banner?.textColor || "#ffffff"}
                            onChange={(e) => {
                              setConfig({
                                ...config,
                                ui: {
                                  ...config.ui,
                                  banner: {
                                    ...config.ui?.banner,
                                    textColor: e.target.value,
                                  },
                                },
                              });
                            }}
                            className="w-full h-10 border border-gray-300 rounded-md"
                          />
                        </div>
                      </div>

                      <div className="space-y-3">
                        <div className="flex items-center">
                          <input
                            type="checkbox"
                            checked={config.ui?.banner?.imageEnabled || false}
                            onChange={(e) => {
                              setConfig({
                                ...config,
                                ui: {
                                  ...config.ui,
                                  banner: {
                                    ...config.ui?.banner,
                                    imageEnabled: e.target.checked,
                                  },
                                },
                              });
                            }}
                            className="mr-2"
                          />
                          <label className="text-sm font-medium text-gray-700">
                            Sağ tarafta görsel göster
                          </label>
                        </div>

                        {config.ui?.banner?.imageEnabled && (
                          <div>
                            {/* Banner Image Upload */}
                            <div className="space-y-3">
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                  Bilgisayardan Görsel Yükle
                                </label>
                                <input
                                  type="file"
                                  accept="image/jpeg,image/jpg,image/png,image/webp,image/gif"
                                  onChange={async (e) => {
                                    const file = e.target.files?.[0];
                                    if (!file) return;

                                    setBannerUploading(true);
                                    try {
                                      const formData = new FormData();
                                      formData.append("image", file);

                                      const response = await fetch("/api/admin/banner/upload", {
                                        method: "POST",
                                        body: formData,
                                      });

                                      if (!response.ok) {
                                        throw new Error("Yükleme başarısız oldu.");
                                      }

                                      const data = await response.json();
                                      
                                      setConfig({
                                        ...config,
                                        ui: {
                                          ...config.ui,
                                          banner: {
                                            ...config.ui?.banner,
                                            imagePath: data.path,
                                          },
                                        },
                                      });

                                      alert("Görsel başarıyla yüklendi!");
                                    } catch (err: any) {
                                      alert(err.message || "Görsel yüklenemedi.");
                                    } finally {
                                      setBannerUploading(false);
                                    }
                                  }}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                  disabled={bannerUploading}
                                />
                                {bannerUploading && (
                                  <p className="text-xs text-blue-600 mt-1">Yükleniyor...</p>
                                )}
                              </div>

                              <div className="text-center text-gray-500 text-sm">veya</div>

                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                  Supabase veya Harici Link (URL)
                                </label>
                                <input
                                  type="url"
                                  value={
                                    config.ui?.banner?.imagePath &&
                                    (config.ui.banner.imagePath.startsWith("http://") ||
                                      config.ui.banner.imagePath.startsWith("https://"))
                                      ? config.ui.banner.imagePath
                                      : ""
                                  }
                                  placeholder="https://your-supabase-url.com/banner.jpg"
                                  onChange={(e) => {
                                    const url = e.target.value.trim();
                                    setConfig({
                                      ...config,
                                      ui: {
                                        ...config.ui,
                                        banner: {
                                          ...config.ui?.banner,
                                          imagePath: url || null,
                                        },
                                      },
                                    });
                                  }}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                                <p className="text-xs text-gray-500 mt-1">
                                  Tam URL girin (örn: https://xxx.supabase.co/storage/v1/object/public/...)
                                </p>
                              </div>

                              <div className="text-center text-gray-500 text-sm">veya</div>

                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                  Yerel Görsel Yolu (public klasöründen)
                                </label>
                                <input
                                  type="text"
                                  value={
                                    config.ui?.banner?.imagePath &&
                                    !config.ui.banner.imagePath.startsWith("http://") &&
                                    !config.ui.banner.imagePath.startsWith("https://")
                                      ? config.ui.banner.imagePath
                                      : ""
                                  }
                                  placeholder="/logo/favicon.png veya /images/banner.png"
                                  onChange={(e) => {
                                    const path = e.target.value.trim();
                                    setConfig({
                                      ...config,
                                      ui: {
                                        ...config.ui,
                                        banner: {
                                          ...config.ui?.banner,
                                          imagePath: path || null,
                                        },
                                      },
                                    });
                                  }}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                                <p className="text-xs text-gray-500 mt-1">
                                  Public klasöründen görsel yolu. Örnek: /logo/favicon.png
                                </p>
                              </div>

                              {/* Preview current image */}
                              {config.ui?.banner?.imagePath && (
                                <div className="mt-4">
                                  <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Mevcut Görsel Önizleme
                                  </label>
                                  <div className="relative w-full h-48 border border-gray-300 rounded-md overflow-hidden bg-gray-50">
                                    {config.ui.banner.imagePath.startsWith("http://") || 
                                     config.ui.banner.imagePath.startsWith("https://") ? (
                                      <img
                                        src={config.ui.banner.imagePath}
                                        alt="Banner preview"
                                        className="w-full h-full object-contain"
                                        onError={(e) => {
                                          (e.target as HTMLImageElement).style.display = "none";
                                        }}
                                      />
                                    ) : (
                                      <img
                                        src={config.ui.banner.imagePath}
                                        alt="Banner preview"
                                        className="w-full h-full object-contain"
                                        onError={(e) => {
                                          (e.target as HTMLImageElement).style.display = "none";
                                        }}
                                      />
                                    )}
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-6 space-y-6">
                    <h2 className="text-xl font-semibold text-gray-900">Footer Ayarları</h2>
                    
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Açıklama
                        </label>
                        <textarea
                          value={config.ui?.footer?.description || ""}
                          onChange={(e) => {
                            setConfig({
                              ...config,
                              ui: {
                                ...config.ui,
                                footer: {
                                  ...config.ui?.footer,
                                  description: e.target.value,
                                },
                              },
                            });
                          }}
                          rows={3}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Telefon
                        </label>
                        <input
                          type="text"
                          value={config.ui?.footer?.phone || ""}
                          onChange={(e) => {
                            setConfig({
                              ...config,
                              ui: {
                                ...config.ui,
                                footer: {
                                  ...config.ui?.footer,
                                  phone: e.target.value,
                                },
                              },
                            });
                          }}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          E-posta
                        </label>
                        <input
                          type="email"
                          value={config.ui?.footer?.email || ""}
                          onChange={(e) => {
                            setConfig({
                              ...config,
                              ui: {
                                ...config.ui,
                                footer: {
                                  ...config.ui?.footer,
                                  email: e.target.value,
                                },
                              },
                            });
                          }}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Adres
                        </label>
                        <textarea
                          value={config.ui?.footer?.address || ""}
                          onChange={(e) => {
                            setConfig({
                              ...config,
                              ui: {
                                ...config.ui,
                                footer: {
                                  ...config.ui?.footer,
                                  address: e.target.value,
                                },
                              },
                            });
                          }}
                          rows={2}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Telif Hakkı Metni
                        </label>
                        <input
                          type="text"
                          value={config.ui?.footer?.copyright || ""}
                          onChange={(e) => {
                            setConfig({
                              ...config,
                              ui: {
                                ...config.ui,
                                footer: {
                                  ...config.ui?.footer,
                                  copyright: e.target.value,
                                },
                              },
                            });
                          }}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="© 2025 kopyalagelsin. Tüm hakları saklıdır."
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          Yıl otomatik güncellenir. {new Date().getFullYear()} yazmanız yeterli.
                        </p>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={handleSaveConfig}
                    disabled={saveLoading}
                    className="w-full bg-blue-600 text-white py-3 px-4 rounded-md font-semibold hover:bg-blue-700 disabled:bg-gray-400 transition-colors"
                  >
                    {saveLoading ? "Kaydediliyor..." : "Ayarları Kaydet"}
                  </button>
                </>
              )}
            </div>
          )}

          {/* Campaign Tab */}
          {activeTab === "campaign" && (
            <div>
              {config ? (
                <>
                  <div className="space-y-6">
                    <div className="bg-white rounded-lg shadow-md p-6">
                      <h3 className="text-xl font-semibold mb-4">Kampanya Modu</h3>
                      
                      <div className="mb-6">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Aktif Kampanya Modu
                        </label>
                        <select
                          value={config.season?.currentSeasonMode || "normal"}
                          onChange={(e) => {
                            setConfig({
                              ...config,
                              season: {
                                ...(config.season || {
                                  currentSeasonMode: "normal",
                                  seasons: {
                                    normal: { mode: "normal", bannerUrl: null, priceMultiplier: 1.0 },
                                    vize: { mode: "vize", bannerUrl: null, priceMultiplier: 1.0 },
                                    final: { mode: "final", bannerUrl: null, priceMultiplier: 1.0 },
                                    tez: { mode: "tez", bannerUrl: null, priceMultiplier: 1.0 },
                                  },
                                }),
                                currentSeasonMode: e.target.value as "normal" | "vize" | "final" | "tez",
                              },
                            });
                          }}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="normal">Normal</option>
                          <option value="vize">Vize Haftası</option>
                          <option value="final">Final Haftası</option>
                          <option value="tez">Tez Dönemi</option>
                        </select>
                        <p className="text-xs text-gray-500 mt-1">
                          Seçilen mod ana sayfa banner&apos;ını ve fiyatlandırmayı etkiler.
                        </p>
                      </div>

                      {/* Season Configurations */}
                      <div className="space-y-6 mt-8">
                        {(["normal", "vize", "final", "tez"] as const).map((seasonMode) => {
                          const seasonLabel = {
                            normal: "Normal",
                            vize: "Vize Haftası",
                            final: "Final Haftası",
                            tez: "Tez Dönemi",
                          }[seasonMode];

                          const seasonData = config.season?.seasons[seasonMode] || {
                            mode: seasonMode,
                            bannerUrl: null,
                            priceMultiplier: 1.0,
                          };

                          return (
                            <div key={seasonMode} className="border border-gray-200 rounded-lg p-4">
                              <h4 className="text-lg font-semibold mb-4">{seasonLabel}</h4>
                              
                              <div className="space-y-4">
                                {/* Banner URL */}
                                <div>
                                  <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Banner Görsel URL
                                  </label>
                                  <input
                                    type="text"
                                    value={seasonData.bannerUrl || ""}
                                    onChange={(e) => {
                                      const newSeasons = {
                                        ...(config.season?.seasons || {
                                          normal: { mode: "normal" as const, bannerUrl: null, priceMultiplier: 1.0 },
                                          vize: { mode: "vize" as const, bannerUrl: null, priceMultiplier: 1.0 },
                                          final: { mode: "final" as const, bannerUrl: null, priceMultiplier: 1.0 },
                                          tez: { mode: "tez" as const, bannerUrl: null, priceMultiplier: 1.0 },
                                        }),
                                        [seasonMode]: {
                                          ...seasonData,
                                          bannerUrl: e.target.value || null,
                                        },
                                      };
                                      setConfig({
                                        ...config,
                                        season: {
                                          currentSeasonMode: config.season?.currentSeasonMode || "normal",
                                          seasons: newSeasons,
                                        },
                                      });
                                    }}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="/banners/season-banner.jpg veya https://..."
                                  />
                                  <p className="text-xs text-gray-500 mt-1">
                                    Banner görseli URL&apos;i. Boş bırakılırsa varsayılan banner kullanılır.
                                  </p>
                                </div>

                                {/* Price Multiplier */}
                                <div>
                                  <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Fiyat Çarpanı
                                  </label>
                                  <input
                                    type="number"
                                    step="0.01"
                                    min="0.01"
                                    max="2"
                                    value={seasonData.priceMultiplier}
                                    onChange={(e) => {
                                      const multiplier = parseFloat(e.target.value) || 1.0;
                                      const newSeasons = {
                                        ...(config.season?.seasons || {
                                          normal: { mode: "normal" as const, bannerUrl: null, priceMultiplier: 1.0 },
                                          vize: { mode: "vize" as const, bannerUrl: null, priceMultiplier: 1.0 },
                                          final: { mode: "final" as const, bannerUrl: null, priceMultiplier: 1.0 },
                                          tez: { mode: "tez" as const, bannerUrl: null, priceMultiplier: 1.0 },
                                        }),
                                        [seasonMode]: {
                                          ...seasonData,
                                          priceMultiplier: multiplier,
                                        },
                                      };
                                      setConfig({
                                        ...config,
                                        season: {
                                          currentSeasonMode: config.season?.currentSeasonMode || "normal",
                                          seasons: newSeasons,
                                        },
                                      });
                                    }}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                  />
                                  <p className="text-xs text-gray-500 mt-1">
                                    1.0 = Fiyat değişmez, 0.95 = %5 indirim, 0.90 = %10 indirim, vb.
                                  </p>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={handleSaveConfig}
                    disabled={saveLoading}
                    className="w-full bg-blue-600 text-white py-3 px-4 rounded-md font-semibold hover:bg-blue-700 disabled:bg-gray-400 transition-colors mt-6"
                  >
                    {saveLoading ? "Kaydediliyor..." : "Kampanya Ayarlarını Kaydet"}
                  </button>
                </>
              ) : (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="mt-2 text-gray-600">Yükleniyor...</p>
                </div>
              )}
            </div>
          )}

          {(activeTab === "pricing" || activeTab === "marketing") && !config && (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-2 text-gray-600">Yükleniyor...</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
