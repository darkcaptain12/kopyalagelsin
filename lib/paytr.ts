import crypto from "crypto";

// Environment variables
const PAYTR_MERCHANT_ID = process.env.PAYTR_MERCHANT_ID || "";
const PAYTR_MERCHANT_KEY = process.env.PAYTR_MERCHANT_KEY || "";
const PAYTR_MERCHANT_SALT = process.env.PAYTR_MERCHANT_SALT || "";
const PAYTR_TEST_MODE = process.env.PAYTR_TEST_MODE || "0"; // String: "0" or "1"
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
 * PayTR Hash Parameters Interface
 * Following PayTR's official Node.js documentation format
 */
export interface PaytrHashParams {
  merchantId: string;
  merchantKey: string;
  merchantSalt: string;
  userIp: string;
  merchantOid: string;
  email: string;
  paymentAmount: number; // kuruş cinsinden (integer)
  userBasket: string; // Base64(JSON array)
  noInstallment: string; // "0" or "1"
  maxInstallment: string; // "0","2","3","6","9","12" vb.
  currency: string; // "TL" (or as per PayTR docs)
  testMode: string; // "0" or "1"
}

/**
 * Create PayTR token hash following official PayTR Node.js documentation.
 * 
 * Hash string format (EXACT order):
 * merchant_id + user_ip + merchant_oid + email + payment_amount + user_basket + 
 * no_installment + max_installment + currency + test_mode
 * 
 * Then: hash_str + merchant_salt
 * 
 * Hash calculation:
 * paytr_token = HMAC_SHA256(hash_str + merchant_salt, merchant_key) → base64
 */
export function createPaytrToken(params: PaytrHashParams): string {
  // Build hash string in EXACT order as per PayTR documentation
  const hashStr =
    params.merchantId +
    params.userIp +
    params.merchantOid +
    params.email +
    String(params.paymentAmount) +
    params.userBasket +
    params.noInstallment +
    params.maxInstallment +
    params.currency +
    params.testMode;

  // Add merchant_salt to hash string
  const hashStrWithSalt = hashStr + params.merchantSalt;

  // Calculate HMAC-SHA256 hash using merchant_key
  const paytrToken = crypto
    .createHmac("sha256", params.merchantKey)
    .update(hashStrWithSalt, "utf8")
    .digest("base64");

  return paytrToken;
}

/**
 * Create PayTR iframe token following the official PayTR Node.js example format.
 * 
 * This function:
 * 1. Validates environment variables
 * 2. Prepares basket in PayTR format (TL prices as strings)
 * 3. Converts payment amount to kuruş (cents)
 * 4. Creates hash using createPaytrToken helper
 * 5. Sends POST request to PayTR API
 * 6. Returns token on success
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

  // Prepare basket for PayTR format: [["Ürün Adı", "34.90", 1], ["Başka Ürün", "12.50", 2]]
  // IMPORTANT: Prices must be in TL as strings with 2 decimal places
  const basketArray = input.basket.map((item) => [
    item.name,
    Number(item.price).toFixed(2), // TL price as string with 2 decimals (e.g. "34.90")
    item.quantity,
  ]);

  // Encode basket to Base64 JSON string
  const userBasket = Buffer.from(JSON.stringify(basketArray)).toString("base64");

  // Get base URL
  const baseUrl = input.baseUrl || NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const cleanBaseUrl = baseUrl.replace(/\/$/, "");

  // Prepare all fields as strings for PayTR
  const merchantOid = String(input.merchantOid).trim();
  const email = String(input.email).trim().toLowerCase(); // PayTR expects lowercase email
  const currency = input.currency || "TL";
  const testMode = PAYTR_TEST_MODE === "1" ? "1" : "0"; // Use string comparison
  const noInstallment = String(input.noInstallment ?? 0);
  const maxInstallment = String(input.maxInstallment ?? 0);
  const lang = input.lang || "tr";
  const timeoutLimit = "30";
  const debugOn = PAYTR_TEST_MODE === "1" ? "1" : "0";

  const merchantOkUrl = `${cleanBaseUrl}/odeme/basarili`;
  const merchantFailUrl = `${cleanBaseUrl}/odeme/hata`;
  const notificationUrl = `${cleanBaseUrl}/api/paytr/notify`;

  // Prepare values for hash calculation - these SAME values will be used in form data
  const merchantIdStr = String(PAYTR_MERCHANT_ID).trim();
  const merchantSaltStr = String(PAYTR_MERCHANT_SALT).trim();
  const userIpStr = String(input.userIp).trim();

  // Create PayTR token hash using official format
  const paytrToken = createPaytrToken({
    merchantId: merchantIdStr,
    merchantKey: PAYTR_MERCHANT_KEY,
    merchantSalt: merchantSaltStr,
    userIp: userIpStr,
    merchantOid: merchantOid,
    email: email,
    paymentAmount: paymentAmountKurus, // kuruş cinsinden
    userBasket: userBasket,
    noInstallment: noInstallment,
    maxInstallment: maxInstallment,
    currency: currency,
    testMode: testMode,
  });

  // Debug logging - log full details for troubleshooting
  console.log("PayTR hash calculation debug:", {
    merchantId: merchantIdStr,
    userIp: userIpStr,
    merchantOid: merchantOid,
    email: email,
    paymentAmount: paymentAmountKurus,
    userBasket: userBasket.substring(0, 50) + "...",
    userBasketDecoded: JSON.parse(Buffer.from(userBasket, "base64").toString()),
    noInstallment: noInstallment,
    maxInstallment: maxInstallment,
    currency: currency,
    testMode: testMode,
    merchantSalt: merchantSaltStr ? "***" + merchantSaltStr.slice(-4) : "missing",
    paytrTokenLength: paytrToken.length,
    paytrTokenPreview: paytrToken.substring(0, 20) + "...",
  });

  // Prepare form data - use EXACT same values as in hash calculation
  const formData = new URLSearchParams();
  formData.append("merchant_id", merchantIdStr);
  formData.append("user_ip", userIpStr);
  formData.append("merchant_oid", merchantOid);
  formData.append("email", email);
  formData.append("payment_amount", String(paymentAmountKurus));
  formData.append("user_basket", userBasket);
  formData.append("no_installment", noInstallment);
  formData.append("max_installment", maxInstallment);
  formData.append("currency", currency);
  formData.append("test_mode", testMode);
  formData.append("user_name", input.userName);
  formData.append("user_address", input.userAddress);
  formData.append("user_phone", input.userPhone.replace(/\s+/g, "")); // Remove spaces
  formData.append("merchant_ok_url", merchantOkUrl);
  formData.append("merchant_fail_url", merchantFailUrl);
  formData.append("merchant_notify_url", notificationUrl);
  formData.append("lang", lang);
  formData.append("timeout_limit", timeoutLimit);
  formData.append("debug_on", debugOn);
  formData.append("merchant_key", PAYTR_MERCHANT_KEY);
  formData.append("merchant_salt", merchantSaltStr);
  formData.append("paytr_token", paytrToken);

  // Debug: Log form data (without sensitive fields) for troubleshooting
  console.log("PayTR request debug:", {
    merchant_id: merchantIdStr,
    user_ip: userIpStr,
    merchant_oid: merchantOid,
    email: email,
    payment_amount: paymentAmountKurus,
    currency: currency,
    test_mode: testMode,
    merchant_ok_url: merchantOkUrl,
    merchant_fail_url: merchantFailUrl,
    merchant_notify_url: notificationUrl,
    paytr_token_length: paytrToken.length,
  });

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
    console.error("PayTR API HTTP error:", {
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
 * hash = base64(HMAC-SHA256(hashString, merchant_key))
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
    .update(hashStr, "utf8")
    .digest("base64");

  // Compare hashes
  const isValid = calculatedHash === params.receivedHash;

  if (!isValid) {
    console.error("PayTR hash verification failed:", {
      merchantOid: params.merchantOid,
      status: params.status,
      totalAmount: params.totalAmount,
      receivedHash: params.receivedHash.substring(0, 20) + "...",
      calculatedHash: calculatedHash.substring(0, 20) + "...",
      hashStr: hashStr,
    });
  }

  return isValid;
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
