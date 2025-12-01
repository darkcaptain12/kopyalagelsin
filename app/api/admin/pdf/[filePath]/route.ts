import { NextRequest, NextResponse } from "next/server";
import { readFile } from "fs/promises";
import { existsSync } from "fs";
import path from "path";

const UPLOAD_DIR = path.join(process.cwd(), "uploads");

export async function GET(
  request: NextRequest,
  { params }: { params: { filePath: string } }
) {
  try {
    const filePath = decodeURIComponent(params.filePath);
    const fullPath = path.join(UPLOAD_DIR, filePath);

    // Security: ensure file is within upload directory
    if (!fullPath.startsWith(UPLOAD_DIR)) {
      return NextResponse.json({ error: "Geçersiz dosya yolu." }, { status: 400 });
    }

    if (!existsSync(fullPath)) {
      return NextResponse.json({ error: "Dosya bulunamadı." }, { status: 404 });
    }

    const fileBuffer = await readFile(fullPath);

    return new NextResponse(fileBuffer, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${filePath}"`,
      },
    });
  } catch (error: any) {
    console.error("Error serving PDF:", error);
    return NextResponse.json({ error: "Dosya yüklenemedi." }, { status: 500 });
  }
}

