import { readFile, writeFile, mkdir } from "fs/promises";
import { existsSync } from "fs";
import path from "path";

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
}

const DATA_DIR = path.join(process.cwd(), "data");
const CONFIG_FILE = path.join(DATA_DIR, "config.json");

async function ensureDataDir(): Promise<void> {
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
    },
    kdvRate: 0.20, // %20 KDV
  };
}

function getDefaultConfig(): AppConfig {
  return {
    pricing: getDefaultPricingConfig(),
    marketing: getDefaultMarketingConfig(),
    ui: getDefaultUIConfig(),
  };
}

export async function getConfig(): Promise<AppConfig> {
  await ensureDataDir();

  if (!existsSync(CONFIG_FILE)) {
    // Create default config
    const defaultConfig = getDefaultConfig();
    await writeFile(CONFIG_FILE, JSON.stringify(defaultConfig, null, 2), "utf-8");
    return defaultConfig;
  }

  try {
    const content = await readFile(CONFIG_FILE, "utf-8");
    const parsed = JSON.parse(content);
    
    // Migrate old config format to new AppConfig format
    if (!parsed.pricing && !parsed.marketing) {
      // Old format - wrap in AppConfig
      const migrated: AppConfig = {
        pricing: parsed as PricingConfig,
        marketing: getDefaultMarketingConfig(),
      };
      await writeFile(CONFIG_FILE, JSON.stringify(migrated, null, 2), "utf-8");
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
    
    // Only save if we added missing configs
    if (!parsed.marketing || !parsed.ui || !parsed.ui.banner) {
      await writeFile(CONFIG_FILE, JSON.stringify(parsed, null, 2), "utf-8");
    }
    
    return parsed as AppConfig;
  } catch (error) {
    console.error("Error reading config file:", error);
    // Return default config if file is corrupted
    const defaultConfig = getDefaultConfig();
    await writeFile(CONFIG_FILE, JSON.stringify(defaultConfig, null, 2), "utf-8");
    return defaultConfig;
  }
}

export async function saveConfig(config: AppConfig): Promise<void> {
  await ensureDataDir();
  
  // Validate pricing config
  if (config.pricing.a3Multiplier <= 0) {
    throw new Error("A3 multiplier must be positive");
  }
  
  if (!config.pricing.shipping || config.pricing.shipping.length === 0) {
    throw new Error("Shipping tiers are required");
  }

  await writeFile(CONFIG_FILE, JSON.stringify(config, null, 2), "utf-8");
}

