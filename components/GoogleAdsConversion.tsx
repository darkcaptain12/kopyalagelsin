"use client";

import { useEffect } from "react";

declare global {
  interface Window {
    gtag?: (...args: any[]) => void;
  }
}

const SEND_TO = "AW-18469540227/7k-zCPvU14QdEIOj--ZE";
const LAST_ORDER_KEY = "kg_last_order_id";
const sentKey = (id: string) => `kg_ads_conv_sent_${id}`;

function safeGet(key: string): string | null {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

function safeSet(key: string, value: string) {
  try {
    localStorage.setItem(key, value);
  } catch {}
}

/**
 * Ödeme başarılı sayfasında Google Ads dönüşümünü sipariş başına BİR KEZ gönderir.
 * - Sipariş ID: URL'deki ?orderId, yoksa ödeme başlatılırken kaydedilen ID
 * - Tutar backend'den okunur; sipariş "paid" olmadan tetiklenmez (PayTR notify gecikmesine karşı 30 sn polling)
 * - localStorage işareti ile yenileme/geri gelmede tekrar gönderilmez; ayrıca transaction_id ile Google tarafında da tekilleşir
 */
export default function GoogleAdsConversion({ orderIdFromUrl }: { orderIdFromUrl?: string | null }) {
  useEffect(() => {
    const orderId = orderIdFromUrl || safeGet(LAST_ORDER_KEY);
    if (!orderId || safeGet(sentKey(orderId))) return;

    let cancelled = false;
    const deadline = Date.now() + 30000;

    const waitForGtag = async (): Promise<boolean> => {
      while (!cancelled && Date.now() < deadline) {
        if (typeof window.gtag === "function") return true;
        await new Promise((r) => setTimeout(r, 300));
      }
      return false;
    };

    const run = async () => {
      while (!cancelled && Date.now() < deadline) {
        try {
          const res = await fetch(`/api/orders/${encodeURIComponent(orderId)}/conversion`, {
            cache: "no-store",
          });
          if (res.status === 404) return; // geçersiz sipariş — tetikleme
          if (res.ok) {
            const data = await res.json();
            if (data.paid && typeof data.value === "number" && data.value > 0) {
              if (!(await waitForGtag()) || cancelled) return;
              if (safeGet(sentKey(orderId))) return; // yarış durumuna karşı son kontrol
              safeSet(sentKey(orderId), "1");
              window.gtag!("event", "conversion", {
                send_to: SEND_TO,
                value: data.value,
                currency: "TRY",
                transaction_id: data.orderId,
              });
              return;
            }
          }
        } catch {}
        await new Promise((r) => setTimeout(r, 2000));
      }
    };

    run();
    return () => {
      cancelled = true;
    };
  }, [orderIdFromUrl]);

  return null;
}
