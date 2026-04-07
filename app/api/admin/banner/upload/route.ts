import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import { existsSync } from "fs";
import path from "path";
import { v4 as uuidv4 } from "uuid";

const BANNER_DIR = path.join(process.cwd(), "public", "banners");

async function ensureBannerDir(): Promise<void> {
  if (!existsSync(BANNER_DIR)) {
    await mkdir(BANNER_DIR, { recursive: true });
  }
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("image") as File;

    if (!file) {
      return NextResponse.json({ error: "Görsel dosyası bulunamadı." }, { status: 400 });
    }

    // Accept image types
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp", "image/gif"];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: "Sadece görsel dosyaları kabul edilir (JPG, PNG, WEBP, GIF)." },
        { status: 400 }
      );
    }

    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json(
        { error: "Dosya boyutu 10 MB'dan küçük olmalıdır." },
        { status: 400 }
      );
    }

    await ensureBannerDir();

    const fileId = uuidv4();
    const extension = file.name.split(".").pop() || "jpg";
    const fileName = `banner-${fileId}.${extension}`;
    const filePath = path.join(BANNER_DIR, fileName);

    const buffer = Buffer.from(await file.arrayBuffer());
    await writeFile(filePath, buffer);

    // Return public path
    const publicPath = `/banners/${fileName}`;

    return NextResponse.json({ path: publicPath, fileName });
  } catch (error: any) {
    console.error("Error uploading banner image:", error);
    return NextResponse.json({ error: "Görsel yüklenemedi." }, { status: 500 });
  }
}

