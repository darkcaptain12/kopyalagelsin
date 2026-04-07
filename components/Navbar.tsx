"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface User {
  id: string;
  name: string;
  email: string;
}

export default function Navbar() {
  const router = useRouter();
  const [logoError, setLogoError] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => res.json())
      .then((data) => {
        if (data.user) {
          setUser(data.user);
        }
      });
  }, []);

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    setUser(null);
    router.push("/");
  };

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <Link href="/" className="flex items-center hover:opacity-80 transition-opacity">
            {!logoError && (
              <div className="relative h-12 w-auto min-w-[160px]">
                <Image
                  src="/logo/kopyalagelsin.png"
                  alt="kopyalagelsin Logo"
                  width={200}
                  height={48}
                  className="object-contain h-full w-auto"
                  priority
                  onError={() => setLogoError(true)}
                />
              </div>
            )}
          </Link>

          <div className="hidden md:flex items-center space-x-6">
            <Link href="/" className="text-gray-700 hover:text-blue-600 transition">
              Anasayfa
            </Link>
            <Link href="/pdf-birlestir" className="text-gray-700 hover:text-blue-600 transition">
              PDF Birleştir
            </Link>
            <a href="/#nasil-calisir" className="text-gray-700 hover:text-blue-600 transition">
              Nasıl Çalışır?
            </a>
            <a href="/#sss" className="text-gray-700 hover:text-blue-600 transition">
              Sık Sorulan Sorular
            </a>
            <a href="/#iletisim" className="text-gray-700 hover:text-blue-600 transition">
              İletişim
            </a>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="text-gray-700 hover:text-blue-600 focus:outline-none"
              aria-label="Toggle menu"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                {mobileMenuOpen ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                )}
              </svg>
            </button>
          </div>

          <div className="hidden md:flex items-center space-x-4">
            {/* Katalog butonu — nav linklerinden ayrı, her zaman görünür */}
            <Link
              href="/katalog"
              className="flex items-center gap-1.5 border border-gray-300 text-gray-600
                         hover:border-blue-500 hover:text-blue-600 px-3.5 py-1.5 rounded-lg
                         text-sm font-medium transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
              Katalog
            </Link>

            {user ? (
              <div className="relative">
                <button
                  onClick={() => setShowDropdown(!showDropdown)}
                  className="flex items-center space-x-2 text-gray-700 hover:text-blue-600 transition"
                >
                  <span>{user.name}</span>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </button>
                {showDropdown && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50">
                    <Link
                      href="/hesabim"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      onClick={() => setShowDropdown(false)}
                    >
                      Hesabım
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Çıkış Yap
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <>
                <Link
                  href="/giris"
                  className="text-gray-700 hover:text-blue-600 transition"
                >
                  Giriş Yap
                </Link>
                <Link
                  href="/uye-ol"
                  className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition"
                >
                  Üye Ol
                </Link>
              </>
            )}
            <Link
              href="/#siparis"
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition"
            >
              Sipariş Ver
            </Link>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="md:hidden pb-4">
            <div className="flex flex-col space-y-3 pt-4 border-t border-gray-200">
              <Link
                href="/"
                className="text-gray-700 hover:text-blue-600 transition py-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                Anasayfa
              </Link>
              <Link
                href="/pdf-birlestir"
                className="text-gray-700 hover:text-blue-600 transition py-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                PDF Birleştir
              </Link>
              <Link
                href="/#nasil-calisir"
                className="text-gray-700 hover:text-blue-600 transition py-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                Nasıl Çalışır?
              </Link>
              <Link
                href="/#sss"
                className="text-gray-700 hover:text-blue-600 transition py-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                Sık Sorulan Sorular
              </Link>
              <Link
                href="/#iletisim"
                className="text-gray-700 hover:text-blue-600 transition py-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                İletişim
              </Link>
              <div className="pt-3 border-t border-gray-200 space-y-2">
                <Link
                  href="/katalog"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2 w-full border border-gray-300 text-gray-600
                             hover:border-blue-500 hover:text-blue-600 px-4 py-2.5 rounded-lg
                             text-sm font-medium transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                  Katalog
                </Link>
                {user ? (
                  <>
                    <Link
                      href="/hesabim"
                      className="block text-gray-700 hover:text-blue-600 transition py-2"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Hesabım
                    </Link>
                    <button
                      onClick={() => {
                        handleLogout();
                        setMobileMenuOpen(false);
                      }}
                      className="block w-full text-left text-gray-700 hover:text-blue-600 transition py-2"
                    >
                      Çıkış Yap
                    </button>
                  </>
                ) : (
                  <>
                    <Link
                      href="/giris"
                      className="block text-gray-700 hover:text-blue-600 transition py-2"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Giriş Yap
                    </Link>
                    <Link
                      href="/uye-ol"
                      className="block bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition text-center"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Üye Ol
                    </Link>
                  </>
                )}
                <Link
                  href="/#siparis"
                  className="block bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition text-center"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Sipariş Ver
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}

