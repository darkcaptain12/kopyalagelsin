import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function KVKKPage() {
  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold mb-6">KVKK Aydınlatma Metni</h1>
          
          <div className="prose max-w-none space-y-4">
            <p className="text-gray-700">
              <strong>6698 sayılı Kişisel Verilerin Korunması Kanunu</strong> kapsamında, kişisel verilerinizin işlenmesi hakkında sizleri bilgilendirmek isteriz.
            </p>

            <h2 className="text-2xl font-semibold mt-6 mb-3">1. Veri Sorumlusu</h2>
            <p className="text-gray-700">
              Kişisel verileriniz, 6698 sayılı KVKK uyarınca "Veri Sorumlusu" sıfatıyla kopyalagelsin tarafından işlenecektir.
            </p>

            <h2 className="text-2xl font-semibold mt-6 mb-3">2. İşlenen Kişisel Veriler</h2>
            <p className="text-gray-700">
              Hizmetlerimizden yararlanmanız için toplanan kişisel verileriniz şunlardır:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
              <li>Kimlik Bilgileri: Ad, soyad</li>
              <li>İletişim Bilgileri: E-posta adresi, telefon numarası, adres</li>
              <li>Müşteri İşlem Bilgileri: Sipariş bilgileri, ödeme bilgileri</li>
              <li>İşlem Güvenliği Bilgileri: IP adresi, çerez bilgileri</li>
            </ul>

            <h2 className="text-2xl font-semibold mt-6 mb-3">3. Kişisel Verilerin İşlenme Amaçları</h2>
            <p className="text-gray-700">
              Kişisel verileriniz aşağıdaki amaçlarla işlenmektedir:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
              <li>Siparişlerinizin işlenmesi ve teslim edilmesi</li>
              <li>Ödeme işlemlerinin gerçekleştirilmesi</li>
              <li>Müşteri hizmetleri sağlanması</li>
              <li>Yasal yükümlülüklerin yerine getirilmesi</li>
              <li>Kampanya ve promosyon bilgilendirmeleri</li>
            </ul>

            <h2 className="text-2xl font-semibold mt-6 mb-3">4. Kişisel Verilerin Aktarılması</h2>
            <p className="text-gray-700">
              Kişisel verileriniz, yukarıda belirtilen amaçların gerçekleştirilmesi kapsamında, yasal yükümlülüklerimizin yerine getirilmesi için ödeme kuruluşları ve kargo firmaları gibi hizmet sağlayıcılarla paylaşılabilir.
            </p>

            <h2 className="text-2xl font-semibold mt-6 mb-3">5. Haklarınız</h2>
            <p className="text-gray-700">
              KVKK'nın 11. maddesi uyarınca, kişisel verilerinizle ilgili olarak aşağıdaki haklara sahipsiniz:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
              <li>Kişisel veri işlenip işlenmediğini öğrenme</li>
              <li>İşlenmişse buna ilişkin bilgi talep etme</li>
              <li>İşlenme amacını ve bunların amacına uygun kullanılıp kullanılmadığını öğrenme</li>
              <li>Yurt içinde veya yurt dışında aktarıldığı üçüncü kişileri bilme</li>
              <li>Eksik veya yanlış işlenmişse düzeltilmesini isteme</li>
              <li>Kanunda öngörülen şartlar çerçevesinde silinmesini veya yok edilmesini isteme</li>
              <li>Aktarıldığı üçüncü kişilere bildirilmesini isteme</li>
              <li>Münhasıran otomatik sistemler ile analiz edilmesi nedeniyle aleyhinize bir sonuç doğmasına itiraz etme</li>
              <li>Kanuna aykırı olarak işlenmesi sebebiyle zarara uğramanız hâlinde zararın giderilmesini talep etme</li>
            </ul>

            <h2 className="text-2xl font-semibold mt-6 mb-3">6. İletişim</h2>
            <p className="text-gray-700">
              KVKK kapsamındaki haklarınızı kullanmak için aşağıdaki iletişim kanallarından bize ulaşabilirsiniz:
            </p>
            <p className="text-gray-700">
              <strong>E-posta:</strong> info@kopyalagelsin.com
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

