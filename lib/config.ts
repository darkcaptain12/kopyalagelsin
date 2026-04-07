import { readFile, writeFile, mkdir } from "fs/promises";
import { existsSync } from "fs";
import path from "path";
import { readBlobJson, writeBlobJson } from "./blobStorage";

export interface ShippingTier {
  maxPages: number | null; // null = no upper limit
  price: number;
}

export interface BindingPricing {
  upTo10: number; // price per cilt for 1–10
  over10: number; // price per cilt for 11+
}

export interface PerSidePricing {
  upTo100: number; // price per page for 0–100
  over100: number; // price per page for 101+
}

export interface A4Pricing {
  blackWhite: {
    single: PerSidePricing; // Tek yön
    double: PerSidePricing; // Çift yön
  };
  color: {
    single: PerSidePricing; // Tek yön
    double: PerSidePricing; // Çift yön
  };
}

export interface BindingConfig {
  spiral: BindingPricing;
  american: BindingPricing;
  telDikis: { price: number }; // Katlamalı Tel Dikiş — flat fiyat
}

export interface PricingConfig {
  a4: A4Pricing;
  a3Multiplier: number; // A3 = A4 * this multiplier
  shipping: ShippingTier[]; // sorted ascending by maxPages
  binding: BindingConfig;
  kdvRate: number; // KDV oranı (0.20 = %20)
}

export interface MarketingConfig {
  enableSignupPopup: boolean;
  // Welcome discount (for new members)
  enableMemberWelcomeDiscount: boolean;
  memberWelcomeDiscountPercent: number; // default 5
  memberWelcomeValidFrom: string | null; // ISO or null
  memberWelcomeValidUntil: string | null; // ISO or null
  // Referral program
  enableReferralProgram: boolean;
  referralDiscountPercent: number; // default 5
  referralValidFrom: string | null;
  referralValidUntil: string | null;
}

export type SeasonMode = "normal" | "vize" | "final" | "tez";

export interface SeasonBannerConfig {
  mode: SeasonMode;
  bannerUrl: string | null; // Banner image URL or path
  priceMultiplier: number; // e.g. 1.0 (no change), 0.95 (5% discount), etc.
}

export interface SeasonConfig {
  currentSeasonMode: SeasonMode;
  seasons: {
    normal: SeasonBannerConfig;
    vize: SeasonBannerConfig;
    final: SeasonBannerConfig;
    tez: SeasonBannerConfig;
  };
}

export interface UIConfig {
  // Announcement Bar (Kayar Yazı)
  announcementBar: {
    enabled: boolean;
    text: string;
    link: string | null; // optional link
    backgroundColor: string; // CSS color
    textColor: string; // CSS color
  };
  // Banner (Hero Section)
  banner: {
    title: string;
    subtitle: string;
    buttonText: string;
    buttonLink: string;
    backgroundColor: string; // CSS color (gradient start)
    backgroundColorEnd: string; // CSS color (gradient end)
    textColor: string; // CSS color
    imageEnabled: boolean;
    imagePath: string | null; // Path to banner image
    imageHasText?: boolean; // Banner görselinin içinde yazı var mı? true → sadece buton göster
    imageFit?: "cover" | "contain"; // Görsel sığdırma modu
  };
  // Footer
  footer: {
    description: string;
    phone: string;
    email: string;
    address: string;
    copyright: string;
  };
}

export interface AppConfig {
  pricing: PricingConfig;
  marketing: MarketingConfig;
  ui: UIConfig;
  season?: SeasonConfig; // Optional for backward compatibility
}

// Storage configuration (same as ordersStore)
const isVercel = 
  process.env.VERCEL === "1" || 
  !!process.env.VERCEL_ENV ||
  process.env.VERCEL_URL !== undefined ||
  (typeof process.cwd === "function" && process.cwd().includes("/var/task"));

const USE_BLOB_STORAGE = isVercel || process.env.USE_BLOB_STORAGE === "1";

const DATA_DIR = path.join(process.cwd(), "data");
const CONFIG_FILE = path.join(DATA_DIR, "config.json");
const BLOB_FILENAME = "config.json";

async function ensureDataDir(): Promise<void> {
  if (USE_BLOB_STORAGE) return; // Skip on Vercel
  
  if (!existsSync(DATA_DIR)) {
    await mkdir(DATA_DIR, { recursive: true });
  }
}

function getDefaultMarketingConfig(): MarketingConfig {
  return {
    enableSignupPopup: true,
    enableMemberWelcomeDiscount: true,
    memberWelcomeDiscountPercent: 5,
    memberWelcomeValidFrom: null,
    memberWelcomeValidUntil: null,
    enableReferralProgram: true,
    referralDiscountPercent: 5,
    referralValidFrom: null,
    referralValidUntil: null,
  };
}

function getDefaultSeasonConfig(): SeasonConfig {
  return {
    currentSeasonMode: "normal",
    seasons: {
      normal: {
        mode: "normal",
        bannerUrl: null,
        priceMultiplier: 1.0,
      },
      vize: {
        mode: "vize",
        bannerUrl: null,
        priceMultiplier: 1.0,
      },
      final: {
        mode: "final",
        bannerUrl: null,
        priceMultiplier: 1.0,
      },
      tez: {
        mode: "tez",
        bannerUrl: null,
        priceMultiplier: 1.0,
      },
    },
  };
}

function getDefaultUIConfig(): UIConfig {
  return {
    announcementBar: {
      enabled: true,
      text: "🎉 Yeni üyelere özel %5 indirim! Hemen üye olun ve kuponunuzu kazanın.",
      link: "/uye-ol",
      backgroundColor: "#3b82f6",
      textColor: "#ffffff",
    },
    banner: {
      title: "Öğrenciler için uygun fiyatlı dijital çıktı hizmeti",
      subtitle: "PDF dosyanı yükle, baskı seçeneklerini seç, online öde, çıktın kapına gelsin.",
      buttonText: "Çıktı Siparişi Ver",
      buttonLink: "#siparis",
      backgroundColor: "#2563eb",
      backgroundColorEnd: "#1e40af",
      textColor: "#ffffff",
      imageEnabled: true,
      imagePath: "/logo/favicon.png",
      imageHasText: false,
    },
    footer: {
      description: "Öğrenciler için uygun fiyatlı dijital çıktı hizmeti. PDF dosyanızı yükleyin, çıktınızı alın.",
      phone: "+90 (XXX) XXX XX XX",
      email: "info@dijitalcikti.com",
      address: "Örnek Mahalle, Örnek Sokak No:1, İstanbul",
      copyright: `© ${new Date().getFullYear()} kopyalagelsin. Tüm hakları saklıdır.`,
    },
  };
}

function getDefaultPricingConfig(): PricingConfig {
  return {
    a4: {
      blackWhite: {
        single: {
          upTo100: 0.75,
          over100: 0.5,
        },
        double: {
          upTo100: 1.75,
          over100: 1.5,
        },
      },
      color: {
        single: {
          upTo100: 0.9,
          over100: 0.7,
        },
        double: {
          upTo100: 1.85,
          over100: 1.6,
        },
      },
    },
    a3Multiplier: 2,
    shipping: [
      { maxPages: 500, price: 125 },
      { maxPages: 1000, price: 180 },
      { maxPages: 1500, price: 220 },
      { maxPages: 2000, price: 240 },
      { maxPages: null, price: 0 }, // 2000+ free
    ],
    binding: {
      spiral: {
        upTo10: 40,
        over10: 30,
      },
      american: {
        upTo10: 30,
        over10: 25,
      },
      telDikis: { price: 10 },
    },
    kdvRate: 0.20, // %20 KDV
  };
}

function getDefaultConfig(): AppConfig {
  return {
    pricing: getDefaultPricingConfig(),
    marketing: getDefaultMarketingConfig(),
    ui: getDefaultUIConfig(),
    season: getDefaultSeasonConfig(),
  };
}

// Blob Storage helpers (for Vercel production)
async function readConfigBlob(): Promise<AppConfig | null> {
  try {
    const config = await readBlobJson<AppConfig>(BLOB_FILENAME, {
      prefix: "app-data",
    });
    return config;
  } catch (error: any) {
    console.error("Error reading config from blob storage:", error);
    if (error.statusCode === 404 || error.message?.includes("not found")) {
      return null;
    }
    return null;
  }
}

async function writeConfigBlob(config: AppConfig): Promise<void> {
  try {
    await writeBlobJson(BLOB_FILENAME, config, {
      prefix: "app-data",
    });
  } catch (error: any) {
    console.error("Error writing config to blob storage:", error);
    throw new Error(`Config kaydedilemedi: ${error.message || "Bilinmeyen hata"}`);
  }
}

// Local file system helpers (for local dev only)
async function readConfigFileLocal(): Promise<AppConfig | null> {
  if (USE_BLOB_STORAGE) {
    throw new Error("Local file system should not be used when USE_BLOB_STORAGE is enabled");
  }
  
  await ensureDataDir();
  
  if (!existsSync(CONFIG_FILE)) {
    return null;
  }

  try {
    const content = await readFile(CONFIG_FILE, "utf-8");
    return JSON.parse(content);
  } catch (error) {
    console.error("Error reading config file:", error);
    return null;
  }
}

async function writeConfigFileLocal(config: AppConfig): Promise<void> {
  if (USE_BLOB_STORAGE) {
    throw new Error("Local file system should not be used when USE_BLOB_STORAGE is enabled");
  }
  
  await ensureDataDir();
  await writeFile(CONFIG_FILE, JSON.stringify(config, null, 2), "utf-8");
}

// ─── In-memory cache (serverless function instance başına) ───────────────────
// Her Blob okuması bant genişliği tüketir. 60 sn TTL ile çağrı sayısını düşür.
let _configCache: AppConfig | null = null;
let _configCacheAt = 0;
const CONFIG_CACHE_TTL_MS = 60 * 1000; // 60 saniye

function getConfigFromCache(): AppConfig | null {
  if (_configCache && Date.now() - _configCacheAt < CONFIG_CACHE_TTL_MS) {
    return _configCache;
  }
  return null;
}

function setConfigCache(config: AppConfig): void {
  _configCache = config;
  _configCacheAt = Date.now();
}

function invalidateConfigCache(): void {
  _configCache = null;
  _configCacheAt = 0;
}

// Unified read/write functions
async function readConfigFile(): Promise<AppConfig | null> {
  if (USE_BLOB_STORAGE) {
    return await readConfigBlob();
  } else {
    return await readConfigFileLocal();
  }
}

async function writeConfigFile(config: AppConfig): Promise<void> {
  invalidateConfigCache(); // Cache'i temizle — bir sonraki okumada Blob'dan alır
  if (USE_BLOB_STORAGE) {
    await writeConfigBlob(config);
  } else {
    await writeConfigFileLocal(config);
  }
}

export async function getConfig(): Promise<AppConfig> {
  // Cache hit — Blob okumadan döner
  const cached = getConfigFromCache();
  if (cached) return cached;
  const config = await readConfigFile();

  if (!config) {
    // Config yok — default oluştur. Blob askıya alınmışsa yazmayı dene ama hata olursa yine de default döndür
    const defaultConfig = getDefaultConfig();
    try {
      await writeConfigFile(defaultConfig);
    } catch (writeErr) {
      console.warn("Config kaydedilemedi (Blob sorunu?), geçici default kullanılıyor:", writeErr);
    }
    setConfigCache(defaultConfig);
    return defaultConfig;
  }

  try {
    const parsed = config;
    
    // Migrate old config format to new AppConfig format
    if (!parsed.pricing && !parsed.marketing) {
      // Old format - wrap in AppConfig
      const migrated: AppConfig = {
        pricing: parsed as unknown as PricingConfig,
        marketing: getDefaultMarketingConfig(),
        ui: getDefaultUIConfig(),
        season: getDefaultSeasonConfig(),
      };
      await writeConfigFile(migrated);
      return migrated;
    }
    
    // Ensure marketing config exists
    if (!parsed.marketing) {
      parsed.marketing = getDefaultMarketingConfig();
    }
    
    // Ensure ui config exists
    if (!parsed.ui) {
      parsed.ui = getDefaultUIConfig();
    } else {
      // Ensure banner config exists in ui
      if (!parsed.ui.banner) {
        parsed.ui.banner = getDefaultUIConfig().banner;
      }
      // Ensure announcementBar exists
      if (!parsed.ui.announcementBar) {
        parsed.ui.announcementBar = getDefaultUIConfig().announcementBar;
      }
      // Ensure footer exists
      if (!parsed.ui.footer) {
        parsed.ui.footer = getDefaultUIConfig().footer;
      }
    }

    // Ensure telDikis binding config exists (migration for older configs)
    if (!parsed.pricing?.binding?.telDikis) {
      if (parsed.pricing?.binding) {
        (parsed.pricing.binding as any).telDikis = { price: 10 };
      }
    }

    // Ensure season config exists
    if (!parsed.season) {
      parsed.season = getDefaultSeasonConfig();
    }
    
    // Only save if we added missing configs
    const needsSave = !parsed.marketing || !parsed.ui || !parsed.ui.banner || !parsed.season;
    if (needsSave) {
      await writeConfigFile(parsed as AppConfig);
    }

    setConfigCache(parsed as AppConfig);
    return parsed as AppConfig;
  } catch (error) {
    console.error("Error processing config:", error);
    // Return default config if config is corrupted
    const defaultConfig = getDefaultConfig();
    await writeConfigFile(defaultConfig);
    setConfigCache(defaultConfig);
    return defaultConfig;
  }
}

export async function saveConfig(config: AppConfig): Promise<void> {
  // Validate pricing config
  if (config.pricing.a3Multiplier <= 0) {
    throw new Error("A3 multiplier must be positive");
  }
  
  if (!config.pricing.shipping || config.pricing.shipping.length === 0) {
    throw new Error("Shipping tiers are required");
  }

  await writeConfigFile(config);
}

