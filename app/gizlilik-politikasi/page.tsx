import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function GizlilikPolitikasiPage() {
  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold mb-6">Gizlilik Politikası</h1>
          
          <div className="prose max-w-none space-y-4">
            <p className="text-gray-700">
              kopyalagelsin olarak, kullanıcılarımızın gizliliğini korumayı öncelik olarak görüyoruz. Bu Gizlilik Politikası, web sitemizi kullandığınızda topladığımız bilgiler ve bu bilgileri nasıl kullandığımız hakkında bilgi vermektedir.
            </p>

            <h2 className="text-2xl font-semibold mt-6 mb-3">1. Toplanan Bilgiler</h2>
            <p className="text-gray-700">
              Sizden topladığımız bilgiler şunlardır:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
              <li><strong>Kişisel Bilgiler:</strong> Ad, soyad, e-posta adresi, telefon numarası, adres</li>
              <li><strong>İşlem Bilgileri:</strong> Sipariş detayları, ödeme bilgileri</li>
              <li><strong>Teknik Bilgiler:</strong> IP adresi, tarayıcı türü, işletim sistemi</li>
              <li><strong>Çerezler:</strong> Site deneyimini iyileştirmek için kullanılan çerezler</li>
            </ul>

            <h2 className="text-2xl font-semibold mt-6 mb-3">2. Bilgilerin Kullanımı</h2>
            <p className="text-gray-700">
              Toplanan bilgiler aşağıdaki amaçlarla kullanılmaktadır:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
              <li>Siparişlerinizin işlenmesi ve teslim edilmesi</li>
              <li>Müşteri hizmetleri sağlanması</li>
              <li>Kampanya ve promosyon duyuruları</li>
              <li>Hizmet kalitesinin iyileştirilmesi</li>
              <li>Yasal yükümlülüklerin yerine getirilmesi</li>
            </ul>

            <h2 className="text-2xl font-semibold mt-6 mb-3">3. Bilgilerin Korunması</h2>
            <p className="text-gray-700">
              Kişisel bilgilerinizi korumak için uygun teknik ve idari önlemler almaktayız. Verileriniz SSL şifreleme ile korunmaktadır.
            </p>

            <h2 className="text-2xl font-semibold mt-6 mb-3">4. Çerezler</h2>
            <p className="text-gray-700">
              Web sitemiz, kullanıcı deneyimini iyileştirmek için çerezler kullanmaktadır. Çerezleri tarayıcı ayarlarınızdan yönetebilirsiniz.
            </p>

            <h2 className="text-2xl font-semibold mt-6 mb-3">5. Üçüncü Taraf Hizmetleri</h2>
            <p className="text-gray-700">
              Siparişlerinizin teslimi ve ödeme işlemleri için güvenilir üçüncü taraf hizmet sağlayıcılarla çalışmaktayız. Bu firmalar yalnızca hizmet sağlama amacıyla gerekli bilgilere erişebilir.
            </p>

            <h2 className="text-2xl font-semibold mt-6 mb-3">6. Bilgi Paylaşımı</h2>
            <p className="text-gray-700">
              Kişisel bilgileriniz, yasal yükümlülükler dışında, sizin onayınız olmadan üçüncü taraflarla paylaşılmaz.
            </p>

            <h2 className="text-2xl font-semibold mt-6 mb-3">7. Haklarınız</h2>
            <p className="text-gray-700">
              KVKK kapsamında kişisel verilerinizle ilgili tüm haklarınıza sahipsiniz. Detaylı bilgi için KVKK Aydınlatma Metnimizi inceleyebilirsiniz.
            </p>

            <h2 className="text-2xl font-semibold mt-6 mb-3">8. İletişim</h2>
            <p className="text-gray-700">
              Gizlilik politikamızla ilgili sorularınız için: <strong>info@kopyalagelsin.com</strong>
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

