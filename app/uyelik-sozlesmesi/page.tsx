import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function UyelikSozlesmesiPage() {
  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold mb-6">Üyelik Sözleşmesi</h1>
          
          <div className="prose max-w-none space-y-4">
            <p className="text-gray-700">
              Bu Üyelik Sözleşmesi, kopyalagelsin web sitesi üzerinden dijital çıktı hizmeti sunan platform ile üyeler arasındaki hak ve yükümlülükleri düzenlemektedir.
            </p>

            <h2 className="text-2xl font-semibold mt-6 mb-3">1. Taraflar</h2>
            <p className="text-gray-700">
              Bu sözleşme, kopyalagelsin (Hizmet Sağlayıcı) ile web sitesine üye olan gerçek veya tüzel kişi (Üye) arasında yapılmıştır.
            </p>

            <h2 className="text-2xl font-semibold mt-6 mb-3">2. Üyelik Koşulları</h2>
            <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
              <li>Üyelik 18 yaşını tamamlamış gerçek kişiler veya tüzel kişiler tarafından yapılabilir.</li>
              <li>Üyelik işlemi sırasında doğru ve güncel bilgiler verilmesi zorunludur.</li>
              <li>Her e-posta adresi için yalnızca bir üyelik açılabilir.</li>
              <li>Üyelik ücretsizdir, ancak hizmetlerden yararlanmak için ödeme gereklidir.</li>
            </ul>

            <h2 className="text-2xl font-semibold mt-6 mb-3">3. Üye Hakları</h2>
            <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
              <li>Üye, platform üzerinden dijital çıktı hizmeti alabilir.</li>
              <li>Üye, kampanya ve indirimlerden yararlanabilir.</li>
              <li>Üye, sipariş geçmişine erişebilir.</li>
              <li>Üye, kupon kodlarından yararlanabilir.</li>
            </ul>

            <h2 className="text-2xl font-semibold mt-6 mb-3">4. Üye Yükümlülükleri</h2>
            <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
              <li>Üye, şifresini gizli tutmakla yükümlüdür.</li>
              <li>Üye, yasadışı amaçlarla platformu kullanamaz.</li>
              <li>Üye, telif haklarını ihlal eden içerikler yükleyemez.</li>
              <li>Üye, doğru ve güncel bilgiler vermekle yükümlüdür.</li>
            </ul>

            <h2 className="text-2xl font-semibold mt-6 mb-3">5. Üyelik İptali</h2>
            <p className="text-gray-700">
              Üye, dilediği zaman üyeliğini iptal edebilir. Üyelik iptali, devam eden siparişleri etkilemez.
            </p>

            <h2 className="text-2xl font-semibold mt-6 mb-3">6. Değişiklikler</h2>
            <p className="text-gray-700">
              Hizmet Sağlayıcı, bu sözleşmeyi önceden bildirimde bulunmaksızın değiştirebilir. Değişiklikler yayınlandığı tarihte yürürlüğe girer.
            </p>

            <h2 className="text-2xl font-semibold mt-6 mb-3">7. İletişim</h2>
            <p className="text-gray-700">
              Sözleşme ile ilgili sorularınız için: <strong>info@kopyalagelsin.com</strong>
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

