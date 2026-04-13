/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  webpack: (config) => {
    // pdfjs-dist canvas & encoding shims
    config.resolve.alias.canvas = false;
    config.resolve.alias.encoding = false;
    return config;
  },

  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          // Sitenin başka sitelerde iframe içinde açılmasını engeller
          { key: "X-Frame-Options", value: "DENY" },
          // Tarayıcının dosya tipini tahmin etmesini engeller
          { key: "X-Content-Type-Options", value: "nosniff" },
          // XSS koruması (eski tarayıcılar için)
          { key: "X-XSS-Protection", value: "1; mode=block" },
          // Referrer bilgisini sınırlar
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          // İzin politikaları
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
