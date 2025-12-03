import { NextRequest, NextResponse } from "next/server";
import { getAllLogs, addLog, clearLogs } from "@/lib/logStore";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const logs = await getAllLogs();
    return NextResponse.json({ logs });
  } catch (error: any) {
    console.error("Error fetching logs:", error);
    return NextResponse.json({ error: "Loglar alınamadı." }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, message, adminUser, details } = body;

    if (action === "add") {
      if (!message) {
        return NextResponse.json(
          { error: "Log mesajı gereklidir." },
          { status: 400 }
        );
      }

      const logEntry = await addLog({
        type: "manual",
        message,
        adminUser: adminUser || "Admin",
        details: details || {},
      });

      return NextResponse.json({ success: true, log: logEntry });
    } else if (action === "clear") {
      await clearLogs();
      
      // Log the clear action
      await addLog({
        type: "admin",
        message: "Tüm loglar temizlendi",
        adminUser: adminUser || "Admin",
      });

      return NextResponse.json({ success: true, message: "Loglar temizlendi." });
    } else {
      return NextResponse.json(
        { error: "Geçersiz işlem." },
        { status: 400 }
      );
    }
  } catch (error: any) {
    console.error("Error processing log request:", error);
    return NextResponse.json(
      { error: error.message || "Log işlemi başarısız oldu." },
      { status: 500 }
    );
  }
}

