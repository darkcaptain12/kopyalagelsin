"use client";

import { useState } from "react";

interface FAQItem {
  question: string;
  answer: string;
}

const faqs: FAQItem[] = [
  {
    question: "Hangi dosya formatlarını kabul ediyorsunuz?",
    answer: "Sadece PDF formatındaki dosyaları kabul ediyoruz. Maksimum dosya boyutu 50 MB'dır.",
  },
  {
    question: "Siparişim ne kadar sürede hazırlanır?",
    answer: "Siparişiniz genellikle 1-2 iş günü içinde hazırlanır ve kargo ile gönderilir.",
  },
  {
    question: "Kargo ücreti nasıl hesaplanıyor?",
    answer:
      "Kargo ücreti toplam sayfa sayısına göre belirlenir. 2000+ sayfa siparişlerde kargo ücretsizdir.",
  },
  {
    question: "Hangi ödeme yöntemlerini kabul ediyorsunuz?",
    answer:
      "PayTR güvenli ödeme sistemi üzerinden kredi kartı, banka kartı ve havale ile ödeme yapabilirsiniz.",
  },
  {
    question: "Siparişimi iptal edebilir miyim?",
    answer:
      "Siparişiniz hazırlanmaya başlamadan önce iptal edebilirsiniz. Lütfen bizimle iletişime geçin.",
  },
  {
    question: "A3 baskı için özel bir fiyatlandırma var mı?",
    answer: "A3 baskı fiyatları, A4 fiyatlarının 2 katıdır. Detaylı fiyatlandırma için fiyatlandırma bölümüne bakabilirsiniz.",
  },
];

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggle = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section id="sss" className="py-16 bg-white">
      <div className="container mx-auto px-4 max-w-3xl">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 text-gray-900">
          Sık Sorulan Sorular
        </h2>
        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className="border border-gray-200 rounded-lg overflow-hidden"
            >
              <button
                onClick={() => toggle(index)}
                className="w-full text-left px-6 py-4 bg-gray-50 hover:bg-gray-100 transition flex justify-between items-center"
              >
                <span className="font-semibold text-gray-900">{faq.question}</span>
                <span className="text-xl text-gray-600">
                  {openIndex === index ? "−" : "+"}
                </span>
              </button>
              {openIndex === index && (
                <div className="px-6 py-4 bg-white text-gray-700">{faq.answer}</div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

