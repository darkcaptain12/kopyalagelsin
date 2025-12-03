# Production Deployment Kılavuzu

## Vercel Environment Variables

Vercel dashboard'unda aşağıdaki environment değişkenlerini ayarlayın:

### PayTR Configuration
```
PAYTR_MERCHANT_ID=645606
PAYTR_MERCHANT_KEY=5R5XRs2ddX87AoKq
PAYTR_MERCHANT_SALT=P5u4aF4thJLXB9YJ
PAYTR_TEST_MODE=0
```

**ÖNEMLİ**: Production için `PAYTR_TEST_MODE=0` olmalıdır. Test için `PAYTR_TEST_MODE=1` kullanın.

### Admin Configuration
```
ADMIN_PASSWORD=Utax1453!?
```

### Application Configuration
```
NEXT_PUBLIC_APP_URL=https://kopyalagelsin.com
```

### Security
```
JWT_SECRET=<güçlü-random-secret-key>
```

**Önemli**: JWT_SECRET için güçlü bir random string kullanın. Örnek:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

## Vercel'de Environment Variables Ayarlama

1. Vercel Dashboard'a gidin
2. Projenizi seçin
3. Settings > Environment Variables bölümüne gidin
4. Yukarıdaki tüm değişkenleri ekleyin
5. Production, Preview ve Development için ayrı ayrı ayarlayabilirsiniz

## Önemli Notlar

### Dosya Depolama
Vercel serverless fonksiyonlar kullandığı için dosya sistemi read-only'dir. Production için:

**Vercel Blob Storage Kullanılıyor:**
1. **PDF Dosyaları**: Vercel Blob Storage'da saklanıyor (`pdfs/` prefix)
2. **Siparişler JSON**: Vercel Blob Storage'da saklanıyor (`app-data/orders.json`)

**Önemli**: Vercel Blob Storage token'ı otomatik olarak Vercel tarafından sağlanır (`BLOB_READ_WRITE_TOKEN`).
Eğer bu token yoksa, Vercel Dashboard'dan Blob Storage'ı oluşturmanız gerekir:
1. Vercel Dashboard → Projeniz → Storage sekmesi
2. "Create Database" → "Blob" seçin
3. Token otomatik olarak eklenir

### PayTR Callback URL
PayTR panelinde bildirim (callback) URL'i şu şekilde ayarlayın:
```
https://www.kopyalagelsin.com/api/paytr/notify
```

**Not**: Bu URL PayTR panelinde "Bildirim URL" olarak ayarlanmalıdır.

### Production Modu

**Test Modundan Production Moduna Geçiş:**

1. **Vercel Dashboard'da Environment Variable'ı güncelleyin:**
   - Settings > Environment Variables
   - `PAYTR_TEST_MODE` değişkenini bulun
   - Değerini `0` olarak ayarlayın (veya silin ve yeniden ekleyin)
   - Production environment'ını seçin
   - Değişikliği kaydedin

2. **Yeni deployment tetikleyin:**
   - Vercel otomatik olarak yeniden deploy edecektir
   - Veya manuel olarak "Redeploy" yapabilirsiniz

3. **Doğrulama:**
   - Admin paneline giriş yapın: `/admin`
   - Yeni bir test siparişi oluşturun
   - PayTR ödeme sayfası açıldığında gerçek ödeme yapılacaktır (test modu kapalı)
   - Sipariş akışını test edin

**⚠️ UYARI**: Production modunda (`PAYTR_TEST_MODE=0`) yapılan ödemeler gerçektir ve geri alınamaz!

## Build Kontrolü

Build başarılı olmalı. Hata varsa:
- TypeScript hatalarını kontrol edin
- ESLint uyarılarını kontrol edin
- Environment değişkenlerinin doğru ayarlandığından emin olun

