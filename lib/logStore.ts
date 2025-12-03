// This file should only be imported in server-side code (API routes)
// Do not import this in client components

import { readFile, writeFile, mkdir } from "fs/promises";
import { existsSync } from "fs";
import path from "path";
import { readBlobJson, writeBlobJson } from "./blobStorage";

export interface LogEntry {
  id: string;
  timestamp: string;
  type: "manual" | "system" | "order" | "payment" | "admin";
  message: string;
  details?: Record<string, any>;
  adminUser?: string; // Admin kullanıcı adı (manuel log için)
}

// Storage configuration (same as ordersStore)
// This file should only be used in server-side code (API routes)
const isVercel = 
  typeof process !== "undefined" && (
    process.env.VERCEL === "1" || 
    !!process.env.VERCEL_ENV ||
    process.env.VERCEL_URL !== undefined ||
    (process.cwd && process.cwd().includes("/var/task"))
  );

const USE_BLOB_STORAGE = isVercel || (typeof process !== "undefined" && process.env.USE_BLOB_STORAGE === "1");

// Local file system paths
const DATA_DIR = typeof process !== "undefined" ? path.join(process.cwd(), "data") : "";
const LOGS_FILE = typeof process !== "undefined" ? path.join(DATA_DIR, "logs.json") : "";
const BLOB_FILENAME = "logs.json";

async function ensureDataDir(): Promise<void> {
  if (USE_BLOB_STORAGE) return;
  
  if (!existsSync(DATA_DIR)) {
    await mkdir(DATA_DIR, { recursive: true });
  }
}

async function readLogsFileLocal(): Promise<LogEntry[]> {
  if (USE_BLOB_STORAGE) {
    throw new Error("Local file system should not be used when USE_BLOB_STORAGE is enabled");
  }
  
  await ensureDataDir();
  
  if (!existsSync(LOGS_FILE)) {
    return [];
  }

  try {
    const content = await readFile(LOGS_FILE, "utf-8");
    return JSON.parse(content);
  } catch (error) {
    console.error("Error reading logs file:", error);
    return [];
  }
}

async function writeLogsFileLocal(logs: LogEntry[]): Promise<void> {
  if (USE_BLOB_STORAGE) {
    throw new Error("Local file system should not be used when USE_BLOB_STORAGE is enabled");
  }
  
  await ensureDataDir();
  await writeFile(LOGS_FILE, JSON.stringify(logs, null, 2), "utf-8");
}

async function readLogsBlob(): Promise<LogEntry[]> {
  try {
    const logs = await readBlobJson<LogEntry[]>(BLOB_FILENAME, {
      prefix: "app-data",
    });
    return logs || [];
  } catch (error: any) {
    console.error("Error reading logs from blob storage:", error);
    if (error.statusCode === 404 || error.message?.includes("not found")) {
      return [];
    }
    return [];
  }
}

async function writeLogsBlob(logs: LogEntry[]): Promise<void> {
  try {
    await writeBlobJson(BLOB_FILENAME, logs, {
      prefix: "app-data",
    });
  } catch (error: any) {
    console.error("Error writing logs to blob storage:", error);
    throw new Error(`Log kaydedilemedi: ${error.message || "Bilinmeyen hata"}`);
  }
}

async function readLogsFile(): Promise<LogEntry[]> {
  if (USE_BLOB_STORAGE) {
    return await readLogsBlob();
  } else {
    return await readLogsFileLocal();
  }
}

async function writeLogsFile(logs: LogEntry[]): Promise<void> {
  if (USE_BLOB_STORAGE) {
    await writeLogsBlob(logs);
  } else {
    await writeLogsFileLocal(logs);
  }
}

export async function getAllLogs(): Promise<LogEntry[]> {
  const logs = await readLogsFile();
  return logs.sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );
}

export async function addLog(entry: Omit<LogEntry, "id" | "timestamp">): Promise<LogEntry> {
  const logs = await readLogsFile();
  const newLog: LogEntry = {
    ...entry,
    id: `log-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    timestamp: new Date().toISOString(),
  };
  logs.push(newLog);
  // Keep only last 1000 logs
  const sortedLogs = logs.sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );
  const limitedLogs = sortedLogs.slice(0, 1000);
  await writeLogsFile(limitedLogs);
  return newLog;
}

export async function clearLogs(): Promise<void> {
  await writeLogsFile([]);
}

