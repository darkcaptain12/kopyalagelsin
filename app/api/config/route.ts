import { NextRequest, NextResponse } from "next/server";
import { getConfig, saveConfig, type AppConfig } from "@/lib/config";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  try {
    const config = await getConfig();
    return NextResponse.json(config, {
      headers: {
        "Cache-Control": "no-store, no-cache, must-revalidate",
        "Pragma": "no-cache",
      },
    });
  } catch (error: any) {
    console.error("Error fetching config:", error);
    return NextResponse.json({ error: "Config alınamadı." }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const config: AppConfig = await request.json();

    // Validate basic structure — only pricing is required; ui/marketing/season optional
    if (!config.pricing || !config.pricing.a4 || !config.pricing.binding || !config.pricing.shipping) {
      return NextResponse.json({ error: "Geçersiz config yapısı: pricing alanı eksik." }, { status: 400 });
    }
    // If ui partially missing, fill defaults
    if (!config.ui) {
      const { getConfig } = await import("@/lib/config");
      const existing = await getConfig();
      config.ui = existing.ui;
    }

    await saveConfig(config);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Error saving config:", error);
    return NextResponse.json(
      { error: error.message || "Config kaydedilemedi." },
      { status: 500 }
    );
  }
}

