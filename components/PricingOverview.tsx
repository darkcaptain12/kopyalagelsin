"use client";

import { useEffect, useState } from "react";
import type { AppConfig } from "@/lib/config";

export default function PricingOverview() {
  const [config, setConfig] = useState<AppConfig | null>(null);

  useEffect(() => {
    fetch("/api/config")
      .then((res) => res.json())
      .then((data) => setConfig(data))
      .catch(() => {});
  }, []);

  if (!config) {
    return (
      <section id="fiyatlandirma" className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 text-gray-900">
            Fiyatlandırma
          </h2>
          <p className="text-center text-gray-600">Yükleniyor...</p>
        </div>
      </section>
    );
  }

  const a4Prices = config.pricing.a4;
  const a3Multiplier = config.pricing.a3Multiplier;

  return (
    <section id="fiyatlandirma" className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 text-gray-900">
          Fiyatlandırma
        </h2>

        <div className="overflow-x-auto">
          <table className="w-full max-w-4xl mx-auto border-collapse border border-gray-300">
            <thead>
              <tr className="bg-gray-100">
                <th className="border border-gray-300 px-4 py-3 text-left">Baskı Türü</th>
                <th className="border border-gray-300 px-4 py-3 text-center">A4 (Sayfa Başı)</th>
                <th className="border border-gray-300 px-4 py-3 text-center">A3 (Sayfa Başı)</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="border border-gray-300 px-4 py-3 font-semibold" colSpan={3}>
                  Siyah Beyaz
                </td>
              </tr>
              <tr>
                <td className="border border-gray-300 px-4 py-3 pl-8">Tek Yön (0-100 sf)</td>
                <td className="border border-gray-300 px-4 py-3 text-center">
                  {a4Prices.blackWhite.single.upTo100.toFixed(2)} ₺
                </td>
                <td className="border border-gray-300 px-4 py-3 text-center">
                  {(a4Prices.blackWhite.single.upTo100 * a3Multiplier).toFixed(2)} ₺
                </td>
              </tr>
              <tr>
                <td className="border border-gray-300 px-4 py-3 pl-8">Tek Yön (101+ sf)</td>
                <td className="border border-gray-300 px-4 py-3 text-center">
                  {a4Prices.blackWhite.single.over100.toFixed(2)} ₺
                </td>
                <td className="border border-gray-300 px-4 py-3 text-center">
                  {(a4Prices.blackWhite.single.over100 * a3Multiplier).toFixed(2)} ₺
                </td>
              </tr>
              <tr>
                <td className="border border-gray-300 px-4 py-3 pl-8">Çift Yön (0-100 sf)</td>
                <td className="border border-gray-300 px-4 py-3 text-center">
                  {a4Prices.blackWhite.double.upTo100.toFixed(2)} ₺
                </td>
                <td className="border border-gray-300 px-4 py-3 text-center">
                  {(a4Prices.blackWhite.double.upTo100 * a3Multiplier).toFixed(2)} ₺
                </td>
              </tr>
              <tr>
                <td className="border border-gray-300 px-4 py-3 pl-8">Çift Yön (101+ sf)</td>
                <td className="border border-gray-300 px-4 py-3 text-center">
                  {a4Prices.blackWhite.double.over100.toFixed(2)} ₺
                </td>
                <td className="border border-gray-300 px-4 py-3 text-center">
                  {(a4Prices.blackWhite.double.over100 * a3Multiplier).toFixed(2)} ₺
                </td>
              </tr>
              <tr>
                <td className="border border-gray-300 px-4 py-3 font-semibold" colSpan={3}>
                  Renkli
                </td>
              </tr>
              <tr>
                <td className="border border-gray-300 px-4 py-3 pl-8">Tek Yön (0-100 sf)</td>
                <td className="border border-gray-300 px-4 py-3 text-center">
                  {a4Prices.color.single.upTo100.toFixed(2)} ₺
                </td>
                <td className="border border-gray-300 px-4 py-3 text-center">
                  {(a4Prices.color.single.upTo100 * a3Multiplier).toFixed(2)} ₺
                </td>
              </tr>
              <tr>
                <td className="border border-gray-300 px-4 py-3 pl-8">Tek Yön (101+ sf)</td>
                <td className="border border-gray-300 px-4 py-3 text-center">
                  {a4Prices.color.single.over100.toFixed(2)} ₺
                </td>
                <td className="border border-gray-300 px-4 py-3 text-center">
                  {(a4Prices.color.single.over100 * a3Multiplier).toFixed(2)} ₺
                </td>
              </tr>
              <tr>
                <td className="border border-gray-300 px-4 py-3 pl-8">Çift Yön (0-100 sf)</td>
                <td className="border border-gray-300 px-4 py-3 text-center">
                  {a4Prices.color.double.upTo100.toFixed(2)} ₺
                </td>
                <td className="border border-gray-300 px-4 py-3 text-center">
                  {(a4Prices.color.double.upTo100 * a3Multiplier).toFixed(2)} ₺
                </td>
              </tr>
              <tr>
                <td className="border border-gray-300 px-4 py-3 pl-8">Çift Yön (101+ sf)</td>
                <td className="border border-gray-300 px-4 py-3 text-center">
                  {a4Prices.color.double.over100.toFixed(2)} ₺
                </td>
                <td className="border border-gray-300 px-4 py-3 text-center">
                  {(a4Prices.color.double.over100 * a3Multiplier).toFixed(2)} ₺
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="mt-8 text-center text-gray-600">
          <p>* Fiyatlar sayfa başına gösterilmiştir. Kargo ücretleri sayfa sayısına göre değişmektedir.</p>
          <p className="mt-2">
            ** 2000+ sayfa siparişlerde kargo ücretsizdir.
          </p>
        </div>
      </div>
    </section>
  );
}

