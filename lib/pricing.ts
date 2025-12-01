import type { AppConfig, PricingConfig, ShippingTier } from "./config";

export type Size = "A4" | "A3";
export type Color = "siyah_beyaz" | "renkli";
export type Side = "tek" | "cift";
export type BindingType = "none" | "spiral" | "american";

export interface PricingParams {
  size: Size;
  color: Color;
  side: Side;
  pageCount: number;
  bindingType: BindingType;
  ciltCount: number;
}

/**
 * Calculate per-page price based on config
 */
export function calculatePerPagePrice(
  config: AppConfig | PricingConfig,
  params: { size: Size; color: Color; side: Side; pageCount: number }
): number {
  const { size, color, side, pageCount } = params;
  
  // Support both AppConfig and PricingConfig for backward compatibility
  const pricingConfig = "pricing" in config ? config.pricing : config;

  // Get A4 base pricing
  const a4Pricing = pricingConfig.a4;
  const colorKey = color === "siyah_beyaz" ? "blackWhite" : "color";
  const sideKey = side === "tek" ? "single" : "double";

  const perSidePricing = a4Pricing[colorKey][sideKey];
  const basePrice = pageCount <= 100 ? perSidePricing.upTo100 : perSidePricing.over100;

  // Apply A3 multiplier if needed
  if (size === "A3") {
    return basePrice * pricingConfig.a3Multiplier;
  }

  return basePrice;
}

/**
 * Calculate print cost
 */
export function calculatePrintCost(
  config: AppConfig | PricingConfig,
  params: { size: Size; color: Color; side: Side; pageCount: number }
): number {
  if (params.pageCount <= 0) return 0;

  const perPagePrice = calculatePerPagePrice(config, params);
  return perPagePrice * params.pageCount;
}

/**
 * Calculate binding cost
 */
export function calculateBindingCost(
  config: AppConfig | PricingConfig,
  params: { bindingType: BindingType; ciltCount: number; size: Size; pageCount: number }
): number {
  const { bindingType, ciltCount, size, pageCount } = params;
  
  // Support both AppConfig and PricingConfig
  const pricingConfig = "pricing" in config ? config.pricing : config;

  if (bindingType === "none" || ciltCount <= 0) {
    return 0;
  }

  const bindingConfig = pricingConfig.binding;
  const bindingPricing =
    bindingType === "spiral" ? bindingConfig.spiral : bindingConfig.american;

  const perCiltPrice = ciltCount <= 10 ? bindingPricing.upTo10 : bindingPricing.over10;

  // Apply A3 multiplier
  let totalBindingCost = perCiltPrice * ciltCount;
  if (size === "A3") {
    totalBindingCost *= pricingConfig.a3Multiplier;
  }

  // Spiral cilt için özel kurallar: Sadece cilt sayısı 1 ise
  if (bindingType === "spiral" && ciltCount === 1) {
    // 220-440 sayfa arası: +20₺
    if (pageCount >= 220 && pageCount <= 440) {
      totalBindingCost += 20;
    }
    // 440+ sayfa: +40₺ toplam (20 + 20)
    else if (pageCount > 440) {
      totalBindingCost += 40;
    }
  }

  return totalBindingCost;
}

/**
 * Calculate shipping cost based on total page count
 */
export function calculateShippingCost(
  config: AppConfig | PricingConfig,
  params: { totalPageCount: number }
): number {
  const { totalPageCount } = params;
  
  // Support both AppConfig and PricingConfig
  const pricingConfig = "pricing" in config ? config.pricing : config;
  const shippingTiers = pricingConfig.shipping;

  // Iterate through tiers in order
  for (const tier of shippingTiers) {
    if (tier.maxPages === null) {
      // Catch-all tier (should be last)
      return tier.price;
    }
    if (totalPageCount <= tier.maxPages) {
      return tier.price;
    }
  }

  // Fallback to last tier or 0
  return shippingTiers[shippingTiers.length - 1]?.price || 0;
}

/**
 * Calculate all totals
 */
export interface Totals {
  printCost: number;
  bindingCost: number;
  shippingCost: number;
  subtotal: number; // KDV hariç toplam
  tax: number; // KDV tutarı
  grandTotal: number; // KDV dahil toplam
}

export function calculateTotals(config: AppConfig | PricingConfig, params: PricingParams): Totals {
  const printCost = calculatePrintCost(config, {
    size: params.size,
    color: params.color,
    side: params.side,
    pageCount: params.pageCount,
  });

  const bindingCost = calculateBindingCost(config, {
    bindingType: params.bindingType,
    ciltCount: params.ciltCount,
    size: params.size,
    pageCount: params.pageCount,
  });

  const shippingCost = calculateShippingCost(config, {
    totalPageCount: params.pageCount,
  });

  // KDV hariç toplam
  const subtotal = printCost + bindingCost + shippingCost;
  
  // KDV hesaplama
  const kdvRate = config.kdvRate || 0;
  const tax = subtotal * kdvRate;
  
  // KDV dahil toplam
  const grandTotal = subtotal + tax;

  return {
    printCost,
    bindingCost,
    shippingCost,
    subtotal,
    tax,
    grandTotal,
  };
}
