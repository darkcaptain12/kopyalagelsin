# Dijital Çıktı - Öğrenciler için Uygun Fiyatlı Çıktı Servisi

Next.js 14 ile geliştirilmiş, öğrenciler için uygun fiyatlı dijital çıktı sipariş sistemi. PayTR ödeme entegrasyonu ile çalışır.

## Özellikler

- 📄 PDF yükleme ve otomatik sayfa sayısı tespiti
- 🎨 Esnek baskı seçenekleri (A4/A3, Siyah-Beyaz/Renkli, Tek/Çift Yön)
- 💰 Otomatik fiyat hesaplama (sayfa sayısına göre kademeli fiyatlandırma)
- 📦 Ciltleme seçenekleri (Yok, Spiral, Amerikan)
- 🚚 Ücretsiz kargo (2000 TL üzeri)
- 💳 PayTR ödeme entegrasyonu
- 🔐 Admin paneli (şifre korumalı)
- 📊 Sipariş yönetimi
- 👤 Üyelik sistemi (kayıt, giriş, hesap yönetimi)
- 🎫 Kupon sistemi (tek kullanımlık, KOPYALAGELSİN formatında)
- 🎁 Hoş geldin indirimi (yeni üyelere otomatik kupon)
- 👥 Referans programı (arkadaşını davet et, indirim kazan)
- 🎯 Üyeliksiz sipariş desteği (guest checkout)
- 📢 Üyelik pop-up'ı (yapılandırılabilir)

## Teknolojiler

- **Next.js 14** (App Router)
- **TypeScript**
- **Tailwind CSS**
- **PayTR** (Ödeme API)
- **pdf-parse** (PDF sayfa sayısı tespiti)

## Kurulum

### 1. Bağımlılıkları Yükleyin

```bash
npm install
```

### 2. Ortam Değişkenlerini Yapılandırın

`.env.local` dosyası oluşturun ve aşağıdaki değişkenleri doldurun:

```env
# PayTR Configuration
PAYTR_MERCHANT_ID=your_merchant_id
PAYTR_MERCHANT_KEY=your_merchant_key
PAYTR_MERCHANT_SALT=your_merchant_salt
PAYTR_MERCHANT_EMAIL=your_email@example.com
PAYTR_TEST_MODE=1

# Admin Configuration
ADMIN_PASSWORD=your_admin_password

# JWT Secret for session management
JWT_SECRET=your_jwt_secret_key_here_here

# Next.js Configuration (production için)
NEXT_PUBLIC_APP_URL=https://yourdomain.com
```

### 3. Gerekli Dizinleri Oluşturun

Uygulama otomatik olarak `data/` ve `uploads/` dizinlerini oluşturur. Ancak manuel olarak da oluşturabilirsiniz:

```bash
mkdir -p data uploads
```

### 4. Geliştirme Sunucusunu Başlatın

```bash
npm run dev
```

Uygulama [http://localhost:3000](http://localhost:3000) adresinde çalışacaktır.

## PayTR Entegrasyonu

### Test Modu

Test modunu aktif etmek için `.env.local` dosyasında:

```env
PAYTR_TEST_MODE=1
```

### Canlı Mod

Canlı moda geçmek için:

```env
PAYTR_TEST_MODE=0
```

### PayTR Hesap Bilgileri

PayTR hesap bilgilerinizi almak için [PayTR](https://www.paytr.com) üzerinden kayıt olun ve API bilgilerinizi alın.

## Kullanım

### Sipariş Verme

1. Ana sayfada baskı seçeneklerini seçin:
   - Baskı Ebadı (A4/A3)
   - Baskı Rengi (Siyah-Beyaz/Renkli)
   - Baskı Yönü (Tek/Çift Yön)
   - Ciltleme (Yok/Spiral/Amerikan)
   - Sayfa Sayısı

2. PDF dosyanızı yükleyin (otomatik sayfa sayısı tespiti yapılır)

3. Müşteri bilgilerinizi girin

4. Fiyat özetini kontrol edin

5. Ödemeye geçin

### Admin Paneli

Admin paneline erişmek için `/admin` adresine gidin ve `.env.local` dosyasında belirlediğiniz şifreyi girin.

Admin panelinde:
- Tüm siparişleri görüntüleyebilirsiniz
- Sipariş durumlarını kontrol edebilirsiniz
- PDF dosyalarını indirebilirsiniz

## Fiyatlandırma

Fiyatlandırma mantığı `lib/pricing.ts` dosyasında tanımlanmıştır. Sayfa sayısına göre kademeli fiyatlandırma uygulanır:

- 0-50 sayfa
- 51-100 sayfa
- 101-150 sayfa
- 151-200 sayfa
- 201+ sayfa

Detaylı fiyat tablosu için `lib/pricing.ts` dosyasına bakın.

### Kargo Ücreti

- 2000 TL ve üzeri siparişlerde **ÜCRETSİZ KARGO**
- 2000 TL altı siparişlerde **100 TL** kargo ücreti

## Veri Depolama

Siparişler `data/orders.json` dosyasında JSON formatında saklanır. PDF dosyaları `uploads/` dizininde saklanır.

## Deployment

### Vercel'e Deploy

1. Projeyi GitHub'a push edin
2. [Vercel](https://vercel.com) üzerinden projeyi import edin
3. Ortam değişkenlerini Vercel dashboard'dan ekleyin
4. Deploy edin

### Ortam Değişkenleri (Production)

Vercel'de aşağıdaki ortam değişkenlerini ayarlayın:

- `PAYTR_MERCHANT_ID`
- `PAYTR_MERCHANT_KEY`
- `PAYTR_MERCHANT_SALT`
- `PAYTR_MERCHANT_EMAIL`
- `PAYTR_TEST_MODE` (0 veya 1)
- `ADMIN_PASSWORD`
- `NEXT_PUBLIC_APP_URL` (ör: https://yourdomain.com)

### Dosya Depolama

**Önemli**: Vercel'de serverless fonksiyonlar kullanıldığı için, dosya sistemi kalıcı değildir. Production ortamında:

1. **Önerilen**: PDF dosyaları için bir object storage servisi kullanın (AWS S3, Cloudinary, vb.)
2. **Alternatif**: Vercel Blob Storage kullanın
3. Siparişler için bir veritabanı kullanmayı düşünün (PostgreSQL, MongoDB, vb.)

Bu proje basitlik için JSON dosya depolaması kullanmaktadır. Production ortamında bu yapıyı değiştirmeniz gerekebilir.

## Proje Yapısı

```
dijital_web/
├── app/
│   ├── api/
│   │   ├── admin/          # Admin API routes
│   │   ├── orders/         # Order API routes
│   │   ├── pdf/            # PDF upload & page detection
│   │   └── paytr/          # PayTR payment integration
│   ├── admin/              # Admin panel page
│   ├── success/            # Payment success page
│   ├── layout.tsx
│   ├── page.tsx            # Main order form
│   └── globals.css
├── lib/
│   ├── pricing.ts          # Price calculation logic
│   ├── ordersStore.ts      # Order storage utilities
│   └── types.ts            # TypeScript types
├── data/                   # JSON order storage
├── uploads/                # Uploaded PDF files
└── package.json
```

## Lisans

Bu proje özel kullanım için geliştirilmiştir.

