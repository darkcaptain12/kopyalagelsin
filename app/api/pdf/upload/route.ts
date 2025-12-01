import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import { existsSync } from "fs";
import path from "path";
import { v4 as uuidv4 } from "uuid";

const UPLOAD_DIR = path.join(process.cwd(), "uploads");

async function ensureUploadDir(): Promise<void> {
  if (!existsSync(UPLOAD_DIR)) {
    await mkdir(UPLOAD_DIR, { recursive: true });
  }
}

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

    if (file.size > 50 * 1024 * 1024) {
      return NextResponse.json(
        { error: "Dosya boyutu 50 MB'dan küçük olmalıdır." },
        { status: 400 }
      );
    }

    await ensureUploadDir();

    const fileId = uuidv4();
    const fileName = `${fileId}.pdf`;
    const filePath = path.join(UPLOAD_DIR, fileName);

    const buffer = Buffer.from(await file.arrayBuffer());
    await writeFile(filePath, buffer);

    return NextResponse.json({ filePath: fileName, fileId });
  } catch (error: any) {
    console.error("Error uploading PDF:", error);
    return NextResponse.json({ error: "Dosya yüklenemedi." }, { status: 500 });
  }
}

