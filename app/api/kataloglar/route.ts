import { NextResponse } from "next/server";
import { getKataloglar } from "@/lib/kataloglarData";

export const dynamic = "force-dynamic";

export type { KatalogMeta, KatalogFile } from "@/lib/kataloglarData";

export async function GET() {
  try {
    const kataloglar = await getKataloglar();
    return NextResponse.json({ kataloglar });
  } catch (err: any) {
    return NextResponse.json({ kataloglar: [], error: err.message });
  }
}
