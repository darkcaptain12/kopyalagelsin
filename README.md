# 🖨️ Kopyala Gelsin - Dijital Çıktı Sipariş Sistemi

**Next.js 14** ile geliştirilmiş, öğrenciler için uygun fiyatlı dijital çıktı sipariş sistemi. PayTR ödeme entegrasyonu, kapsamlı admin paneli ve dinamik içerik yönetimi ile profesyonel bir e-ticaret çözümü.

![Next.js](https://img.shields.io/badge/Next.js-14-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.0-38bdf8)

---

## 📖 Site Hakkında

**Kopyala Gelsin**, öğrenciler ve küçük işletmeler için hızlı, güvenli ve uygun fiyatlı dijital çıktı hizmeti sunan modern bir web uygulamasıdır. Kullanıcılar PDF dosyalarını yükleyerek, çeşitli baskı seçenekleri arasından seçim yaparak ve online ödeme yaparak siparişlerini oluşturabilirler.

### 🎯 Temel Özellikler

- ✅ **Üyeliksiz Sipariş**: Müşteriler üye olmadan sipariş verebilir
- ✅ **Üyelik Avantajları**: Üyeler hoş geldin indirimi ve referans programından yararlanabilir
- ✅ **Otomatik Fiyat Hesaplama**: Sayfa sayısına göre kademeli fiyatlandırma
- ✅ **Güvenli Ödeme**: PayTR iFrame API ile güvenli ödeme sistemi
- ✅ **Kapsamlı Admin Paneli**: Tüm işlemleri tek panelden yönetin
- ✅ **Dinamik İçerik Yönetimi**: Banner, footer ve kayar metin panelden düzenlenebilir
- ✅ **Otomatik Arşivleme**: Günlük siparişler otomatik olarak arşivlenir
- ✅ **Vercel Blob Storage**: Production'da güvenli dosya depolama

---

## 🏠 Site Yapısı ve Sayfalar

### Ana Sayfa (`/`)

Ana sayfa aşağıdaki bölümlerden oluşur:

#### 1. **Announcement Bar (Kayar Metin)**
- Üst kısımda kayar metin
- Admin panelden aktif/pasif yapılabilir
- Renk ve içerik özelleştirilebilir

#### 2. **Navbar (Üst Menü)**
- Logo (kopyalagelsin.png)
- Menü linkleri: Anasayfa, Nasıl Çalışır?, Sık Sorulan Sorular, İletişim
- Üye girişi / Üye ol butonları
- Giriş yapmış kullanıcılar için: Kullanıcı adı dropdown (Hesabım, Çıkış)
- Sipariş Ver butonu

#### 3. **Hero Banner Bölümü**
- Dinamik banner görseli (2752x1536 oran)
- Başlık, açıklama ve buton metinleri
- Admin panelden düzenlenebilir
- Tam genişlik banner görünümü

#### 4. **Nasıl Çalışır? Bölümü**
4 adımlı süreç açıklaması:
- 📄 **PDF Yükle**: Otomatik sayfa sayısı tespiti
- ⚙️ **Seçenekleri Belirle**: Baskı ayarlarını seç
- 💳 **Online Ödeme Yap**: PayTR ile güvenli ödeme
- 📦 **Kargo ile Teslim**: Siparişiniz adresinize gelsin

#### 5. **Avantajlar Bölümü**
Site avantajlarının listelendiği bölüm

#### 6. **Sık Sorulan Sorular (FAQ)**
Yaygın sorular ve cevapları

#### 7. **Sipariş Formu Bölümü**
Detaylı sipariş oluşturma formu:
- **Baskı Seçenekleri**:
  - Baskı Ebadı: A4 / A3 (görsel kartlar)
  - Baskı Rengi: Siyah-Beyaz / Renkli (görsel kartlar)
  - Baskı Yönü: Tek Yön / Çift Yön (özel PNG görseller: tek_yön.png, çift_yön.png)
  - Ciltleme Tipi: Yok / Spiral / Amerikan (özel görseller gösterilir)
  - Cilt Sayısı (ciltleme seçildiğinde)
- **Sayfa Sayısı**: Manuel giriş veya PDF'den otomatik tespit
- **PDF Yükleme**: Drag & drop veya dosya seçme
- **Kupon Kullanımı**: Üyeler kupon kodlarını kullanabilir
- **Müşteri Bilgileri**: Ad, email, telefon, adres, notlar
- **Canlı Fiyat Hesaplama**: Sağ tarafta anlık fiyat özeti
  - Baskı ücreti
  - Ciltleme ücreti
  - Kargo ücreti
  - Ara toplam
  - İndirim (varsa)
  - KDV
  - **Genel Toplam**
  - Seçilen cilt tipine göre ürün görseli (Spiral/Amerikan)

#### 8. **Footer**
- Site açıklaması
- İletişim bilgileri (telefon, email, adres)
- Yasal linkler (KVKK, Üyelik Sözleşmesi, Gizlilik Politikası, İade/İptal Politikası)
- Telif hakkı
- Admin panelden düzenlenebilir

#### 9. **Üyelik Pop-up**
- Yeni ziyaretçilere gösterilir
- Admin panelden aktif/pasif yapılabilir
- Hoş geldin indirimi bilgisi

---

## 📄 Diğer Sayfalar

### Kullanıcı Sayfaları

#### `/giris` - Giriş Sayfası
- Email ve şifre ile giriş
- Referans kodu ile kayıt linki (varsa)

#### `/uye-ol` - Kayıt Sayfası
- İsim, email, şifre ile kayıt
- Referans kodu desteği
- Hoş geldin kuponu otomatik oluşturulur

#### `/hesabim` - Hesap Sayfası
- Kullanıcı bilgileri
- Sipariş geçmişi
- Aktif kuponlar
- Referans kodu ve davet linki

#### `/odeme/basarili` - Başarılı Ödeme
- Ödeme başarılı mesajı
- Sipariş detayları

#### `/odeme/hata` - Hatalı Ödeme
- Ödeme hata mesajı
- Tekrar deneme önerisi

### Yasal Sayfalar

#### `/kvkk` - KVKK Aydınlatma Metni
Kişisel verilerin korunması hakkında bilgilendirme

#### `/gizlilik-politikasi` - Gizlilik Politikası
Gizlilik ve veri kullanımı politikaları

#### `/uyelik-sozlesmesi` - Üyelik Sözleşmesi
Üyelik şartları ve koşulları

#### `/iade-iptal-politikasi` - İade ve İptal Politikası
İade ve iptal işlemleri hakkında bilgiler

---

## 🔐 Admin Paneli (`/admin`)

Admin paneli şifre korumalıdır ve 4 ana sekmeden oluşur:

### 1. 📊 Siparişler Sekmesi

#### Görünüm Seçenekleri
- **Bugün**: Günün siparişleri (varsayılan)
- **Tümü**: Tüm siparişler
- **Arşiv**: Geçmiş günlerin siparişleri

#### Filtreleme Özellikleri
- **Müşteri Adı/Soyadı**: Ad veya soyad ile arama
- **Sipariş Numarası**: UUID ile arama
- **Tarih Aralığı**: Başlangıç ve bitiş tarihi
- **Belirli Tarih**: Seçilen tarihin siparişleri

#### Sipariş Tablosu
Her sipariş için gösterilen bilgiler:
- Sipariş No (UUID)
- Tarih
- Müşteri Adı
- E-posta
- Toplam Tutar
- Durum (Bekliyor/Ödendi/Başarısız)
- PDF İndirme butonu

#### Sipariş Detayları
Modal veya genişletilmiş görünüm:
- Müşteri bilgileri (ad, email, telefon, adres)
- Baskı detayları (ebat, renk, yön, ciltleme, sayfa sayısı)
- Fiyatlandırma detayları (baskı, ciltleme, kargo, indirim, KDV, toplam)
- Ödeme durumu
- PDF URL (Vercel Blob Storage'dan)
- Notlar

#### Otomatik Arşivleme
- Her gün 00:00'da o günün siparişleri arşivlenir
- Arşivlenen siparişler tarih filtresi ile görüntülenebilir
- Siparişler silinmez, sadece arşive alınır

### 2. 💰 Fiyatlandırma Sekmesi

#### Baskı Fiyatları (Sayfa Başına)
Her kategori için 5 kademeli fiyatlandırma:
- **A4 Siyah-Beyaz**:
  - 0-50 sayfa
  - 51-100 sayfa
  - 101-150 sayfa
  - 151-200 sayfa
  - 201+ sayfa
- **A4 Renkli**: Aynı kademeler
- **A3 Siyah-Beyaz**: Aynı kademeler
- **A3 Renkli**: Aynı kademeler

#### Fiyat Çarpanları
- **Tek Yön Çarpanı**: Tek yönlü baskı için çarpan (örn: 1.0)
- **Çift Yön Çarpanı**: Çift yönlü baskı için çarpan (örn: 1.2)

#### Ciltleme Ücretleri
- **Spiral Cilt**: Temel ücret
  - Özel kurallar:
    - 220-440 sayfa arası +20₺ (sadece tek cilt için)
    - 440+ sayfa +40₺ (sadece tek cilt için)
- **Amerikan Cilt**: Temel ücret

#### Genel Ayarlar
- **KDV Oranı**: KDV yüzdesi (örn: 0.20 = %20)
- **Kargo Ücreti**: Sabit kargo ücreti (varsayılan: 100 TL)
- **Ücretsiz Kargo Eşiği**: Ücretsiz kargo için minimum tutar (varsayılan: 2000 TL)

### 3. 🎁 Marketing Sekmesi

#### Hoş Geldin İndirimi
- **Aktif/Pasif**: Özelliği aç/kapat
- **İndirim Yüzdesi**: Yeni üyelere verilecek indirim yüzdesi
- **Geçerlilik Süresi (Gün)**: Kuponun geçerli olduğu gün sayısı

#### Referans Programı
- **Aktif/Pasif**: Programı aç/kapat
- **İndirim Yüzdesi**: Referans veren kişiye verilecek indirim yüzdesi
- **Geçerlilik Başlangıç**: Program başlangıç tarihi
- **Geçerlilik Bitiş**: Program bitiş tarihi
- **Otomatik Kupon Oluşturma**: 
  - Üye arkadaşını davet eder (referans kodu ile kayıt)
  - Davet edilen kişi ilk siparişini öder
  - Referans veren kişiye otomatik kupon oluşturulur

#### Kupon Yönetimi
Tüm kuponların listelendiği tablo:
- **Kupon Kodu**: Benzersiz kupon kodu (KOPYALAGELSIN formatında)
- **Tip**: WELCOME (Hoş Geldin) / REFERRAL (Referans) / COUPON (Manuel)
- **İndirim Yüzdesi**: Kupon indirim yüzdesi
- **Kullanım Durumu**: Kullanıldı / Kullanılmadı
- **Geçerlilik Tarihleri**: Başlangıç ve bitiş tarihleri
- **Aktif/Pasif Durumu**: Toggle butonu ile değiştirilebilir

### 4. 🎨 UI (Kullanıcı Arayüzü) Sekmesi

#### Announcement Bar (Kayar Metin)
- **Aktif**: Özelliği aç/kapat
- **Metin**: Gösterilecek metin içeriği
- **Bağlantı URL**: Metne tıklandığında gidilecek URL (opsiyonel)
- **Arka Plan Rengi**: Renk seçici ile belirlenir
- **Metin Rengi**: Renk seçici ile belirlenir

#### Banner Yönetimi
- **Görsel Yükleme**: 
  - JPG, PNG, WebP formatları
  - Maksimum 5MB
  - Otomatik Vercel Blob Storage'a yüklenir
- **Başlık**: Banner başlık metni
- **Açıklama**: Banner açıklama metni
- **Buton Metni**: Banner buton metni
- **Buton Bağlantısı**: Banner buton URL'i (opsiyonel)
- **Görsel Önizleme**: Yüklenen banner görselinin önizlemesi
- **Aspect Ratio**: 2752x1536 oranında tam genişlik banner

#### Footer Düzenleme
- **Açıklama**: Footer açıklama metni
- **Telefon**: İletişim telefonu
- **Email**: İletişim email adresi
- **Adres**: İletişim adresi
- **Telif Hakkı**: Footer telif hakkı metni (HTML desteği)

---

## 🛒 Müşteri Akışı (Sipariş Verme Süreci)

### 1. Ana Sayfa İnceleme
- Kullanıcı ana sayfayı ziyaret eder
- "Nasıl Çalışır?" bölümünü okur
- Avantajları inceler
- FAQ'leri kontrol eder

### 2. Sipariş Formunu Doldurma

#### A. Baskı Seçenekleri
- **Baskı Ebadı**: A4 veya A3 seçilir
- **Baskı Rengi**: Siyah-Beyaz veya Renkli seçilir
- **Baskı Yönü**: Tek Yön veya Çift Yön seçilir (görsel iconlarla)
- **Ciltleme**: Yok, Spiral veya Amerikan seçilir
  - Ciltleme seçildiğinde cilt sayısı girilir
  - Seçilen cilt tipine göre ürün görseli gösterilir

#### B. Sayfa Sayısı
- Manuel olarak girilebilir
- VEYA PDF yüklendiğinde otomatik tespit edilir
- "Buraya Aktar" butonu ile otomatik tespit edilen sayfa sayısı forma aktarılır

#### C. PDF Yükleme
- Drag & drop veya dosya seçme
- Maksimum 50MB
- Otomatik sayfa sayısı tespiti
- Vercel Blob Storage'a yüklenir
- Public URL alınır

### 3. Üyelik Durumu

#### Üye Olmadan Sipariş
- Müşteri bilgileri girilir
- Sipariş verilir
- İndirim kullanılamaz

#### Üye Olarak Sipariş
- Üye girişi yapılır
- Kupon seçilebilir (varsa)
- Hoş geldin indirimi otomatik uygulanır (ilk sipariş için)
- Referans kuponu kullanılabilir (varsa)

### 4. Fiyat Hesaplama

Fiyat şu şekilde hesaplanır:

1. **Baskı Maliyeti**:
   - Sayfa sayısına göre kademeli fiyat
   - A3 için çarpan uygulanır
   - Çift yön için çarpan uygulanır

2. **Ciltleme Maliyeti**:
   - Seçilen cilt tipi × cilt sayısı
   - Spiral cilt için özel kurallar:
     - Cilt sayısı = 1 ise:
       - 220-440 sayfa arası: +20₺
       - 440+ sayfa: +40₺

3. **Kargo Ücreti**:
   - Ara toplam ≥ Ücretsiz kargo eşiği ise: 0 TL
   - Ara toplam < Ücretsiz kargo eşiği ise: Sabit kargo ücreti

4. **İndirim** (varsa):
   - Üye hoş geldin indirimi
   - VEYA kupon indirimi
   - VEYA referans indirimi
   - İndirim yüzde olarak uygulanır

5. **KDV**:
   - İndirim sonrası tutar × KDV oranı

6. **Toplam**:
   - Ara toplam + KDV

### 5. Ödeme

- PayTR iFrame API ile güvenli ödeme
- Kredi kartı / Banka kartı ile ödeme
- Ödeme başarılı/hata sayfalarına yönlendirme
- PayTR callback ile sipariş durumu güncellenir

---

## 👤 Üyelik Sistemi

### Üye Olmadan Sipariş
- Müşteriler üye olmadan sipariş verebilir
- Sadece iletişim bilgileri yeterlidir
- İndirim avantajlarından yararlanamaz

### Üye Olarak Avantajlar
- **Hoş Geldin İndirimi**: İlk sipariş için otomatik kupon
- **Kupon Kullanımı**: Aktif kuponları kullanabilme
- **Referans Programı**: Arkadaşlarını davet et, indirim kazan
- **Sipariş Geçmişi**: Tüm siparişlerini görüntüleme

### Referans Programı
1. Üye referans kodunu alır
2. Arkadaşına referans linkini gönderir
3. Arkadaş referans kodu ile kayıt olur
4. Arkadaş ilk siparişini öder
5. Referans veren üyeye otomatik kupon oluşturulur

---

## 💳 PayTR Ödeme Entegrasyonu

### Ödeme Akışı

1. **Sipariş Oluşturma**:
   - Frontend'de sipariş formu doldurulur
   - PDF yüklenir (Vercel Blob Storage'a)
   - Backend'de sipariş kaydedilir (pending durumunda)
   - PayTR token isteği yapılır

2. **PayTR Token Oluşturma**:
   - HMAC-SHA256 hash hesaplama (resmi PayTR formatı)
   - Hash string: merchant_id + user_ip + merchant_oid + email + payment_amount + user_basket + no_installment + max_installment + currency + test_mode + merchant_salt
   - PayTR API'ye POST isteği
   - Token alınır

3. **Ödeme Sayfası**:
   - PayTR iFrame açılır
   - Kullanıcı ödeme yapar
   - Ödeme sonucu PayTR tarafından bildirilir

4. **Callback İşlemi**:
   - PayTR `/api/paytr/notify` endpoint'ine POST ister
   - Hash doğrulaması yapılır
   - Sipariş durumu güncellenir (paid/failed)
   - Kupon kullanım sayısı artırılır
   - Referans kuponu oluşturulur (gerekirse)
   - PayTR'ye "OK" yanıtı dönülür

5. **Yönlendirme**:
   - Başarılı ödeme → `/odeme/basarili`
   - Hatalı ödeme → `/odeme/hata`

### Güvenlik
- Hash doğrulaması ile callback güvenliği
- JWT token ile session yönetimi
- Environment variable'lar ile hassas bilgi koruması

---

## 📁 Dosya Yönetimi

### Local Development
- PDF'ler: `uploads/` klasörü
- Veriler: `data/` klasörü (JSON dosyaları)
  - `orders.json`: Siparişler
  - `users.json`: Kullanıcılar
  - `coupons.json`: Kuponlar
  - `config.json`: Konfigürasyon

### Production (Vercel)
- **Vercel Blob Storage** kullanılır
- PDF'ler: `pdfs/` prefix ile saklanır
- Veriler: `app-data/` prefix ile saklanır
- Tüm dosyalar public URL ile erişilebilir
- `BLOB_READ_WRITE_TOKEN` environment variable gerekli

---

## 🎨 Görsel Dosyaları

### Logo
- **Site Logo**: `/public/logo/kopyalagelsin.png` (Navbar'da)
- **Favicon**: `/public/logo/favicon.png` (Tarayıcı sekmesinde)

### Ürün Görselleri
- **Spiral Cilt**: `/public/urun_tipleri/tel.png` (Ciltleme seçildiğinde, fiyat altında)
- **Amerikan Cilt**: `/public/urun_tipleri/amerikan.png` (Ciltleme seçildiğinde, fiyat altında)
- **Tek Yön**: `/public/urun_tipleri/tek_yön.png` (Baskı yönü seçiminde)
- **Çift Yön**: `/public/urun_tipleri/çift_yön.png` (Baskı yönü seçiminde)

### Banner Görselleri
- Admin panelden yüklenir
- Vercel Blob Storage'da saklanır
- Hero bölümünde gösterilir

---

## 🛠️ Teknolojiler

### Frontend
- **Next.js 14** (App Router) - React framework
- **TypeScript** - Tip güvenliği
- **Tailwind CSS** - Utility-first CSS framework
- **React Hooks** - Modern state yönetimi
- **Next.js Image** - Optimize edilmiş görsel yönetimi

### Backend
- **Next.js API Routes** - Serverless API endpoints
- **Node.js Runtime** - PDF işleme için
- **pdf-parse** - PDF sayfa sayısı tespiti
- **bcryptjs** - Şifre hash'leme
- **jsonwebtoken** - JWT token yönetimi

### Ödeme
- **PayTR iFrame API** - Güvenli ödeme entegrasyonu
- **HMAC-SHA256** - Hash doğrulama
- **Resmi PayTR Node.js Formatı** - Dokümantasyona uygun entegrasyon

### Veri Depolama
- **Local Development**: JSON dosyaları (`data/` klasörü)
- **Production**: Vercel Blob Storage
  - PDF dosyaları
  - Siparişler, kullanıcılar, kuponlar, config
- **Otomatik Geçiş**: Vercel ortamında otomatik olarak Blob Storage kullanılır

---

## 🚀 Kurulum ve Kullanım

### Gereksinimler
- Node.js 18+ 
- npm veya yarn
- PayTR merchant hesabı
- Vercel hesabı (production için)

### Kurulum Adımları

1. **Bağımlılıkları Yükleyin**:
   ```bash
   npm install
   ```

2. **Environment Variables**:
   `.env.local` dosyası oluşturun:
   ```env
   # PayTR
   PAYTR_MERCHANT_ID=645606
   PAYTR_MERCHANT_KEY=5R5XRs2ddX87AoKq
   PAYTR_MERCHANT_SALT=P5u4aF4thJLXB9YJ
   PAYTR_TEST_MODE=1  # Test: 1, Production: 0
   
   # Admin
   ADMIN_PASSWORD=Utax1453!?
   
   # JWT
   JWT_SECRET=your_strong_random_secret_here
   
   # App URL
   NEXT_PUBLIC_APP_URL=http://localhost:3000
   ```

3. **Development Server Başlatın**:
   ```bash
   npm run dev
   ```

4. **Production Build**:
   ```bash
   npm run build
   npm start
   ```

---

## 📊 Veri Yapısı

### Sipariş (Order)
```typescript
{
  id: string;                    // UUID
  userId: string | null;         // Üye ID (guest ise null)
  customerName: string;
  email: string;
  phone: string;
  address: string;
  notes: string;
  
  // Baskı Detayları
  size: "A4" | "A3";
  color: "siyah_beyaz" | "renkli";
  side: "tek" | "cift";
  bindingType: "none" | "spiral" | "american";
  ciltCount: number;
  pageCount: number;
  
  // PDF Bilgileri
  pdfUrl: string;                // Vercel Blob URL
  pdfName?: string;
  pdfSize?: number;
  
  // Fiyatlandırma
  printCost: number;
  bindingCost: number;
  shippingCost: number;
  subtotal: number;
  discountPercent?: number;
  discountAmount?: number;
  appliedCouponCode?: string;
  tax: number;
  totalAmount: number;
  
  // Ödeme
  paytrStatus: "pending" | "paid" | "failed";
  paytrMerchantOid?: string;
  
  createdAt: string;             // ISO date string
}
```

### Kullanıcı (User)
```typescript
{
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  referralCode: string;          // Benzersiz referans kodu
  referredByUserId?: string;     // Davet eden kullanıcı ID
  createdAt: string;
}
```

### Kupon (Coupon)
```typescript
{
  id: string;
  code: string;                  // KOPYALAGELSIN formatında
  type: "WELCOME" | "REFERRAL" | "COUPON";
  userId: string;
  discountPercent: number;
  used: boolean;
  validFrom: string;
  validUntil: string | null;
  createdAt: string;
}
```

---

## 🎯 Özel Özellikler

### 1. Otomatik Sayfa Sayısı Tespiti
- PDF yüklendiğinde otomatik olarak sayfa sayısı tespit edilir
- `pdf-parse` kütüphanesi kullanılır
- Kullanıcı manuel olarak da girebilir

### 2. Canlı Fiyat Hesaplama
- Form değiştiğinde anında fiyat güncellenir
- Backend'de de doğrulama yapılır
- Frontend ve backend fiyatları eşleşmelidir

### 3. Spiral Cilt Özel Fiyatlandırma
- Sadece tek cilt seçildiğinde geçerli
- 220-440 sayfa arası: +20₺
- 440+ sayfa: +40₺

### 4. Ücretsiz Kargo
- Varsayılan eşik: 2000 TL
- Admin panelden değiştirilebilir
- Ara toplam (indirim öncesi) eşiğe göre kontrol edilir

### 5. Otomatik Arşivleme
- Her gün 00:00'da o günün siparişleri arşive alınır
- Siparişler silinmez
- Tarih filtresi ile arşiv görüntülenebilir

---

## 🔒 Güvenlik

### Admin Panel
- Şifre korumalı (`ADMIN_PASSWORD`)
- SessionStorage ile oturum yönetimi
- Şifre environment variable'dan okunur

### Kullanıcı Güvenliği
- Şifreler bcryptjs ile hash'lenir
- JWT token ile session yönetimi
- HTTP-only cookie (opsiyonel)

### PayTR Güvenliği
- HMAC-SHA256 hash doğrulaması
- Callback URL hash kontrolü
- Merchant bilgileri environment variable'da

### Veri Güvenliği
- Environment variable'lar `.gitignore`'da
- Sensitive data şifrelenmiş
- Vercel Blob Storage güvenli erişim

---

## 🚢 Deployment

### Vercel Deployment

Detaylı rehberler:
- **[DEPLOYMENT.md](./DEPLOYMENT.md)** - Genel deployment kılavuzu
- **[PRODUCTION_SETUP.md](./PRODUCTION_SETUP.md)** - Production moduna geçiş

#### Hızlı Adımlar

1. **GitHub Repository**: Projeyi GitHub'a push edin
2. **Vercel Import**: Vercel Dashboard'dan projeyi import edin
3. **Environment Variables**: Tüm değişkenleri ekleyin
4. **Vercel Blob Storage**: Storage sekmesinden Blob oluşturun
5. **Deploy**: Otomatik deploy başlar

#### Production Environment Variables

```env
PAYTR_MERCHANT_ID=645606
PAYTR_MERCHANT_KEY=5R5XRs2ddX87AoKq
PAYTR_MERCHANT_SALT=P5u4aF4thJLXB9YJ
PAYTR_TEST_MODE=0
NEXT_PUBLIC_APP_URL=https://www.kopyalagelsin.com
ADMIN_PASSWORD=Utax1453!?
JWT_SECRET=your_strong_secret_here
BLOB_READ_WRITE_TOKEN=auto-provided-by-vercel
```

---

## 📁 Proje Yapısı

```
dijital_web/
├── app/                          # Next.js App Router
│   ├── api/                      # API Routes
│   │   ├── admin/                # Admin API endpoints
│   │   │   ├── orders/           # Sipariş listesi (filtreleme)
│   │   │   ├── coupons/          # Kupon yönetimi
│   │   │   ├── login/            # Admin girişi
│   │   │   └── banner/upload/    # Banner yükleme
│   │   ├── auth/                 # Kimlik doğrulama
│   │   │   ├── login/            # Kullanıcı girişi
│   │   │   ├── register/         # Kullanıcı kaydı
│   │   │   ├── logout/           # Çıkış
│   │   │   └── me/               # Kullanıcı bilgisi
│   │   ├── paytr/                # PayTR entegrasyonu
│   │   │   ├── init/             # Ödeme başlatma (token)
│   │   │   └── notify/           # Callback (bildirim)
│   │   ├── pdf/                  # PDF işlemleri
│   │   │   ├── upload/           # PDF yükleme (Blob Storage)
│   │   │   └── pages/            # Sayfa sayısı tespiti
│   │   ├── config/               # Konfigürasyon API
│   │   ├── orders/[orderId]/     # Sipariş detayı
│   │   └── users/[userId]/       # Kullanıcı siparişleri/kuponları
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
│   ├── layout.tsx                # Root layout
│   ├── page.tsx                  # Ana sayfa
│   └── globals.css               # Global stiller
├── components/                   # React bileşenleri
│   ├── OrderForm.tsx             # Sipariş formu (ana form)
│   ├── Navbar.tsx                # Üst menü (logo, menü, kullanıcı)
│   ├── Footer.tsx                # Alt bilgi (dinamik)
│   ├── Hero.tsx                  # Hero banner (dinamik)
│   ├── AnnouncementBar.tsx       # Kayar metin (dinamik)
│   ├── SignupPopup.tsx           # Üyelik pop-up
│   ├── FAQ.tsx                   # Sık sorulan sorular
│   ├── Advantages.tsx            # Avantajlar
│   ├── HowItWorks.tsx            # Nasıl çalışır
│   └── PricingOverview.tsx       # Fiyat tablosu
├── lib/                          # Utility fonksiyonları
│   ├── pricing.ts                # Fiyatlandırma mantığı
│   ├── ordersStore.ts            # Sipariş CRUD (Blob Storage)
│   ├── usersStore.ts             # Kullanıcı CRUD
│   ├── couponsStore.ts           # Kupon CRUD
│   ├── config.ts                 # Konfigürasyon yönetimi
│   ├── paytr.ts                  # PayTR helper (hash, token)
│   ├── pdfStorage.ts             # PDF yükleme (Vercel Blob)
│   ├── blobStorage.ts            # Genel JSON blob işlemleri
│   ├── auth.ts                   # JWT token yönetimi
│   ├── discounts.ts              # İndirim hesaplama
│   └── types.ts                  # TypeScript tipleri
├── public/                       # Statik dosyalar
│   ├── logo/                     # Logo dosyaları
│   │   ├── kopyalagelsin.png     # Site logosu
│   │   └── favicon.png           # Favicon
│   ├── urun_tipleri/             # Ürün görselleri
│   │   ├── tek_yön.png           # Tek yön icon
│   │   ├── çift_yön.png          # Çift yön icon
│   │   ├── tel.png               # Spiral cilt görseli
│   │   └── amerikan.png          # Amerikan cilt görseli
│   └── banners/                  # Banner görselleri (admin'den yüklenir)
├── data/                         # Local development verileri
│   ├── orders.json               # Siparişler
│   ├── users.json                # Kullanıcılar
│   ├── coupons.json              # Kuponlar
│   └── config.json               # Konfigürasyon
├── .env.local                    # Environment variables (gitignore)
├── DEPLOYMENT.md                 # Deployment kılavuzu
├── PRODUCTION_SETUP.md           # Production geçiş rehberi
├── VERCEL_BLOB_MIGRATION.md      # Blob storage dokümantasyonu
└── package.json                  # Proje bağımlılıkları
```

---

## 📝 Önemli Notlar

### PayTR Entegrasyonu

- **Test Modu**: `PAYTR_TEST_MODE=1` ile test ödemeleri
- **Production Modu**: `PAYTR_TEST_MODE=0` ile gerçek ödemeler
- **Callback URL**: PayTR panelinde `https://www.kopyalagelsin.com/api/paytr/notify` ayarlanmalı
- **Hash Formatı**: Resmi PayTR Node.js dokümantasyonuna uygun HMAC-SHA256
- **Bildirim URL**: Mutlaka ayarlanmalı (callback için)

### Vercel Blob Storage

- Production'da otomatik kullanılır
- `BLOB_READ_WRITE_TOKEN` otomatik sağlanır (Blob Storage oluşturulduğunda)
- Local development'ta JSON dosyaları kullanılır
- Tüm PDF'ler ve veriler Blob Storage'da saklanır

### Otomatik Arşivleme

- Her gün 00:00'da çalışır
- Siparişler silinmez, sadece tarih filtresi ile görüntülenir
- Arşiv görünümü ile geçmiş günlerin siparişleri görülebilir

---

## 🆘 Sorun Giderme

### Yaygın Hatalar

1. **PayTR Token Hatası**:
   - Environment variable'ları kontrol edin
   - Merchant bilgilerinin doğru olduğundan emin olun
   - Hash hesaplamasını kontrol edin (console logları)

2. **PDF Yükleme Hatası**:
   - Vercel Blob Storage'ın aktif olduğundan emin olun
   - `BLOB_READ_WRITE_TOKEN` kontrol edin
   - Dosya boyutu limitini kontrol edin (50MB)

3. **Sipariş Kaydedilemiyor**:
   - Vercel Blob Storage'ı kontrol edin
   - Console loglarını inceleyin
   - Environment variable'ları kontrol edin

4. **Build Hatası**:
   - `.next` klasörünü temizleyin: `rm -rf .next`
   - TypeScript hatalarını kontrol edin
   - Dependencies'i yeniden yükleyin: `npm install`

---

## 🔗 Bağlantılar

- **Canlı Site**: https://www.kopyalagelsin.com
- **Admin Panel**: https://www.kopyalagelsin.com/admin
- **PayTR**: https://www.paytr.com

---

## 📄 Lisans

Bu proje özel kullanım için geliştirilmiştir.

---

**Geliştirilmiş ve yönetilir by Kopyala Gelsin Team** 🚀
