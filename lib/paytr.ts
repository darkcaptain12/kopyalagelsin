import crypto from "crypto";

// Environment variables
const PAYTR_MERCHANT_ID = process.env.PAYTR_MERCHANT_ID || "";
const PAYTR_MERCHANT_KEY = process.env.PAYTR_MERCHANT_KEY || "";
const PAYTR_MERCHANT_SALT = process.env.PAYTR_MERCHANT_SALT || "";
const PAYTR_TEST_MODE = process.env.PAYTR_TEST_MODE === "1";
const NEXT_PUBLIC_APP_URL = process.env.NEXT_PUBLIC_APP_URL || "";

// Input types for PayTR token creation
export interface PaytrCreateTokenInput {
  merchantOid: string;
  userIp: string;
  email: string;
  userName: string;
  userAddress: string;
  userPhone: string;
  basket: Array<{ name: string; price: number; quantity: number }>; // price in TL as number (e.g. 34.56)
  paymentAmount: number; // total in TL, e.g. 123.45
  currency?: "TL" | "TRY" | "USD" | "EUR" | "GBP" | "RUB";
  noInstallment?: 0 | 1;
  maxInstallment?: number; // e.g. 0, 2, 3, 6, 9, 12
  lang?: "tr" | "en";
  baseUrl?: string; // Optional base URL override (for local development)
}

export interface PaytrCreateTokenResult {
  token: string;
}

export interface PaytrCreateTokenError {
  status: "failed";
  reason: string;
}

/**
 * Create PayTR iframe token following the official PayTR Node.js example format.
 * 
 * Hash calculation follows PayTR's exact specification:
 * hashString = merchant_id + merchant_oid + email + payment_amount + merchant_salt
 * paytr_token = base64(sha256(hashString))
 */
export async function createPaytrIframeToken(
  input: PaytrCreateTokenInput
): Promise<PaytrCreateTokenResult> {
  // Validate environment variables
  if (!PAYTR_MERCHANT_ID || !PAYTR_MERCHANT_KEY || !PAYTR_MERCHANT_SALT) {
    console.error("PayTR environment variables check:", {
      hasMerchantId: !!PAYTR_MERCHANT_ID,
      hasMerchantKey: !!PAYTR_MERCHANT_KEY,
      hasMerchantSalt: !!PAYTR_MERCHANT_SALT,
      merchantIdLength: PAYTR_MERCHANT_ID?.length || 0,
      merchantKeyLength: PAYTR_MERCHANT_KEY?.length || 0,
      merchantSaltLength: PAYTR_MERCHANT_SALT?.length || 0,
    });
    throw new Error("PayTR yapılandırması eksik. Lütfen ortam değişkenlerini kontrol edin.");
  }

  // Convert payment amount to kuruş (cents) as integer
  const paymentAmountKurus = Math.round(input.paymentAmount * 100);
  
  // Prepare basket for PayTR format: [[productName, unitPriceAsString, quantity], ...]
  // Each price must be in kuruş (integer string)
  const basketItems = input.basket.map((item) => [
    item.name,
    String(Math.round(item.price * 100)), // Convert to kuruş and string
    String(item.quantity),
  ]);
  
  // Encode basket to Base64 JSON string
  const userBasket = Buffer.from(JSON.stringify(basketItems)).toString("base64");
  
  // Get base URL
  // Use provided baseUrl (from request) if available, otherwise use env var or localhost
  const baseUrl = input.baseUrl || NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const cleanBaseUrl = baseUrl.replace(/\/$/, "");
  
  // Prepare all fields as strings for PayTR
  const merchantOid = input.merchantOid.trim();
  const email = input.email.trim();
  const currency = input.currency || "TL";
  const testMode = PAYTR_TEST_MODE ? "1" : "0";
  const noInstallment = String(input.noInstallment ?? 0);
  const maxInstallment = String(input.maxInstallment ?? 0);
  const lang = input.lang || "tr";
  const timeoutLimit = "30";
  const debugOn = PAYTR_TEST_MODE ? "1" : "0";
  
  const merchantOkUrl = `${cleanBaseUrl}/odeme/basarili`;
  const merchantFailUrl = `${cleanBaseUrl}/odeme/hata`;
  
  // Notification URL for PayTR
  const notificationUrl = `${cleanBaseUrl}/api/paytr/notify`;
  
  // Build hash string EXACTLY as per PayTR's official Node.js example
  // Format: merchant_id + merchant_oid + email + payment_amount + merchant_salt
  // IMPORTANT: All values must be strings, no spaces, no newlines
  const hashStr = String(PAYTR_MERCHANT_ID) + String(merchantOid) + String(email) + String(paymentAmountKurus) + String(PAYTR_MERCHANT_SALT);
  
  // Calculate hash: SHA256 then Base64 encode
  const paytrToken = crypto.createHash("sha256").update(hashStr, "utf8").digest("base64");
  
  // Debug logging (only in test mode or when needed)
  if (PAYTR_TEST_MODE) {
    console.log("PayTR hash calculation debug:", {
      merchantId: PAYTR_MERCHANT_ID,
      merchantOid,
      email,
      paymentAmountKurus,
      merchantSalt: PAYTR_MERCHANT_SALT ? "***" + PAYTR_MERCHANT_SALT.slice(-4) : "missing",
      hashStrLength: hashStr.length,
      hashStrPreview: hashStr.substring(0, 50) + "...",
      paytrTokenLength: paytrToken.length,
      paytrTokenPreview: paytrToken.substring(0, 20) + "...",
    });
  }
  
  // Prepare form data
  const formData = new URLSearchParams();
  formData.append("merchant_id", PAYTR_MERCHANT_ID);
  formData.append("user_ip", input.userIp);
  formData.append("merchant_oid", merchantOid);
  formData.append("email", email);
  formData.append("payment_amount", String(paymentAmountKurus));
  formData.append("currency", currency);
  formData.append("user_basket", userBasket);
  formData.append("no_installment", noInstallment);
  formData.append("max_installment", maxInstallment);
  formData.append("user_name", input.userName);
  formData.append("user_address", input.userAddress);
  formData.append("user_phone", input.userPhone.replace(/\s+/g, "")); // Remove spaces
  formData.append("merchant_ok_url", merchantOkUrl);
  formData.append("merchant_fail_url", merchantFailUrl);
  formData.append("test_mode", testMode);
  formData.append("debug_on", debugOn);
  formData.append("timeout_limit", timeoutLimit);
  formData.append("lang", lang);
  formData.append("merchant_key", PAYTR_MERCHANT_KEY);
  formData.append("merchant_salt", PAYTR_MERCHANT_SALT);
  formData.append("paytr_token", paytrToken);
  
  // Add notification URL if provided
  if (notificationUrl) {
    formData.append("merchant_notify_url", notificationUrl);
  }
  
  // Debug: Log form data (without sensitive fields) for troubleshooting
  const formDataDebug = {
    merchant_id: PAYTR_MERCHANT_ID,
    merchant_oid: merchantOid,
    email: email,
    payment_amount: paymentAmountKurus,
    currency: currency,
    test_mode: testMode,
    merchant_ok_url: merchantOkUrl,
    merchant_fail_url: merchantFailUrl,
    merchant_notify_url: notificationUrl,
    paytr_token_length: paytrToken.length,
  };
  console.log("PayTR request debug:", formDataDebug);
  
  // Make request to PayTR
  const paytrUrl = "https://www.paytr.com/odeme/api/get-token";
  
  let response: Response;
  try {
    response = await fetch(paytrUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded; charset=utf-8",
      },
      body: formData.toString(),
    });
  } catch (fetchError: any) {
    console.error("PayTR API fetch error:", fetchError);
    throw new Error("PayTR servisine bağlanılamadı. Lütfen daha sonra tekrar deneyin.");
  }
  
  // Get response text
  const responseText = await response.text();
  
  // Handle non-OK status
  if (!response.ok) {
    console.error("PayTR API error:", {
      status: response.status,
      statusText: response.statusText,
      responseText: responseText.substring(0, 1000),
    });
    
    if (response.status === 401) {
      throw new Error(
        "PayTR kimlik doğrulama hatası. Lütfen PayTR merchant bilgilerini kontrol edin."
      );
    }
    
    throw new Error(
      `PayTR servisi yanıt veremedi (${response.status}). Lütfen daha sonra tekrar deneyin.`
    );
  }
  
  // Parse JSON response
  let result: any;
  try {
    result = JSON.parse(responseText);
  } catch (parseError) {
    console.error("PayTR response parse error:", {
      responseText: responseText.substring(0, 500),
    });
    throw new Error("PayTR yanıtı işlenirken hata oluştu. Lütfen tekrar deneyin.");
  }
  
  // Check result status
  if (result.status === "success") {
    if (!result.token) {
      console.error("PayTR returned success but no token:", result);
      throw new Error("Ödeme token'ı alınamadı. Lütfen tekrar deneyin.");
    }
    
    return { token: result.token };
  } else {
    const reason = result.reason || "Bilinmeyen hata";
    console.error("PayTR API error:", {
      status: result.status,
      reason,
      fullResponse: result,
    });
    throw new Error(`PayTR hatası: ${reason}`);
  }
}

/**
 * Verify PayTR notification hash following the official PayTR Node.js example format.
 * 
 * Hash calculation for callback:
 * hashString = merchant_oid + merchant_salt + status + total_amount
 * hash = base64(hmac-sha256(merchant_key, hashString))
 */
export function verifyPaytrNotificationHash(params: {
  merchantOid: string;
  status: string;
  totalAmount: string;
  receivedHash: string;
}): boolean {
  if (!PAYTR_MERCHANT_KEY || !PAYTR_MERCHANT_SALT) {
    console.error("PayTR merchant credentials not configured");
    return false;
  }
  
  // Build hash string EXACTLY as per PayTR's official Node.js example
  // Format: merchant_oid + merchant_salt + status + total_amount
  const hashStr = `${params.merchantOid}${PAYTR_MERCHANT_SALT}${params.status}${params.totalAmount}`;
  
  // Calculate HMAC-SHA256 hash
  const calculatedHash = crypto
    .createHmac("sha256", PAYTR_MERCHANT_KEY)
    .update(hashStr)
    .digest("base64");
  
  // Compare hashes
  return calculatedHash === params.receivedHash;
}

/**
 * Get client IP address from request headers
 */
export function getClientIp(request: Request): string {
  // Try x-forwarded-for first (for proxies/load balancers)
  const forwardedFor = request.headers.get("x-forwarded-for");
  if (forwardedFor) {
    // x-forwarded-for can contain multiple IPs, take the first one
    return forwardedFor.split(",")[0].trim();
  }
  
  // Try x-real-ip
  const realIp = request.headers.get("x-real-ip");
  if (realIp) {
    return realIp.trim();
  }
  
  // Fallback (for local development)
  return "127.0.0.1";
}
