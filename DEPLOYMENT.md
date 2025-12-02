# Production Deployment Kılavuzu

## Vercel Environment Variables

Vercel dashboard'unda aşağıdaki environment değişkenlerini ayarlayın:

### PayTR Configuration
```
PAYTR_MERCHANT_ID=645606
PAYTR_MERCHANT_KEY=hR1zceG9rrrqfhR3
PAYTR_MERCHANT_SALT=P5u4aF4thJLXB9YJ
PAYTR_TEST_MODE=0
```

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
Vercel serverless fonksiyonlar kullandığı için dosya sistemi kalıcı değildir. Production için:

1. **PDF Dosyaları**: Cloud storage kullanın (AWS S3, Cloudinary, Vercel Blob Storage)
2. **Siparişler**: Veritabanı kullanın (PostgreSQL, MongoDB, Supabase)

### PayTR Callback URL
PayTR panelinde callback URL'i şu şekilde ayarlayın:
```
https://kopyalagelsin.com/api/paytr/callback
```

### Test
1. İlk deployment sonrası admin paneline giriş yapın: `/admin`
2. PayTR test ödemesi yapın (test modu kapalı olduğu için gerçek ödeme yapılır)
3. Sipariş akışını test edin

## Build Kontrolü

Build başarılı olmalı. Hata varsa:
- TypeScript hatalarını kontrol edin
- ESLint uyarılarını kontrol edin
- Environment değişkenlerinin doğru ayarlandığından emin olun

