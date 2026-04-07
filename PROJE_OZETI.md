# Kopyala Gelsin - Proje Özeti

## Genel Bakış

**Kopyala Gelsin**, öğrencilere yönelik dijital baskı sipariş platformudur. Kullanıcılar PDF yükleyerek baskı siparişi oluşturabiliyor, çeşitli cilt seçenekleri seçebiliyor ve ödeme yapabiliyor.

---

## Teknoloji Yığını

| Katman | Teknoloji |
|--------|-----------|
| Framework | Next.js 14.2.5 (App Router) |
| Dil | TypeScript |
| Stil | Tailwind CSS 3.4 |
| Auth | JWT (jsonwebtoken) + bcryptjs |
| PDF İşleme | pdf-lib + pdf-parse |
| Dosya Depolama | Vercel Blob Storage (prod) / Local JSON (dev) |
| Ödeme | PayTR (iframe tabanlı) |
| Deploy | Vercel |

---

## Proje Yapısı

```
dijital_web/
├── app/
│   ├── page.tsx                    # Ana sayfa
│   ├── admin/page.tsx              # Admin paneli
│   ├── giris/page.tsx              # Kullanıcı giriş
│   ├── uye-ol/page.tsx             # Kayıt
│   ├── hesabim/page.tsx            # Profil & sipariş geçmişi
│   ├── odeme/basarili/page.tsx     # Ödeme başarı
│   ├── odeme/hata/page.tsx         # Ödeme hata
│   ├── pdf-birlestir/page.tsx      # PDF birleştirme
│   └── (yasal sayfalar)            # KVKK, gizlilik vb.
│
├── components/
│   ├── OrderForm.tsx               # Ana sipariş formu (ana bileşen)
│   ├── Navbar.tsx                  # Navigasyon
│   ├── Hero.tsx                    # Banner alanı
│   ├── AnnouncementBar.tsx         # Duyuru çubuğu
│   ├── SignupPopup.tsx             # Ziyaretçi popup
│   ├── Footer.tsx                  # Alt bilgi
│   ├── FAQ.tsx                     # SSS
│   ├── HowItWorks.tsx              # Nasıl çalışır
│   ├── Advantages.tsx              # Avantajlar
│   └── PricingOverview.tsx         # Fiyat gösterimi
│
├── app/api/
│   ├── auth/                       # Giriş, kayıt, çıkış, me
│   ├── paytr/                      # Ödeme init, notify, callback
│   ├── orders/                     # Sipariş detay
│   ├── pdf/                        # PDF upload, sayfa sayısı
│   ├── users/                      # Kullanıcı siparişleri, kuponlar
│   ├── admin/                      # Admin: siparişler, kuponlar, banner, loglar
│   └── config/                     # Uygulama yapılandırması
│
├── lib/
│   ├── config.ts                   # Yapılandırma okuma/yazma
│   ├── pricing.ts                  # Fiyat hesaplama mantığı
│   ├── ordersStore.ts              # Sipariş CRUD
│   ├── usersStore.ts               # Kullanıcı CRUD
│   ├── couponsStore.ts             # Kupon CRUD
│   ├── auth.ts                     # JWT session yönetimi
│   ├── paytr.ts                    # PayTR entegrasyon
│   ├── blobStorage.ts              # Vercel Blob wrapper
│   ├── pdfStorage.ts               # PDF upload yönetimi
│   ├── discounts.ts                # İndirim hesaplama
│   ├── logStore.ts                 # Aktivite logları
│   └── types.ts                    # TypeScript tipleri
│
└── data/                           # JSON tabanlı yerel veritabanı
    ├── config.json
    ├── orders.json
    ├── users.json
    ├── coupons.json
    └── logs.json
```

---

## Özellikler

### Kullanıcı Tarafı
- PDF yükleme ve otomatik sayfa sayısı tespiti
- Dinamik fiyatlandırma (kağıt boyutu, renk, yön, cilt tipi, kargo)
- Kullanıcı kaydı, girişi ve profil yönetimi
- Sipariş geçmişi
- Kupon kullanımı (karşılama, referans kuponları)
- Referans kodu sistemi (her kullanıcıya özel kod)
- PayTR ile güvenli ödeme

### Admin Paneli
- Sipariş yönetimi (arama, filtreleme, export)
- Fiyat yapılandırma (A4/A3, siyah-beyaz/renkli, cilt, kargo kademeleri, KDV)
- Kupon oluşturma ve yönetimi
- Banner görsel yükleme
- Duyuru çubuğu ve UI metinleri düzenleme
- Sezon modu (normal / vize / final / tez) ile fiyat çarpanı
- Aktivite logları

---

## Fiyatlandırma Mantığı

### A4 Fiyatları (sayfa başı)
| Tür | 1-100 sayfa | 100+ sayfa |
|-----|-------------|------------|
| Siyah-Beyaz Tek Yön | 0.75₺ | 0.50₺ |
| Siyah-Beyaz Çift Yön | 1.75₺ | 1.50₺ |
| Renkli Tek Yön | 0.90₺ | 0.70₺ |
| Renkli Çift Yön | 1.85₺ | 1.60₺ |

- A3 kağıt: 2x çarpan
- KDV: %20
- Spiral cilt: 40₺ (1-10 adet) / 30₺ (11+)
- Amerikan cilt: 30₺ (1-10 adet) / 25₺ (11+)

### Kargo Kademeleri
| Sayfa Aralığı | Ücret |
|---------------|-------|
| 0-500 | 125₺ |
| 501-1000 | 180₺ |
| 1001-1500 | 220₺ |
| 1501-2000 | 240₺ |
| 2000+ | Ücretsiz |

---

## Veri Depolama

**Geliştirme ortamı**: `/data` klasöründe JSON dosyaları
**Prodüksiyon (Vercel)**: Vercel Blob Storage (`app-data/` öneki ile)

Ortam tespiti otomatik: `VERCEL`, `VERCEL_ENV`, `VERCEL_URL` env değişkenlerine göre.

---

## API Rotaları

### Auth
```
POST /api/auth/login       - Kullanıcı girişi
POST /api/auth/register    - Yeni kayıt
GET  /api/auth/me          - Oturum bilgisi
POST /api/auth/logout      - Çıkış
```

### Ödeme
```
POST /api/paytr/init       - Ödeme başlatma (PayTR token üretimi)
POST /api/paytr/notify     - Ödeme bildirim webhook
GET  /api/paytr/callback   - Ödeme callback
```

### Siparişler
```
GET /api/orders/[orderId]              - Sipariş detay
GET /api/users/[userId]/orders         - Kullanıcının siparişleri
GET /api/users/[userId]/coupons        - Kullanıcının kuponları
```

### PDF
```
POST /api/pdf/upload   - PDF yükleme
GET  /api/pdf/pages    - Sayfa bilgisi
```

### Admin
```
POST /api/admin/login              - Admin girişi
GET  /api/admin/orders             - Tüm siparişler
POST /api/admin/orders/clear       - Siparişleri temizle
GET  /api/admin/coupons            - Kupon listesi
POST /api/admin/coupons            - Kupon oluştur
PUT  /api/admin/coupons/toggle     - Kupon aktif/pasif
POST /api/admin/banner/upload      - Banner yükleme
GET  /api/admin/logs               - Aktivite logları
GET  /api/config                   - Yapılandırma oku
POST /api/config                   - Yapılandırma güncelle (admin)
```

---

## Güvenlik

- Şifre hashleme: bcryptjs (10 salt round)
- Session: JWT, 30 günlük, httpOnly secure cookie
- Ödeme doğrulama: HMAC-SHA256 (PayTR merchant key ile)
- Sunucu tarafı fiyat doğrulama (client manipülasyonu engeli)
- Admin: env değişkeninde saklanan tek şifre ile koruma

---

## Ortam Değişkenleri

```env
PAYTR_MERCHANT_ID=
PAYTR_MERCHANT_KEY=
PAYTR_MERCHANT_SALT=
PAYTR_TEST_MODE=true/false
ADMIN_PASSWORD=
NEXT_PUBLIC_APP_URL=
JWT_SECRET=
BLOB_READ_WRITE_TOKEN=   # Vercel Blob için
```

---

## Kupon Sistemi

- Türler: `WELCOME` (yeni üye), `REFERRAL` (referans)
- Tek kullanımlık
- Tarih bazlı geçerlilik (validFrom / validUntil)
- Kullanım sonrası otomatik deaktive
- Format: `KOPYALAGELSİN-XXXXX`

---

## İndirim Sistemi

| İndirim | Miktar | Koşul |
|---------|--------|-------|
| Hoşgeldin | %5 (varsayılan) | İlk siparişte |
| Referans | %5 (varsayılan) | Referans kuponuyla |
| Sezon modu | Değişken | Admin tarafından ayarlanır |

---

## Bilinen Kısıtlamalar / Notlar

- Vercel Blob'a yüklenen PDF'ler otomatik temizlenmiyor (birikim riski)
- Admin için tek şifre sistemi var, çok kullanıcılı admin desteği yok
- JSON tabanlı depolama, yüksek yük senaryoları için ölçeklenmez (gerçek bir DB önerilir)
- Sipariş arama/filtreleme tüm siparişleri belleğe çekerek yapılıyor
