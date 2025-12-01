import { NextRequest, NextResponse } from "next/server";
import { getConfig, saveConfig, type AppConfig } from "@/lib/config";

export async function GET() {
  try {
    const config = await getConfig();
    return NextResponse.json(config);
  } catch (error: any) {
    console.error("Error fetching config:", error);
    return NextResponse.json({ error: "Config alınamadı." }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const config: AppConfig = await request.json();

    // Validate basic structure
    if (!config.pricing || !config.pricing.a4 || !config.pricing.binding || !config.pricing.shipping) {
      return NextResponse.json({ error: "Geçersiz config yapısı." }, { status: 400 });
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

