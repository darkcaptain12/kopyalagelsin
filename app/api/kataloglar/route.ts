import { NextResponse } from "next/server";
import { getKataloglar } from "@/lib/kataloglarData";

export const dynamic = "force-dynamic";

export type { KatalogMeta } from "@/lib/kataloglarData";

export async function GET() {
  try {
    const all = await getKataloglar();
    const kataloglar = all.filter((k) => !k.disabled);
    return NextResponse.json({ kataloglar });
  } catch (err: any) {
    return NextResponse.json({ kataloglar: [], error: err.message });
  }
}
