# Hızlı Kurulum Kılavuzu

## 1. Bağımlılıkları Yükleyin

```bash
npm install
```

## 2. Ortam Değişkenlerini Ayarlayın

`.env.local` dosyası oluşturun:

```env
# PayTR Configuration (PayTR hesabınızdan alın)
PAYTR_MERCHANT_ID=your_merchant_id
PAYTR_MERCHANT_KEY=your_merchant_key
PAYTR_MERCHANT_SALT=your_merchant_salt
PAYTR_MERCHANT_EMAIL=your_email@example.com
PAYTR_TEST_MODE=1

# Admin Configuration
ADMIN_PASSWORD=your_secure_password_here

# Production için
NEXT_PUBLIC_APP_URL=https://yourdomain.com
```

## 3. Sunucuyu Başlatın

```bash
npm run dev
```

Uygulama http://localhost:3000 adresinde çalışacaktır.

## Önemli Notlar

- **Test Modu**: PayTR test modunda `PAYTR_TEST_MODE=1` kullanın
- **Canlı Mod**: Production'da `PAYTR_TEST_MODE=0` yapın
- **Dosya Depolama**: Production'da (Vercel gibi) dosya depolama için cloud storage kullanmayı düşünün
- **Veritabanı**: Production için JSON dosya yerine veritabanı kullanın

## İlk Test

1. Ana sayfaya gidin: http://localhost:3000
2. Admin paneline gidin: http://localhost:3000/admin
3. Şifre ile giriş yapın

Detaylı bilgi için README.md dosyasına bakın.

