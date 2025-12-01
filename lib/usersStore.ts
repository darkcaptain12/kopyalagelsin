import { readFile, writeFile, mkdir } from "fs/promises";
import { existsSync } from "fs";
import path from "path";
import { v4 as uuidv4 } from "uuid";
import bcrypt from "bcryptjs";

export interface User {
  id: string; // UUID
  createdAt: string; // ISO date string
  name: string;
  email: string;
  passwordHash: string; // bcrypt hash
  referralCode: string; // unique short code for referral (e.g. EMIR123)
  referredByUserId?: string | null;
}

const DATA_DIR = path.join(process.cwd(), "data");
const USERS_FILE = path.join(DATA_DIR, "users.json");

async function ensureDataDir(): Promise<void> {
  if (!existsSync(DATA_DIR)) {
    await mkdir(DATA_DIR, { recursive: true });
  }
}

async function readUsersFile(): Promise<User[]> {
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

async function writeUsersFile(users: User[]): Promise<void> {
  await ensureDataDir();
  await writeFile(USERS_FILE, JSON.stringify(users, null, 2), "utf-8");
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

