import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";

const ADMIN_COOKIE = "admin_session";

interface AdminPayload {
  isAdmin: true;
}

/**
 * Admin cookie'sini doğrular.
 * Geçerliyse null döner (devam et), geçersizse 401 response döner.
 */
export function requireAdminAuth(request: NextRequest): NextResponse | null {
  const token = request.cookies.get(ADMIN_COOKIE)?.value;

  if (!token) {
    return NextResponse.json({ error: "Yetkisiz erişim." }, { status: 401 });
  }

  try {
    const secret = process.env.JWT_SECRET;
    if (!secret) throw new Error("JWT_SECRET tanımlı değil");
    const decoded = jwt.verify(token, secret) as AdminPayload;
    if (!decoded.isAdmin) throw new Error("Admin değil");
    return null; // Geçerli
  } catch {
    return NextResponse.json({ error: "Yetkisiz erişim." }, { status: 401 });
  }
}

/**
 * Admin oturumu cookie'sini response'a set eder (login sonrası).
 */
export function setAdminCookie(response: NextResponse): void {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error("JWT_SECRET tanımlı değil");

  const token = jwt.sign({ isAdmin: true } as AdminPayload, secret, {
    expiresIn: "24h",
  });

  response.cookies.set(ADMIN_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 24 * 60 * 60, // 24 saat
    path: "/",
  });
}

/**
 * Admin cookie'sini siler (logout).
 */
export function clearAdminCookie(response: NextResponse): void {
  response.cookies.set(ADMIN_COOKIE, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 0,
    path: "/",
  });
}

/**
 * Admin oturumunun geçerli olup olmadığını boolean olarak döner.
 */
export function isAdminAuthenticated(request: NextRequest): boolean {
  return requireAdminAuth(request) === null;
}
