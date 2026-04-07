import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function IadeIptalPolitikasiPage() {
  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold mb-6">İade ve İptal Politikası</h1>
          
          <div className="prose max-w-none space-y-4">
            <p className="text-gray-700">
              Bu politika, kopyalagelsin üzerinden verilen siparişlerin iptali ve iadesi ile ilgili koşulları açıklamaktadır.
            </p>

            <h2 className="text-2xl font-semibold mt-6 mb-3">1. Sipariş İptali</h2>
            <p className="text-gray-700">
              Siparişiniz henüz işleme alınmadıysa, aşağıdaki koşullarda iptal edebilirsiniz:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
              <li>Sipariş, ödeme onayından sonra 2 saat içinde iptal edilebilir.</li>
              <li>İptal talebinizi e-posta ile iletebilirsiniz: <strong>info@kopyalagelsin.com</strong></li>
              <li>İptal edilen siparişler için ödeme iadesi 5-7 iş günü içinde yapılır.</li>
            </ul>

            <h2 className="text-2xl font-semibold mt-6 mb-3">2. İşleme Alınmış Siparişler</h2>
            <p className="text-gray-700">
              Siparişiniz işleme alındıktan sonra (baskı işlemi başladıktan sonra) iptal edilemez. Ancak aşağıdaki durumlarda değerlendirme yapılır:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
              <li>Bizden kaynaklanan hatalar (yanlış sayfa sayısı, renk hatası vb.)</li>
              <li>Gecikme durumları</li>
              <li>Ürün hasarlı teslim edildiğinde</li>
            </ul>

            <h2 className="text-2xl font-semibold mt-6 mb-3">3. İade Koşulları</h2>
            <p className="text-gray-700">
              Aşağıdaki durumlarda iade kabul edilir:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
              <li>Ürün, bizden kaynaklanan bir hata nedeniyle yanlış basılmışsa</li>
              <li>Ürün, teslimat sırasında hasar görmüşse</li>
              <li>Ürün, siparişte belirtilen özelliklere uymuyorsa</li>
            </ul>

            <h2 className="text-2xl font-semibold mt-6 mb-3">4. İade Süreci</h2>
            <ol className="list-decimal list-inside text-gray-700 space-y-2 ml-4">
              <li>İade talebinizi 3 gün içinde e-posta ile bildirin.</li>
              <li>İade nedeni ve sipariş numaranızı belirtin.</li>
              <li>Hasarlı ürün fotoğraflarını gönderin (varsa).</li>
              <li>Değerlendirme sonrası size bilgi verilir.</li>
              <li>Onay verildiğinde, ürünü kargo ile gönderebilirsiniz (kargo ücreti bizim tarafımızdan karşılanır).</li>
              <li>İade işlemi tamamlandıktan sonra ödeme iadesi yapılır.</li>
            </ol>

            <h2 className="text-2xl font-semibold mt-6 mb-3">5. İade Edilmeyen Durumlar</h2>
            <p className="text-gray-700">
              Aşağıdaki durumlarda iade kabul edilmez:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
              <li>Müşteri hatası nedeniyle yanlış seçilen özellikler</li>
              <li>Yüklenen PDF dosyasındaki hatalar</li>
              <li>Kişisel beğeni farklılıkları</li>
              <li>İade süresinin geçmesi</li>
            </ul>

            <h2 className="text-2xl font-semibold mt-6 mb-3">6. Ödeme İadesi</h2>
            <p className="text-gray-700">
              İade onaylandıktan sonra, ödeme iadesi aynı ödeme yöntemi ile 5-7 iş günü içinde gerçekleştirilir.
            </p>

            <h2 className="text-2xl font-semibold mt-6 mb-3">7. Kargo</h2>
            <p className="text-gray-700">
              İade kargo ücreti, bizden kaynaklanan hatalar için bizim tarafımızdan karşılanır. Müşteri hatası durumunda kargo ücreti müşteriye aittir.
            </p>

            <h2 className="text-2xl font-semibold mt-6 mb-3">8. İletişim</h2>
            <p className="text-gray-700">
              İade ve iptal talepleriniz için: <strong>info@kopyalagelsin.com</strong>
            </p>
            <p className="text-gray-700">
              Taleplerinize en geç 24 saat içinde yanıt verilir.
            </p>

            <div className="mt-8 pt-6 border-t">
              <Link href="/" className="text-blue-600 hover:text-blue-800">
                ← Anasayfaya Dön
              </Link>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}

