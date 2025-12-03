# 🖨️ Kopyala Gelsin - Dijital Çıktı Sipariş Sistemi

Next.js 14 ile geliştirilmiş, öğrenciler için uygun fiyatlı dijital çıktı sipariş sistemi. PayTR ödeme entegrasyonu ve kapsamlı admin paneli ile profesyonel bir e-ticaret çözümü.

![Next.js](https://img.shields.io/badge/Next.js-14-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.0-38bdf8)

## 📋 İçindekiler

- [Özellikler](#-özellikler)
- [Teknolojiler](#-teknolojiler)
- [Kurulum](#-kurulum)
- [Kullanım](#-kullanım)
- [Admin Paneli](#-admin-paneli)
- [Fiyatlandırma](#-fiyatlandırma)
- [Deployment](#-deployment)
- [Proje Yapısı](#-proje-yapısı)

## ✨ Özellikler

### 🛒 Müşteri Özellikleri

- 📄 **PDF Yükleme**: Otomatik sayfa sayısı tespiti
- 🎨 **Esnek Baskı Seçenekleri**: 
  - Baskı Ebadı: A4 / A3
  - Baskı Rengi: Siyah-Beyaz / Renkli
  - Baskı Yönü: Tek Yön / Çift Yön
  - Ciltleme: Yok / Spiral / Amerikan
- 💰 **Otomatik Fiyat Hesaplama**: Sayfa sayısına göre kademeli fiyatlandırma
- 🚚 **Akıllı Kargo**: 2000 TL üzeri siparişlerde ücretsiz kargo
- 💳 **PayTR Ödeme Entegrasyonu**: Güvenli ödeme sistemi
- 👤 **Üyelik Sistemi**: 
  - Üye olmadan sipariş verebilme (guest checkout)
  - Üye olarak indirim kazanma
  - Hesap yönetimi
- 🎫 **Kupon Sistemi**: 
  - Tek kullanımlık kuponlar
  - Hoş geldin indirimi (yeni üyelere otomatik)
  - Referans programı
- 📢 **Dinamik İçerik**: 
  - Kayar metin (announcement bar)
  - Banner yönetimi
  - Footer düzenleme

### 🔐 Admin Paneli Özellikleri

#### 📊 Sipariş Yönetimi
- ✅ **Gelişmiş Filtreleme**:
  - Müşteri adı/soyadı ile arama
  - Sipariş numarası ile arama
  - Tarih aralığı filtreleme
  - Günlük sipariş görünümü
  - Arşiv görünümü (geçmiş günler)
- 📥 **Sipariş Detayları**:
  - Müşteri bilgileri
  - Baskı detayları (sayfa sayısı, renk, boyut vb.)
  - PDF indirme
  - Sipariş durumu (pending, paid, failed)
  - Ödeme bilgileri
- 🔄 **Otomatik Arşivleme**: Her gün 00:00'da siparişler otomatik arşivlenir

#### 💰 Fiyatlandırma Yönetimi
- ⚙️ **Dinamik Fiyat Ayarları**:
  - A4/A3 baskı fiyatları (siyah-beyaz/renkli)
  - Tek/çift yön fiyat çarpanları
  - Ciltleme ücretleri (Spiral, Amerikan)
  - KDV oranı
  - Kargo ücreti
  - Ücretsiz kargo eşiği
- 📈 **Sayfa Başına Fiyat**: Kademeli fiyatlandırma (0-50, 51-100, 101-150, 151-200, 201+)
- 🎯 **Özel Fiyat Kuralları**: Spiral cilt özel fiyatlandırma

#### 🎨 UI (Kullanıcı Arayüzü) Yönetimi
- 📢 **Announcement Bar (Kayar Metin)**:
  - Aktif/Pasif
  - Metin içeriği
  - Bağlantı URL
  - Arka plan rengi
  - Metin rengi
- 🖼️ **Banner Yönetimi**:
  - Banner görseli yükleme
  - Başlık metni
  - Açıklama metni
  - Buton metni
  - Buton bağlantısı
  - Tam genişlik ayarı (2752x1536 oran)
- 📝 **Footer Düzenleme**:
  - Açıklama metni
  - İletişim bilgileri (telefon, email, adres)
  - Telif hakkı metni

#### 🎁 Marketing Yönetimi
- 🎫 **Kupon Yönetimi**:
  - Tüm kuponları görüntüleme
  - Kupon aktif/pasif yapma
  - Kullanım durumları
- 🎁 **Hoş Geldin İndirimi**:
  - İndirim yüzdesi
  - Geçerlilik süresi
  - Aktif/Pasif
- 👥 **Referans Programı**:
  - İndirim yüzdesi
  - Geçerlilik tarihleri (başlangıç/bitiş)
  - Aktif/Pasif
  - Otomatik kupon oluşturma

#### ⚙️ Genel Ayarlar
- 🔒 **Şifre Koruması**: Admin paneline giriş için şifre gerektirir
- 💾 **Otomatik Kaydetme**: Ayarlar otomatik olarak kaydedilir
- 🔄 **Canlı Önizleme**: Değişiklikler anında uygulanır

## 🛠️ Teknolojiler

### Frontend
- **Next.js 14** - App Router ile React framework
- **TypeScript** - Tip güvenliği
- **Tailwind CSS** - Utility-first CSS framework
- **React Hooks** - Modern React yönetimi

### Backend
- **Next.js API Routes** - Serverless API endpoints
- **Node.js Runtime** - PDF işleme için

### Ödeme ve Dosya Yönetimi
- **PayTR API** - Güvenli ödeme entegrasyonu (iFrame API)
- **pdf-parse** - PDF sayfa sayısı tespiti
- **Vercel Blob Storage** - Production dosya depolama

### Veri Yönetimi
- **JSON Storage** - Local development için
- **Vercel Blob Storage** - Production için
- **JWT** - Session yönetimi

## 🚀 Kurulum

### 1. Bağımlılıkları Yükleyin

```bash
npm install
```

### 2. Ortam Değişkenlerini Yapılandırın

`.env.local` dosyası oluşturun:

```env
# PayTR Configuration
PAYTR_MERCHANT_ID=your_merchant_id
PAYTR_MERCHANT_KEY=your_merchant_key
PAYTR_MERCHANT_SALT=your_merchant_salt
PAYTR_TEST_MODE=1  # Test için 1, Production için 0

# Admin Configuration
ADMIN_PASSWORD=your_admin_password

# JWT Secret (güçlü random string)
JWT_SECRET=your_jwt_secret_key_here

# Application URL
NEXT_PUBLIC_APP_URL=http://localhost:3000  # Local için
# NEXT_PUBLIC_APP_URL=https://www.kopyalagelsin.com  # Production için

# Vercel Blob Storage (Production'da otomatik sağlanır)
# BLOB_READ_WRITE_TOKEN=auto-provided-by-vercel
```

### 3. Geliştirme Sunucusunu Başlatın

```bash
npm run dev
```

Uygulama [http://localhost:3000](http://localhost:3000) adresinde çalışacaktır.

## 📖 Kullanım

### Müşteri Akışı

1. **Ana Sayfa**: Baskı seçeneklerini seçin
   - Baskı ebadı (A4/A3)
   - Renk (Siyah-Beyaz/Renkli)
   - Yön (Tek/Çift)
   - Ciltleme seçeneği
   
2. **PDF Yükleme**: PDF dosyanızı yükleyin
   - Otomatik sayfa sayısı tespiti
   - Maksimum 50 MB
   
3. **Müşteri Bilgileri**: İletişim bilgilerinizi girin
   - Ad Soyad
   - Email
   - Telefon
   - Adres
   - Notlar (opsiyonel)
   
4. **Kupon Kullanımı** (Üyelik gerektirir):
   - Kupon kodu girin
   - Hoş geldin indirimi otomatik uygulanır
   
5. **Fiyat Özeti**: Toplam tutarı kontrol edin
   - Baskı maliyeti
   - Ciltleme maliyeti
   - Kargo ücreti
   - İndirim (varsa)
   - KDV
   - **Toplam**
   
6. **Ödeme**: PayTR ile güvenli ödeme
   - iFrame entegrasyonu
   - Kredi kartı / Banka kartı

### Üyelik Sistemi

- **Üye Olmadan Sipariş**: Müşteriler üye olmadan sipariş verebilir
- **Üye Olarak İndirim**: Üyeler hoş geldin indirimi kazanır
- **Referans Programı**: Arkadaşlarını davet eden üyeler indirim kazanır
- **Hesap Yönetimi**: Üyeler sipariş geçmişlerini görüntüleyebilir

## 🔐 Admin Paneli

### Giriş

1. `/admin` adresine gidin
2. `.env.local` dosyasında belirlediğiniz şifreyi girin
3. Admin paneline erişin

### Siparişler Sekmesi

#### Günlük Görünüm (Varsayılan)
- Bugünün siparişlerini gösterir
- Her gün 00:00'da siparişler arşivlenir

#### Filtreleme Seçenekleri
- **Müşteri Adı/Soyadı**: Ad veya soyad ile arama
- **Sipariş Numarası**: UUID ile arama
- **Tarih Aralığı**: Başlangıç ve bitiş tarihi
- **Belirli Tarih**: Seçilen tarihin siparişleri

#### Sipariş İşlemleri
- 📄 **PDF İndirme**: Sipariş PDF'ini indir
- 👁️ **Sipariş Detayları**: Tüm sipariş bilgilerini görüntüle
  - Müşteri bilgileri
  - Baskı detayları
  - Fiyatlandırma detayları
  - Ödeme durumu
  - Oluşturulma tarihi

### Fiyatlandırma Sekmesi

#### Baskı Fiyatları
- **A4 Siyah-Beyaz**: Sayfa başına fiyat (kademeli)
- **A4 Renkli**: Sayfa başına fiyat (kademeli)
- **A3 Siyah-Beyaz**: Sayfa başına fiyat (kademeli)
- **A3 Renkli**: Sayfa başına fiyat (kademeli)

#### Fiyat Çarpanları
- **Tek Yön Çarpanı**: Tek yönlü baskı çarpanı
- **Çift Yön Çarpanı**: Çift yönlü baskı çarpanı

#### Ciltleme Ücretleri
- **Spiral Cilt**: Temel ücret
  - 220-440 sayfa arası +20₺ (tek cilt için)
  - 440+ sayfa +40₺ (tek cilt için)
- **Amerikan Cilt**: Temel ücret

#### Genel Ayarlar
- **KDV Oranı**: KDV yüzdesi (örn: 0.20 = %20)
- **Kargo Ücreti**: Sabit kargo ücreti
- **Ücretsiz Kargo Eşiği**: Ücretsiz kargo için minimum tutar

### Marketing Sekmesi

#### Hoş Geldin İndirimi
- **Aktif/Pasif**: Özelliği aç/kapat
- **İndirim Yüzdesi**: Yüzde olarak indirim
- **Geçerlilik Süresi (Gün)**: Kuponun geçerli olduğu gün sayısı

#### Referans Programı
- **Aktif/Pasif**: Özelliği aç/kapat
- **İndirim Yüzdesi**: Referans veren kişiye verilecek indirim
- **Geçerlilik Başlangıç**: Program başlangıç tarihi
- **Geçerlilik Bitiş**: Program bitiş tarihi

#### Kupon Yönetimi
- Tüm kuponları listele
- Kupon kodu
- Kupon tipi (WELCOME, REFERRAL, COUPON)
- İndirim yüzdesi
- Kullanım durumu
- Geçerlilik tarihleri
- Aktif/Pasif durumu
- Kupon aktif/pasif yapma butonu

### UI (Kullanıcı Arayüzü) Sekmesi

#### Announcement Bar (Kayar Metin)
- **Aktif**: Özelliği aç/kapat
- **Metin**: Gösterilecek metin
- **Bağlantı URL**: Metne tıklandığında gidilecek URL (opsiyonel)
- **Arka Plan Rengi**: Renk seçici ile
- **Metin Rengi**: Renk seçici ile

#### Banner
- **Görsel Yükleme**: JPG, PNG, WebP formatları (maks. 5MB)
- **Başlık**: Banner başlığı
- **Açıklama**: Banner açıklaması
- **Buton Metni**: Banner buton metni
- **Buton Bağlantısı**: Banner buton URL'i (opsiyonel)
- **Önizleme**: Yüklenen banner görselinin önizlemesi

#### Footer
- **Açıklama**: Footer açıklama metni
- **Telefon**: İletişim telefonu
- **Email**: İletişim email'i
- **Adres**: İletişim adresi
- **Telif Hakkı**: Footer telif hakkı metni

## 💰 Fiyatlandırma

### Fiyatlandırma Mantığı

Fiyatlandırma sayfa sayısına göre kademelidir:

- **0-50 sayfa**: Temel fiyat
- **51-100 sayfa**: İkinci kademe fiyat
- **101-150 sayfa**: Üçüncü kademe fiyat
- **151-200 sayfa**: Dördüncü kademe fiyat
- **201+ sayfa**: Beşinci kademe fiyat

### Özel Fiyat Kuralları

#### Spiral Cilt Özel Fiyatlandırma
- **Cilt sayısı = 1** olmalı
- **220-440 sayfa** arası: +20₺
- **440+ sayfa**: +40₺ (toplam)

### Kargo Ücreti

- **2000 TL ve üzeri**: ÜCRETSİZ KARGO ✅
- **2000 TL altı**: Sabit kargo ücreti (varsayılan: 100 TL)

### KDV Hesaplama

KDV, indirim uygulandıktan sonraki tutara eklenir:

```
Ara Toplam = (Baskı Maliyeti + Ciltleme Maliyeti + Kargo) - İndirim
KDV = Ara Toplam × KDV Oranı
Toplam = Ara Toplam + KDV
```

## 🚢 Deployment

### Vercel Deployment

Detaylı deployment rehberi için:
- **[DEPLOYMENT.md](./DEPLOYMENT.md)** - Genel deployment kılavuzu
- **[PRODUCTION_SETUP.md](./PRODUCTION_SETUP.md)** - Production moduna geçiş rehberi

#### Hızlı Başlangıç

1. **GitHub'a Push**: Projeyi GitHub repository'sine push edin
2. **Vercel Import**: [Vercel Dashboard](https://vercel.com) üzerinden projeyi import edin
3. **Environment Variables**: Tüm environment variable'ları ekleyin
4. **Deploy**: Otomatik deploy başlar

#### Production Environment Variables

```env
PAYTR_MERCHANT_ID=645606
PAYTR_MERCHANT_KEY=5R5XRs2ddX87AoKq
PAYTR_MERCHANT_SALT=P5u4aF4thJLXB9YJ
PAYTR_TEST_MODE=0  # Production için 0
NEXT_PUBLIC_APP_URL=https://www.kopyalagelsin.com
ADMIN_PASSWORD=your_admin_password
JWT_SECRET=your_jwt_secret
BLOB_READ_WRITE_TOKEN=auto-provided-by-vercel
```

### Vercel Blob Storage

Production'da dosya depolama için Vercel Blob Storage kullanılır:

1. Vercel Dashboard → Projeniz → **Storage** sekmesi
2. **"Create Database"** → **"Blob"** seçin
3. Token otomatik olarak `BLOB_READ_WRITE_TOKEN` olarak eklenir

**Depolanan Veriler:**
- PDF dosyaları (`pdfs/` prefix)
- Siparişler JSON (`app-data/orders.json`)
- Kullanıcılar JSON (`app-data/users.json`)
- Kuponlar JSON (`app-data/coupons.json`)
- Konfigürasyon JSON (`app-data/config.json`)

## 📁 Proje Yapısı

```
dijital_web/
├── app/                          # Next.js App Router
│   ├── api/                      # API Routes
│   │   ├── admin/                # Admin API endpoints
│   │   │   ├── orders/           # Sipariş listesi
│   │   │   ├── coupons/          # Kupon yönetimi
│   │   │   └── banner/           # Banner yükleme
│   │   ├── auth/                 # Kimlik doğrulama
│   │   │   ├── login/            # Giriş
│   │   │   ├── register/         # Kayıt
│   │   │   └── me/               # Kullanıcı bilgisi
│   │   ├── paytr/                # PayTR entegrasyonu
│   │   │   ├── init/             # Ödeme başlatma
│   │   │   └── notify/           # Callback (bildirim)
│   │   ├── pdf/                  # PDF işlemleri
│   │   │   ├── upload/           # PDF yükleme
│   │   │   └── pages/            # Sayfa sayısı tespiti
│   │   └── config/               # Konfigürasyon
│   ├── admin/                    # Admin panel sayfası
│   ├── hesabim/                  # Kullanıcı hesap sayfası
│   ├── giris/                    # Giriş sayfası
│   ├── uye-ol/                   # Kayıt sayfası
│   ├── odeme/                    # Ödeme sayfaları
│   │   ├── basarili/             # Başarılı ödeme
│   │   └── hata/                 # Hatalı ödeme
│   ├── kvkk/                     # KVKK sayfası
│   ├── gizlilik-politikasi/      # Gizlilik politikası
│   ├── uyelik-sozlesmesi/        # Üyelik sözleşmesi
│   ├── iade-iptal-politikasi/    # İade/İptal politikası
│   ├── layout.tsx                # Ana layout
│   ├── page.tsx                  # Ana sayfa (sipariş formu)
│   └── globals.css               # Global stiller
├── components/                   # React bileşenleri
│   ├── OrderForm.tsx             # Sipariş formu
│   ├── Navbar.tsx                # Navigasyon çubuğu
│   ├── Footer.tsx                # Footer
│   ├── Hero.tsx                  # Hero banner
│   ├── AnnouncementBar.tsx       # Kayar metin
│   ├── SignupPopup.tsx           # Üyelik pop-up
│   ├── FAQ.tsx                   # Sık sorulan sorular
│   ├── Advantages.tsx            # Avantajlar
│   ├── HowItWorks.tsx            # Nasıl çalışır
│   └── PricingOverview.tsx       # Fiyat özeti
├── lib/                          # Utility fonksiyonları
│   ├── pricing.ts                # Fiyatlandırma mantığı
│   ├── ordersStore.ts            # Sipariş yönetimi
│   ├── usersStore.ts             # Kullanıcı yönetimi
│   ├── couponsStore.ts           # Kupon yönetimi
│   ├── config.ts                 # Konfigürasyon yönetimi
│   ├── paytr.ts                  # PayTR entegrasyonu
│   ├── pdfStorage.ts             # PDF depolama (Vercel Blob)
│   ├── blobStorage.ts            # Genel blob depolama
│   ├── auth.ts                   # Kimlik doğrulama
│   ├── discounts.ts              # İndirim hesaplama
│   └── types.ts                  # TypeScript tipleri
├── data/                         # Local data (development)
│   ├── orders.json               # Siparişler
│   ├── users.json                # Kullanıcılar
│   ├── coupons.json              # Kuponlar
│   └── config.json               # Konfigürasyon
├── public/                       # Statik dosyalar
│   ├── banners/                  # Banner görselleri
│   └── logo/                     # Logo dosyaları
├── DEPLOYMENT.md                 # Deployment kılavuzu
├── PRODUCTION_SETUP.md           # Production moduna geçiş
├── VERCEL_BLOB_MIGRATION.md      # Blob storage migrasyonu
└── package.json                  # Proje bağımlılıkları
```

## 📝 Önemli Notlar

### PayTR Entegrasyonu

- **Test Modu**: `PAYTR_TEST_MODE=1` ile test ödemeleri yapılabilir
- **Production Modu**: `PAYTR_TEST_MODE=0` ile gerçek ödemeler yapılır
- **Callback URL**: PayTR panelinde `https://www.kopyalagelsin.com/api/paytr/notify` ayarlanmalı

### Güvenlik

- Admin paneli şifre korumalıdır
- JWT token ile session yönetimi
- PayTR hash doğrulaması ile güvenli callback
- Environment variable'lar hassas bilgi içerir (`.gitignore`)

### Veri Yönetimi

- **Local Development**: JSON dosyaları kullanılır (`data/` klasörü)
- **Production**: Vercel Blob Storage kullanılır
- Otomatik arşivleme: Her gün 00:00'da siparişler arşivlenir

## 🤝 Katkıda Bulunma

Bu proje özel kullanım için geliştirilmiştir. İletişim için issue açabilirsiniz.

## 📄 Lisans

Bu proje özel kullanım için geliştirilmiştir.

## 🔗 Bağlantılar

- **Canlı Site**: https://www.kopyalagelsin.com
- **Admin Panel**: https://www.kopyalagelsin.com/admin
- **PayTR**: https://www.paytr.com

## 🆘 Destek

Sorun yaşarsanız:
1. Console loglarını kontrol edin
2. Admin panelinde hata mesajlarını kontrol edin
3. Vercel deployment loglarını inceleyin
4. Environment variable'ların doğru ayarlandığını kontrol edin

---

**Geliştirilmiş ve yönetilir by Kopyala Gelsin Team** 🚀
