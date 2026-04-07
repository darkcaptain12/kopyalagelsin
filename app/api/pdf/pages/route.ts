import { NextRequest, NextResponse } from "next/server";
import pdf from "pdf-parse";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("pdf") as File;

    if (!file) {
      return NextResponse.json({ error: "PDF dosyası bulunamadı." }, { status: 400 });
    }

    if (file.type !== "application/pdf") {
      return NextResponse.json({ error: "Sadece PDF dosyası kabul edilir." }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const data = await pdf(buffer);

    return NextResponse.json({ pageCount: data.numpages });
  } catch (error: any) {
    console.error("Error detecting PDF pages:", error);
    return NextResponse.json(
      { error: "Sayfa sayısı tespit edilemedi." },
      { status: 500 }
    );
  }
}

