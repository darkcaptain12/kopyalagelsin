# Local Test İçin Notlar

## PayTR Local Test

Local'de test yaparken dikkat edilmesi gerekenler:

### 1. Environment Variables

`.env.local` dosyasında:

```env
# Local test için - Production URL'ini yorum satırı yapın veya kaldırın
# NEXT_PUBLIC_APP_URL=https://kopyalagelsin.com

# Veya localhost kullanın:
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 2. PayTR Callback URL'leri

Local'de test yaparken:
- PayTR bildirim URL'i (`/api/paytr/notify`) localhost'a erişemez
- Bu yüzden callback'ler çalışmayacaktır
- Test için ngrok gibi bir tünel servisi kullanabilirsiniz

### 3. Hash Hesaplama

PayTR hash hesaplama formatı:
- `merchant_id + merchant_oid + email + payment_amount + merchant_salt`
- SHA256 hash, Base64 encode

Eğer hala hash hatası alıyorsanız:
1. Merchant bilgilerinizi kontrol edin
2. Test modunda olduğunuzdan emin olun (`PAYTR_TEST_MODE=1`)
3. Console log'larını kontrol edin

### 4. Test Kartı

PayTR test modunda test kartları kullanın:
- Kart No: 4355 0843 5508 4358
- CVV: 000
- Tarih: Gelecek bir tarih
