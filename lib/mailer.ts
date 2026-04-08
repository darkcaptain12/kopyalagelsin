import nodemailer from "nodemailer";
import type { Order } from "./ordersStore";

function createTransporter() {
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!user || !pass) {
    throw new Error(
      "SMTP_USER veya SMTP_PASS env değişkenleri tanımlı değil. Mail gönderilemedi."
    );
  }

  return nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    auth: { user, pass },
  });
}

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleString("tr-TR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      timeZone: "Europe/Istanbul",
    });
  } catch {
    return iso;
  }
}

function colorLabel(c: string): string {
  return c === "siyah_beyaz" ? "Siyah Beyaz" : "Renkli";
}
function sideLabel(s: string): string {
  return s === "tek" ? "Tek Yön" : "Çift Yön";
}
function bindingLabel(b: string): string {
  if (b === "spiral") return "Spiral";
  if (b === "american") return "Amerikan";
  return "Yok";
}

function buildHtml(order: Order, pdfAttached: boolean): string {
  const binding =
    order.bindingType !== "none"
      ? `${bindingLabel(order.bindingType)} — ${order.ciltCount} adet`
      : "Yok";

  const discountRow =
    order.discountAmount && order.discountAmount > 0
      ? `<tr>
          <td style="padding:7px 0;color:#16a34a;font-size:13px;">
            İndirim${order.appliedCouponCode ? ` (${order.appliedCouponCode})` : ""}:
          </td>
          <td style="padding:7px 0;color:#16a34a;font-size:13px;text-align:right;">
            -${order.discountAmount.toFixed(2)} ₺
          </td>
        </tr>`
      : "";

  const bindingCostRow =
    order.bindingCost > 0
      ? `<tr style="background:#f8fafc;">
          <td style="padding:7px 6px;color:#64748b;font-size:13px;">Ciltleme Ücreti:</td>
          <td style="padding:7px 6px;color:#1e293b;font-size:13px;text-align:right;">
            ${order.bindingCost.toFixed(2)} ₺
          </td>
        </tr>`
      : "";

  const noteRow = order.notes
    ? `<tr>
        <td style="padding:7px 0;color:#64748b;font-size:13px;">Not:</td>
        <td style="padding:7px 0;color:#475569;font-size:13px;font-style:italic;">${order.notes}</td>
      </tr>`
    : "";

  return `<!DOCTYPE html>
<html lang="tr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width,initial-scale=1.0">
  <title>Yeni Sipariş Bildirimi</title>
</head>
<body style="font-family:'Segoe UI',Arial,sans-serif;background:#f1f5f9;margin:0;padding:24px;">
  <div style="max-width:640px;margin:0 auto;background:#ffffff;border-radius:14px;overflow:hidden;
              box-shadow:0 4px 20px rgba(0,0,0,0.08);">

    <!-- HEADER -->
    <div style="background:linear-gradient(135deg,#1e40af 0%,#3b82f6 100%);padding:28px 32px;">
      <h1 style="color:#fff;margin:0;font-size:22px;font-weight:700;letter-spacing:-0.3px;">
        Kopyala Gelsin
      </h1>
      <p style="color:#bfdbfe;margin:5px 0 0;font-size:13px;">Yeni Başarılı Sipariş Bildirimi</p>
    </div>

    <!-- STATUS BADGE -->
    <div style="padding:20px 32px 4px;">
      <span style="display:inline-block;background:#dcfce7;color:#166534;padding:6px 16px;
                   border-radius:20px;font-size:13px;font-weight:600;">
        ✓ Ödeme Başarıyla Tamamlandı
      </span>
    </div>

    <!-- SİPARİŞ BİLGİLERİ -->
    <div style="padding:20px 32px;">
      <h2 style="color:#1e293b;font-size:15px;font-weight:700;margin:0 0 14px;
                 border-bottom:2px solid #e2e8f0;padding-bottom:10px;">
        Sipariş Bilgileri
      </h2>
      <table style="width:100%;border-collapse:collapse;">
        <tr>
          <td style="padding:7px 0;color:#64748b;font-size:13px;width:42%;">Sipariş No:</td>
          <td style="padding:7px 0;color:#1e293b;font-size:12px;font-weight:600;font-family:monospace;">
            ${order.id}
          </td>
        </tr>
        <tr style="background:#f8fafc;">
          <td style="padding:7px 6px;color:#64748b;font-size:13px;">Sipariş Tarihi:</td>
          <td style="padding:7px 6px;color:#1e293b;font-size:13px;">${formatDate(order.createdAt)}</td>
        </tr>
        <tr>
          <td style="padding:7px 0;color:#64748b;font-size:13px;">Ödeme Durumu:</td>
          <td style="padding:7px 0;color:#166534;font-size:13px;font-weight:600;">Ödendi</td>
        </tr>
      </table>
    </div>

    <!-- MÜŞTERİ BİLGİLERİ -->
    <div style="padding:0 32px 20px;">
      <h2 style="color:#1e293b;font-size:15px;font-weight:700;margin:0 0 14px;
                 border-bottom:2px solid #e2e8f0;padding-bottom:10px;">
        Müşteri Bilgileri
      </h2>
      <table style="width:100%;border-collapse:collapse;">
        <tr>
          <td style="padding:7px 0;color:#64748b;font-size:13px;width:42%;">Ad Soyad:</td>
          <td style="padding:7px 0;color:#1e293b;font-size:13px;font-weight:600;">${order.customerName}</td>
        </tr>
        <tr style="background:#f8fafc;">
          <td style="padding:7px 6px;color:#64748b;font-size:13px;">E-posta:</td>
          <td style="padding:7px 6px;color:#1e293b;font-size:13px;">${order.email}</td>
        </tr>
        <tr>
          <td style="padding:7px 0;color:#64748b;font-size:13px;">Telefon:</td>
          <td style="padding:7px 0;color:#1e293b;font-size:13px;">${order.phone || "—"}</td>
        </tr>
        <tr style="background:#f8fafc;">
          <td style="padding:7px 6px;color:#64748b;font-size:13px;vertical-align:top;">Teslimat Adresi:</td>
          <td style="padding:7px 6px;color:#1e293b;font-size:13px;">${order.address}</td>
        </tr>
        ${noteRow}
      </table>
    </div>

    <!-- PDF İNDİR -->
    ${order.pdfUrl ? `
    <div style="padding:0 32px 20px;">
      <h2 style="color:#1e293b;font-size:15px;font-weight:700;margin:0 0 14px;
                 border-bottom:2px solid #e2e8f0;padding-bottom:10px;">
        Müşteri PDF Dosyası
      </h2>
      ${pdfAttached
        ? `<p style="color:#16a34a;font-size:13px;margin:0 0 10px;">
             ✓ PDF bu e-postaya ek olarak eklenmiştir.
           </p>`
        : ``}
      <a href="${order.pdfUrl}"
         style="display:inline-block;background:#1d4ed8;color:#ffffff;text-decoration:none;
                padding:10px 22px;border-radius:8px;font-size:13px;font-weight:600;">
        PDF'yi İndir / Görüntüle
      </a>
      ${order.pdfSize ? `<p style="color:#94a3b8;font-size:11px;margin:8px 0 0;">
        Dosya boyutu: ${(order.pdfSize / 1024 / 1024).toFixed(1)} MB
      </p>` : ""}
    </div>` : ""}

    <!-- BASKI DETAYLARI -->
    <div style="padding:0 32px 20px;">
      <h2 style="color:#1e293b;font-size:15px;font-weight:700;margin:0 0 14px;
                 border-bottom:2px solid #e2e8f0;padding-bottom:10px;">
        Baskı Detayları
      </h2>
      <table style="width:100%;border-collapse:collapse;">
        <tr>
          <td style="padding:7px 0;color:#64748b;font-size:13px;width:42%;">PDF Dosyası:</td>
          <td style="padding:7px 0;color:#1e293b;font-size:13px;font-weight:500;">
            ${order.pdfName || "—"}
          </td>
        </tr>
        <tr style="background:#f8fafc;">
          <td style="padding:7px 6px;color:#64748b;font-size:13px;">Sayfa Sayısı:</td>
          <td style="padding:7px 6px;color:#1e293b;font-size:13px;">${order.pageCount} sayfa</td>
        </tr>
        <tr>
          <td style="padding:7px 0;color:#64748b;font-size:13px;">Kağıt Boyutu:</td>
          <td style="padding:7px 0;color:#1e293b;font-size:13px;">${order.size}</td>
        </tr>
        <tr style="background:#f8fafc;">
          <td style="padding:7px 6px;color:#64748b;font-size:13px;">Renk:</td>
          <td style="padding:7px 6px;color:#1e293b;font-size:13px;">${colorLabel(order.color)}</td>
        </tr>
        <tr>
          <td style="padding:7px 0;color:#64748b;font-size:13px;">Baskı Yönü:</td>
          <td style="padding:7px 0;color:#1e293b;font-size:13px;">${sideLabel(order.side)}</td>
        </tr>
        <tr style="background:#f8fafc;">
          <td style="padding:7px 6px;color:#64748b;font-size:13px;">Ciltleme:</td>
          <td style="padding:7px 6px;color:#1e293b;font-size:13px;">${binding}</td>
        </tr>
      </table>
    </div>

    <!-- ÜCRET ÖZETİ -->
    <div style="padding:0 32px 28px;">
      <h2 style="color:#1e293b;font-size:15px;font-weight:700;margin:0 0 14px;
                 border-bottom:2px solid #e2e8f0;padding-bottom:10px;">
        Ücret Özeti
      </h2>
      <table style="width:100%;border-collapse:collapse;">
        <tr>
          <td style="padding:7px 0;color:#64748b;font-size:13px;width:60%;">Baskı Ücreti:</td>
          <td style="padding:7px 0;color:#1e293b;font-size:13px;text-align:right;">
            ${order.printCost.toFixed(2)} ₺
          </td>
        </tr>
        ${bindingCostRow}
        <tr style="background:#f8fafc;">
          <td style="padding:7px 6px;color:#64748b;font-size:13px;">Kargo Ücreti:</td>
          <td style="padding:7px 6px;color:#1e293b;font-size:13px;text-align:right;">
            ${order.shippingCost.toFixed(2)} ₺
          </td>
        </tr>
        ${discountRow}
        <tr style="background:#f8fafc;">
          <td style="padding:7px 6px;color:#64748b;font-size:13px;">KDV:</td>
          <td style="padding:7px 6px;color:#1e293b;font-size:13px;text-align:right;">
            ${order.tax.toFixed(2)} ₺
          </td>
        </tr>
        <tr>
          <td style="padding:14px 0 8px;color:#1e293b;font-size:16px;font-weight:700;
                     border-top:2px solid #e2e8f0;">
            Genel Toplam:
          </td>
          <td style="padding:14px 0 8px;color:#1d4ed8;font-size:17px;font-weight:700;
                     text-align:right;border-top:2px solid #e2e8f0;">
            ${order.totalAmount.toFixed(2)} ₺
          </td>
        </tr>
      </table>
    </div>

    <!-- FOOTER -->
    <div style="background:#f8fafc;padding:16px 32px;text-align:center;border-top:1px solid #e2e8f0;">
      <p style="color:#94a3b8;font-size:11px;margin:0;line-height:1.5;">
        Bu e-posta Kopyala Gelsin otomatik bildirim sistemi tarafından gönderilmiştir.<br>
        Yanıtlamayınız — bu adres yalnızca bildirim amaçlı kullanılmaktadır.
      </p>
    </div>
  </div>
</body>
</html>`;
}

function buildText(order: Order): string {
  const pdfLine = order.pdfUrl
    ? [`PDF İNDİR     : ${order.pdfUrl}`, ""]
    : [];
  const lines: string[] = [
    "═══════════════════════════════════════════",
    "  YENİ SİPARİŞ BİLDİRİMİ — KOPYALA GELSİN",
    "═══════════════════════════════════════════",
    "",
    ...pdfLine,
    "SİPARİŞ BİLGİLERİ",
    `  Sipariş No   : ${order.id}`,
    `  Tarih        : ${formatDate(order.createdAt)}`,
    `  Ödeme Durumu : Ödendi ✓`,
    "",
    "MÜŞTERİ BİLGİLERİ",
    `  Ad Soyad     : ${order.customerName}`,
    `  E-posta      : ${order.email}`,
    `  Telefon      : ${order.phone || "—"}`,
    `  Adres        : ${order.address}`,
    ...(order.notes ? [`  Not          : ${order.notes}`] : []),
    "",
    "BASKI DETAYLARI",
    `  PDF Dosyası  : ${order.pdfName || "—"}`,
    `  Sayfa Sayısı : ${order.pageCount}`,
    `  Kağıt Boyutu : ${order.size}`,
    `  Renk         : ${colorLabel(order.color)}`,
    `  Baskı Yönü   : ${sideLabel(order.side)}`,
    `  Ciltleme     : ${order.bindingType !== "none" ? `${bindingLabel(order.bindingType)} (${order.ciltCount} adet)` : "Yok"}`,
    "",
    "ÜCRET ÖZETİ",
    `  Baskı        : ${order.printCost.toFixed(2)} ₺`,
    ...(order.bindingCost > 0 ? [`  Ciltleme     : ${order.bindingCost.toFixed(2)} ₺`] : []),
    `  Kargo        : ${order.shippingCost.toFixed(2)} ₺`,
    ...(order.discountAmount && order.discountAmount > 0
      ? [`  İndirim      : -${order.discountAmount.toFixed(2)} ₺`]
      : []),
    `  KDV          : ${order.tax.toFixed(2)} ₺`,
    "  ─────────────────────────────",
    `  TOPLAM       : ${order.totalAmount.toFixed(2)} ₺`,
    "",
    "═══════════════════════════════════════════",
  ];
  return lines.join("\n");
}

const PDF_ATTACH_MAX_BYTES = 10 * 1024 * 1024; // 10 MB

/**
 * PDF'yi URL'den indir, attachment olarak döndür.
 * 10 MB'dan büyükse veya hata olursa null döner (e-mail yine de gönderilir).
 */
async function fetchPdfAttachment(
  url: string,
  filename: string,
  sizeHint?: number
): Promise<{ filename: string; content: Buffer; contentType: string } | null> {
  try {
    if (sizeHint && sizeHint > PDF_ATTACH_MAX_BYTES) return null;

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000); // 8 sn timeout

    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(timeout);

    if (!res.ok) return null;

    const contentLength = Number(res.headers.get("content-length") || 0);
    if (contentLength > PDF_ATTACH_MAX_BYTES) return null;

    const buffer = Buffer.from(await res.arrayBuffer());
    if (buffer.length > PDF_ATTACH_MAX_BYTES) return null;

    return { filename, content: buffer, contentType: "application/pdf" };
  } catch {
    return null;
  }
}

/**
 * Başarılı ödeme sonrası admin bildirimi gönder.
 * Hata olursa fırlatmaz — sadece loglar (ödeme akışını asla bozmamalı).
 */
export async function sendOrderSuccessEmail(order: Order): Promise<void> {
  try {
    const recipientEmail = process.env.SMTP_USER;
    if (!recipientEmail) {
      console.error("[Mailer] SMTP_USER tanımlı değil, mail atlanıyor.");
      return;
    }

    const transporter = createTransporter();

    // PDF attachment dene (≤10 MB ise)
    let attachment: Awaited<ReturnType<typeof fetchPdfAttachment>> = null;
    if (order.pdfUrl) {
      attachment = await fetchPdfAttachment(
        order.pdfUrl,
        order.pdfName || "siparis.pdf",
        order.pdfSize
      );
    }

    const mailOptions: Parameters<typeof transporter.sendMail>[0] = {
      from: `"Kopyala Gelsin" <${recipientEmail}>`,
      to: recipientEmail,
      subject: `[Yeni Sipariş] ${order.customerName} — ${order.totalAmount.toFixed(2)} ₺`,
      html: buildHtml(order, !!attachment),
      text: buildText(order),
    };

    if (attachment) {
      mailOptions.attachments = [attachment];
    }

    await transporter.sendMail(mailOptions);

    console.log(
      `[Mailer] Sipariş bildirimi gönderildi: ${order.id}` +
      (attachment ? " (PDF eki ile)" : " (PDF linki ile)")
    );
  } catch (error: any) {
    // Mail hatası ödeme akışını etkilememeli — sadece logla
    console.error("[Mailer] Mail gönderilemedi:", error?.message || error);
  }
}

// ─────────────────────────────────────────────
// MÜŞTERİ SİPARİŞ DURUM BİLDİRİMLERİ
// ─────────────────────────────────────────────

type CustomerStatus = "hazirlaniyor" | "kargolandi" | "iptal";

interface StatusConfig {
  subject: string;
  badge: { bg: string; color: string; text: string };
  title: string;
  message: string;
}

function getStatusConfig(status: CustomerStatus): StatusConfig {
  switch (status) {
    case "hazirlaniyor":
      return {
        subject: "Siparişiniz Hazırlanıyor 🖨️",
        badge: { bg: "#dbeafe", color: "#1d4ed8", text: "🖨️ Hazırlanıyor" },
        title: "Siparişiniz Hazırlanıyor!",
        message:
          "Siparişinizi aldık ve ekibimiz baskınızı hazırlamaya başladı. " +
          "Baskı tamamlandığında kargoya verilecek ve size tekrar bilgi verilecektir.",
      };
    case "kargolandi":
      return {
        subject: "Siparişiniz Kargoya Verildi 🚚",
        badge: { bg: "#dcfce7", color: "#166534", text: "🚚 Kargoya Verildi" },
        title: "Siparişiniz Yola Çıktı!",
        message:
          "Siparişiniz kargoya teslim edildi ve adresinize doğru yola çıktı. " +
          "Kargo genellikle 1-3 iş günü içinde teslim edilmektedir.",
      };
    case "iptal":
      return {
        subject: "Siparişiniz İptal Edildi",
        badge: { bg: "#fee2e2", color: "#991b1b", text: "✕ İptal Edildi" },
        title: "Siparişiniz İptal Edildi",
        message:
          "Siparişiniz iptal edilmiştir. Ödeme yaptıysanız iade işlemi " +
          "banka kanalıyla 3-5 iş günü içinde gerçekleştirilecektir. " +
          "Sorularınız için bizimle iletişime geçebilirsiniz.",
      };
  }
}

function buildCustomerStatusHtml(order: Order, status: CustomerStatus): string {
  const cfg = getStatusConfig(status);
  const siteUrl = process.env.NEXT_PUBLIC_APP_URL || "https://www.kopyalagelsin.com";

  return `<!DOCTYPE html>
<html lang="tr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width,initial-scale=1.0">
  <title>${cfg.subject}</title>
</head>
<body style="font-family:'Segoe UI',Arial,sans-serif;background:#f1f5f9;margin:0;padding:24px;">
  <div style="max-width:560px;margin:0 auto;background:#ffffff;border-radius:14px;overflow:hidden;
              box-shadow:0 4px 20px rgba(0,0,0,0.08);">

    <!-- HEADER -->
    <div style="background:linear-gradient(135deg,#1e40af 0%,#3b82f6 100%);padding:28px 32px;">
      <h1 style="color:#fff;margin:0;font-size:22px;font-weight:700;letter-spacing:-0.3px;">
        Kopyala Gelsin
      </h1>
      <p style="color:#bfdbfe;margin:5px 0 0;font-size:13px;">Sipariş Güncelleme Bildirimi</p>
    </div>

    <!-- BADGE + MESAJ -->
    <div style="padding:28px 32px 20px;">
      <span style="display:inline-block;background:${cfg.badge.bg};color:${cfg.badge.color};
                   padding:7px 18px;border-radius:20px;font-size:13px;font-weight:700;margin-bottom:18px;">
        ${cfg.badge.text}
      </span>
      <h2 style="color:#1e293b;font-size:18px;font-weight:700;margin:0 0 12px;">${cfg.title}</h2>
      <p style="color:#475569;font-size:14px;line-height:1.6;margin:0;">
        Sayın <strong>${order.customerName}</strong>,<br><br>
        ${cfg.message}
      </p>
    </div>

    <!-- SİPARİŞ ÖZETİ -->
    <div style="padding:0 32px 28px;">
      <div style="background:#f8fafc;border-radius:10px;padding:16px 20px;border:1px solid #e2e8f0;">
        <p style="color:#64748b;font-size:12px;font-weight:600;margin:0 0 10px;text-transform:uppercase;
                  letter-spacing:0.5px;">Sipariş Özeti</p>
        <table style="width:100%;border-collapse:collapse;">
          <tr>
            <td style="padding:5px 0;color:#64748b;font-size:13px;width:45%;">Sipariş No:</td>
            <td style="padding:5px 0;color:#1e293b;font-size:12px;font-family:monospace;font-weight:600;">
              ${order.id.substring(0, 18)}…
            </td>
          </tr>
          <tr>
            <td style="padding:5px 0;color:#64748b;font-size:13px;">Sipariş Tarihi:</td>
            <td style="padding:5px 0;color:#1e293b;font-size:13px;">${formatDate(order.createdAt)}</td>
          </tr>
          <tr>
            <td style="padding:5px 0;color:#64748b;font-size:13px;">Toplam Tutar:</td>
            <td style="padding:5px 0;color:#1d4ed8;font-size:14px;font-weight:700;">
              ${order.totalAmount.toFixed(2)} ₺
            </td>
          </tr>
          <tr>
            <td style="padding:5px 0;color:#64748b;font-size:13px;">Baskı:</td>
            <td style="padding:5px 0;color:#1e293b;font-size:13px;">
              ${order.pageCount} sayfa · ${order.size} · ${colorLabel(order.color)}
            </td>
          </tr>
          <tr>
            <td style="padding:5px 0;color:#64748b;font-size:13px;vertical-align:top;">Teslimat:</td>
            <td style="padding:5px 0;color:#1e293b;font-size:13px;">${order.address}</td>
          </tr>
        </table>
      </div>
    </div>

    <!-- ALT BİLGİ -->
    <div style="background:#f8fafc;padding:16px 32px;text-align:center;border-top:1px solid #e2e8f0;">
      <p style="color:#64748b;font-size:12px;margin:0 0 8px;">
        Sorularınız için:
        <a href="mailto:${process.env.SMTP_USER || "info@kopyalagelsin.com"}"
           style="color:#1d4ed8;text-decoration:none;">
          ${process.env.SMTP_USER || "info@kopyalagelsin.com"}
        </a>
      </p>
      <p style="color:#94a3b8;font-size:11px;margin:0;">
        Bu e-posta otomatik olarak gönderilmiştir.<br>
        <a href="${siteUrl}" style="color:#94a3b8;">kopyalagelsin.com</a>
      </p>
    </div>
  </div>
</body>
</html>`;
}

function buildCustomerStatusText(order: Order, status: CustomerStatus): string {
  const cfg = getStatusConfig(status);
  return [
    "═══════════════════════════════════════════",
    `  ${cfg.subject.toUpperCase()} — KOPYALA GELSİN`,
    "═══════════════════════════════════════════",
    "",
    `Sayın ${order.customerName},`,
    "",
    cfg.message,
    "",
    "SİPARİŞ BİLGİLERİ",
    `  Sipariş No  : ${order.id}`,
    `  Tarih       : ${formatDate(order.createdAt)}`,
    `  Toplam      : ${order.totalAmount.toFixed(2)} ₺`,
    `  Baskı       : ${order.pageCount} sayfa · ${order.size} · ${colorLabel(order.color)}`,
    `  Adres       : ${order.address}`,
    "",
    "═══════════════════════════════════════════",
  ].join("\n");
}

/**
 * Sipariş durumu değişince müşteriye bildirim e-postası gönder.
 * hazirlaniyor / kargolandi / iptal durumlarında tetiklenir.
 */
export async function sendOrderStatusEmail(
  order: Order,
  status: "hazirlaniyor" | "kargolandi" | "iptal"
): Promise<void> {
  try {
    const transporter = createTransporter();
    const cfg = getStatusConfig(status);

    await transporter.sendMail({
      from: `"Kopyala Gelsin" <${process.env.SMTP_USER}>`,
      to: order.email,
      subject: cfg.subject,
      html: buildCustomerStatusHtml(order, status),
      text: buildCustomerStatusText(order, status),
    });

    console.log(`[Mailer] Müşteri bildirim maili gönderildi: ${order.id} → ${status}`);
  } catch (error: any) {
    console.error("[Mailer] Müşteri mail gönderilemedi:", error?.message || error);
  }
}
