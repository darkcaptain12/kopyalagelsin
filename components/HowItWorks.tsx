export default function HowItWorks() {
  const steps = [
    {
      number: "1",
      title: "PDF Yükle",
      description: "PDF dosyanızı yükleyin. Sistem otomatik olarak sayfa sayısını tespit eder.",
      icon: "📄",
    },
    {
      number: "2",
      title: "Seçenekleri Belirle",
      description: "Baskı rengi, yönü, ebadı ve ciltleme seçeneklerini belirleyin.",
      icon: "⚙️",
    },
    {
      number: "3",
      title: "Online Ödeme Yap",
      description: "Güvenli PayTR ödeme sistemi ile online ödemenizi tamamlayın.",
      icon: "💳",
    },
    {
      number: "4",
      title: "Kargo ile Teslim",
      description: "Siparişiniz hazırlandıktan sonra adresinize kargo ile teslim edilir.",
      icon: "📦",
    },
  ];

  return (
    <section id="nasil-calisir" className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 text-gray-900">
          Nasıl Çalışır?
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step) => (
            <div
              key={step.number}
              className="bg-white rounded-lg shadow-lg p-6 text-center hover:shadow-xl transition"
            >
              <div className="text-5xl mb-4">{step.icon}</div>
              <div className="text-4xl font-bold text-blue-600 mb-2">{step.number}</div>
              <h3 className="text-xl font-semibold mb-3 text-gray-900">{step.title}</h3>
              <p className="text-gray-600">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

