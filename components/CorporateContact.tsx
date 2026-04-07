"use client";

const PHONE_NUMBER = "05493506040";
const PHONE_DISPLAY = "0549 350 60 40";
const WHATSAPP_MESSAGE = encodeURIComponent(
  "Merhaba, kurumsal baskı ve toplu üretim hakkında bilgi almak istiyorum."
);
const WHATSAPP_URL = `https://wa.me/90${PHONE_NUMBER.replace(/^0/, "")}?text=${WHATSAPP_MESSAGE}`;

/**
 * Kurumsal baskı iletişim bloğu.
 * Sipariş formu sağ sütununda (fiyat özeti altında) gösterilir.
 */
export default function CorporateContact() {
  return (
    <div className="mt-6 rounded-xl border border-blue-100 bg-gradient-to-br from-blue-50 to-indigo-50 p-5 shadow-sm">
      {/* Başlık */}
      <div className="flex items-start gap-3 mb-3">
        <div className="flex-shrink-0 w-9 h-9 bg-blue-600 rounded-lg flex items-center justify-center shadow-sm">
          <svg
            className="w-5 h-5 text-white"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
            />
          </svg>
        </div>
        <div>
          <h3 className="font-semibold text-gray-900 text-sm leading-tight">
            Kurumsal Baskı Çözümleri
          </h3>
          <p className="text-xs text-blue-600 font-medium mt-0.5">Toplu Sipariş & Özel Üretim</p>
        </div>
      </div>

      {/* Açıklama */}
      <p className="text-xs text-gray-600 leading-relaxed mb-4">
        Kurumunuza özel toplu baskı, katalog üretimi ve kurumsal kimlik materyalleri için
        size özel fiyatlandırma ve öncelikli üretim avantajından yararlanın.
      </p>

      {/* Butonlar */}
      <div className="flex flex-col gap-2">
        {/* WhatsApp */}
        <a
          href={WHATSAPP_URL}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="WhatsApp üzerinden kurumsal baskı için iletişime geçin"
          className="flex items-center justify-center gap-2.5 w-full py-2.5 px-4
                     bg-[#25D366] hover:bg-[#1fba59] text-white rounded-lg
                     text-sm font-semibold transition-colors shadow-sm"
        >
          {/* WhatsApp ikonu */}
          <svg
            className="w-4.5 h-4.5 flex-shrink-0"
            viewBox="0 0 24 24"
            fill="currentColor"
            aria-hidden="true"
            style={{ width: "18px", height: "18px" }}
          >
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 00-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
          </svg>
          WhatsApp ile İletişim
        </a>

        {/* Telefon */}
        <a
          href={`tel:+90${PHONE_NUMBER.replace(/^0/, "")}`}
          aria-label={`Bizi arayın: ${PHONE_DISPLAY}`}
          className="flex items-center justify-center gap-2.5 w-full py-2.5 px-4
                     bg-white hover:bg-gray-50 text-gray-700 hover:text-blue-700
                     rounded-lg text-sm font-semibold border border-gray-200
                     transition-colors shadow-sm"
        >
          {/* Telefon ikonu */}
          <svg
            className="w-4 h-4 flex-shrink-0"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
            />
          </svg>
          {PHONE_DISPLAY}
        </a>
      </div>

      {/* Alt not */}
      <p className="text-[10px] text-gray-400 text-center mt-3 leading-relaxed">
        Hafta içi 09:00 – 18:00 arası hizmetinizdeyiz
      </p>
    </div>
  );
}
