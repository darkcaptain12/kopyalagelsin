# 🚀 Production Moduna Geçiş Rehberi

## ⚠️ ÖNEMLİ UYARI
Production modunda (`PAYTR_TEST_MODE=0`) yapılan ödemeler **GERÇEKTİR** ve geri alınamaz!

---

## ✅ Adım Adım Production Moduna Geçiş

### 1. Vercel Dashboard'da Environment Variable Güncelleme

1. **Vercel Dashboard'a gidin:**
   - https://vercel.com/dashboard
   - Projenizi seçin

2. **Environment Variables sayfasına gidin:**
   - Settings > Environment Variables

3. **PayTR Configuration'ı güncelleyin:**
   
   Aşağıdaki değişkenleri kontrol edin ve **Production** environment için doğru değerlerle ayarlayın:

   ```
   PAYTR_MERCHANT_ID=645606
   PAYTR_MERCHANT_KEY=5R5XRs2ddX87AoKq
   PAYTR_MERCHANT_SALT=P5u4aF4thJLXB9YJ
   PAYTR_TEST_MODE=0                    ← BU ÇOK ÖNEMLİ! 0 olmalı
   ```

4. **Application Configuration'ı kontrol edin:**
   ```
   NEXT_PUBLIC_APP_URL=https://www.kopyalagelsin.com
   ```

5. **Diğer gerekli değişkenler:**
   ```
   ADMIN_PASSWORD=Utax1453!?
   JWT_SECRET=<güçlü-random-secret-key>
   BLOB_READ_WRITE_TOKEN=<vercel-blob-token>
   ```

### 2. Vercel Blob Storage Kontrolü

Vercel Blob Storage token'ının (`BLOB_READ_WRITE_TOKEN`) otomatik olarak ayarlandığından emin olun:

1. Vercel Dashboard → Projeniz → **Storage** sekmesi
2. Eğer Blob Storage yoksa: **"Create Database"** → **"Blob"** seçin
3. Token otomatik olarak environment variable olarak eklenir

### 3. PayTR Panel Ayarları

PayTR panelinde şu ayarları kontrol edin:

1. **Bildirim URL (Notification Callback):**
   ```
   https://www.kopyalagelsin.com/api/paytr/notify
   ```

2. **Test Modu:** PayTR panelinde test modu **KAPALI** olmalı

3. **Merchant Bilgileri:**
   - Merchant ID: 645606
   - Merchant Key: 5R5XRs2ddX87AoKq
   - Merchant Salt: P5u4aF4thJLXB9YJ

### 4. Yeni Deployment Tetikleme

Environment variable'ları güncelledikten sonra:

1. **Otomatik:** Bir commit push ederseniz Vercel otomatik deploy eder
2. **Manuel:** Vercel Dashboard → Deployments → En son deployment'ın yanındaki **"..."** → **"Redeploy"**

### 5. Production Kontrolleri

Deployment tamamlandıktan sonra:

#### A. Admin Panel Kontrolü
- https://www.kopyalagelsin.com/admin adresine gidin
- Admin şifresi ile giriş yapın: `Utax1453!?`
- Panelin çalıştığını doğrulayın

#### B. PayTR Test Ödemesi (Dikkatli!)
⚠️ **UYARI**: Production modunda gerçek ödeme yapılır!

1. Küçük bir test siparişi oluşturun (örn: 1 sayfa, minimum fiyat)
2. Ödeme sayfasına gidin
3. PayTR ödeme formu açılmalı
4. **GERÇEK BİR KART** ile test yapmak yerine, PayTR'nin test kartlarını kullanın (eğer varsa)

#### C. Callback Test
- PayTR callback URL'inin çalıştığını doğrulayın
- Sipariş durumunun "paid" olarak güncellendiğini kontrol edin

### 6. Son Kontroller

✅ Tüm environment variable'lar doğru mu?  
✅ `PAYTR_TEST_MODE=0` ayarlı mı?  
✅ PayTR panelinde bildirim URL doğru mu?  
✅ Vercel Blob Storage aktif mi?  
✅ Admin paneli çalışıyor mu?  
✅ Sipariş akışı test edildi mi?  

---

## 🔄 Test Moduna Geri Dönmek İsterseniz

Eğer production'da bir sorun olursa ve test moduna geri dönmek isterseniz:

1. Vercel Dashboard → Environment Variables
2. `PAYTR_TEST_MODE` değişkenini bulun
3. Değerini `1` olarak değiştirin
4. Redeploy yapın

---

## 📝 Checklist

Production'a geçmeden önce bu checklist'i tamamlayın:

- [ ] PayTR merchant bilgileri doğru (ID, Key, Salt)
- [ ] `PAYTR_TEST_MODE=0` ayarlı
- [ ] PayTR panelinde bildirim URL doğru
- [ ] Vercel Blob Storage aktif
- [ ] `NEXT_PUBLIC_APP_URL` doğru domain ile ayarlı
- [ ] Admin şifresi ayarlı
- [ ] JWT_SECRET güçlü bir değer
- [ ] Tüm environment variable'lar Production için ayarlandı
- [ ] Deployment başarılı
- [ ] Admin paneli çalışıyor
- [ ] Test siparişi oluşturuldu (dikkatli!)

---

## 🆘 Sorun Giderme

### PayTR Token Hatası
- Environment variable'ları kontrol edin
- Merchant bilgilerinin doğru olduğundan emin olun
- PayTR panelinde callback URL'in doğru ayarlandığını kontrol edin

### PDF Yükleme Hatası
- Vercel Blob Storage'ın aktif olduğundan emin olun
- `BLOB_READ_WRITE_TOKEN` environment variable'ının ayarlandığını kontrol edin

### Sipariş Kaydedilemiyor
- Vercel Blob Storage'ı kontrol edin
- Console loglarını kontrol edin

---

**Başarılar! 🎉**

