import { readFile, writeFile, mkdir } from "fs/promises";
import { existsSync } from "fs";
import path from "path";
import { v4 as uuidv4 } from "uuid";
import bcrypt from "bcryptjs";
import { readBlobJson, writeBlobJson } from "./blobStorage";

export interface User {
  id: string; // UUID
  createdAt: string; // ISO date string
  name: string;
  email: string;
  passwordHash: string; // bcrypt hash
  referralCode: string; // unique short code for referral (e.g. EMIR123)
  referredByUserId?: string | null;
}

// Storage configuration (same as ordersStore and config)
const isVercel = 
  process.env.VERCEL === "1" || 
  !!process.env.VERCEL_ENV ||
  process.env.VERCEL_URL !== undefined ||
  (typeof process.cwd === "function" && process.cwd().includes("/var/task"));

const USE_BLOB_STORAGE = isVercel || process.env.USE_BLOB_STORAGE === "1";

const DATA_DIR = path.join(process.cwd(), "data");
const USERS_FILE = path.join(DATA_DIR, "users.json");
const BLOB_FILENAME = "users.json";

async function ensureDataDir(): Promise<void> {
  if (USE_BLOB_STORAGE) return; // Skip on Vercel
  
  if (!existsSync(DATA_DIR)) {
    await mkdir(DATA_DIR, { recursive: true });
  }
}

// Blob Storage helpers (for Vercel production)
async function readUsersBlob(): Promise<User[]> {
  try {
    const users = await readBlobJson<User[]>(BLOB_FILENAME, {
      prefix: "app-data",
    });
    return users || [];
  } catch (error: any) {
    console.error("Error reading users from blob storage:", error);
    if (error.statusCode === 404 || error.message?.includes("not found")) {
      return [];
    }
    return [];
  }
}

async function writeUsersBlob(users: User[]): Promise<void> {
  try {
    await writeBlobJson(BLOB_FILENAME, users, {
      prefix: "app-data",
    });
  } catch (error: any) {
    console.error("Error writing users to blob storage:", error);
    throw new Error(`Kullanıcı kaydedilemedi: ${error.message || "Bilinmeyen hata"}`);
  }
}

// Local file system helpers (for local dev only)
async function readUsersFileLocal(): Promise<User[]> {
  if (USE_BLOB_STORAGE) {
    throw new Error("Local file system should not be used when USE_BLOB_STORAGE is enabled");
  }
  
  await ensureDataDir();

  if (!existsSync(USERS_FILE)) {
    return [];
  }

  try {
    const content = await readFile(USERS_FILE, "utf-8");
    return JSON.parse(content);
  } catch (error) {
    console.error("Error reading users file:", error);
    return [];
  }
}

async function writeUsersFileLocal(users: User[]): Promise<void> {
  if (USE_BLOB_STORAGE) {
    throw new Error("Local file system should not be used when USE_BLOB_STORAGE is enabled");
  }
  
  await ensureDataDir();
  await writeFile(USERS_FILE, JSON.stringify(users, null, 2), "utf-8");
}

// Unified read/write functions
async function readUsersFile(): Promise<User[]> {
  if (USE_BLOB_STORAGE) {
    return await readUsersBlob();
  } else {
    return await readUsersFileLocal();
  }
}

async function writeUsersFile(users: User[]): Promise<void> {
  if (USE_BLOB_STORAGE) {
    await writeUsersBlob(users);
  } else {
    await writeUsersFileLocal(users);
  }
}

function generateReferralCode(name: string): string {
  const namePart = name
    .toUpperCase()
    .replace(/[^A-Z]/g, "")
    .substring(0, 4)
    .padEnd(4, "X");
  const randomPart = Math.floor(1000 + Math.random() * 9000).toString();
  return `${namePart}${randomPart}`;
}

export async function getAllUsers(): Promise<User[]> {
  return await readUsersFile();
}

export async function getUserByEmail(email: string): Promise<User | null> {
  const users = await readUsersFile();
  return users.find((u) => u.email.toLowerCase() === email.toLowerCase()) || null;
}

export async function getUserById(id: string): Promise<User | null> {
  const users = await readUsersFile();
  return users.find((u) => u.id === id) || null;
}

export async function getUserByReferralCode(code: string): Promise<User | null> {
  const users = await readUsersFile();
  return users.find((u) => u.referralCode === code) || null;
}

export async function createUser(input: {
  name: string;
  email: string;
  passwordPlain: string;
  referredByUserId?: string | null;
}): Promise<User> {
  const users = await readUsersFile();

  // Check if email already exists
  const existing = await getUserByEmail(input.email);
  if (existing) {
    throw new Error("Bu e-posta adresi zaten kullanılıyor.");
  }

  // Generate unique referral code
  let referralCode = generateReferralCode(input.name);
  let attempts = 0;
  while (users.some((u) => u.referralCode === referralCode) && attempts < 10) {
    referralCode = generateReferralCode(input.name);
    attempts++;
  }

  // Hash password
  const passwordHash = await bcrypt.hash(input.passwordPlain, 10);

  const newUser: User = {
    id: uuidv4(),
    createdAt: new Date().toISOString(),
    name: input.name,
    email: input.email,
    passwordHash,
    referralCode,
    referredByUserId: input.referredByUserId || null,
  };

  users.push(newUser);
  await writeUsersFile(users);

  return newUser;
}

export async function verifyPassword(user: User, passwordPlain: string): Promise<boolean> {
  return await bcrypt.compare(passwordPlain, user.passwordHash);
}

