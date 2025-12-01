export default function Advantages() {
  const advantages = [
    {
      icon: "💰",
      title: "Uygun Fiyat",
      description: "Öğrenciler için özel fiyatlandırma ile en uygun çıktı hizmeti.",
    },
    {
      icon: "🚀",
      title: "Hızlı Kargo",
      description: "Siparişiniz hazırlandıktan hemen sonra hızlı kargo ile adresinize teslim.",
    },
    {
      icon: "🎓",
      title: "Öğrenci Odaklı",
      description: "Öğrencilerin ihtiyaçlarına özel tasarlanmış hızlı ve kolay sipariş süreci.",
    },
    {
      icon: "🔒",
      title: "Güvenli Ödeme",
      description: "PayTR güvenli ödeme sistemi ile güvenle alışveriş yapın.",
    },
    {
      icon: "📄",
      title: "PDF Desteği",
      description: "Tüm PDF formatlarını destekliyoruz. Dosyanızı direkt yükleyin.",
    },
    {
      icon: "⚡",
      title: "Kolay Sipariş",
      description: "Birkaç tıkla sipariş verin, gerisini biz hallederiz.",
    },
  ];

  return (
    <section className="py-16 bg-blue-50">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 text-gray-900">
          Neden Bizi Seçmelisiniz?
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {advantages.map((advantage, index) => (
            <div
              key={index}
              className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition"
            >
              <div className="text-4xl mb-4">{advantage.icon}</div>
              <h3 className="text-xl font-semibold mb-2 text-gray-900">{advantage.title}</h3>
              <p className="text-gray-600">{advantage.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

