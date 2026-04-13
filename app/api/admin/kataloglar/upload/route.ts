import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

// Katalog yükleme devre dışı — dosyalar public/kataloglar/ klasörüne manuel eklenir.
export async function POST() {
  return NextResponse.json(
    { error: "Lütfen PDF dosyalarını public/kataloglar/ klasörüne manuel olarak ekleyin." },
    { status: 501 }
  );
}
