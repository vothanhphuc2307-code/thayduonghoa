import crypto from "node:crypto";
import { cookies } from "next/headers";
import { requireDb } from "./db";
import type { NextRequest } from "next/server";

const COOKIE = "tdh_session";
const SESSION_DAYS = 14;

type DbUser = {
  id: number;
  name: string;
  email: string;
  role: "student" | "admin";
  exp: number;
  gold: number;
  diamonds: number;
  dame: number;
  level: number;
};

function hashToken(token: string) {
  return crypto.createHash("sha256").update(token).digest("hex");
}

export function hashPassword(password: string) {
  const salt = crypto.randomBytes(16);
  const derived = crypto.scryptSync(password, salt, 64);
  return `scrypt:${salt.toString("hex")}:${derived.toString("hex")}`;
}

export function verifyPassword(password: string, encoded: string) {
  const [scheme, saltHex, hashHex] = encoded.split(":");
  if (scheme !== "scrypt" || !saltHex || !hashHex) return false;
  const derived = crypto.scryptSync(password, Buffer.from(saltHex, "hex"), 64);
  return crypto.timingSafeEqual(derived, Buffer.from(hashHex, "hex"));
}

async function lookupToken(token: string): Promise<DbUser | null> {
  const db = requireDb();
  const [row] = await db`
    SELECT u.id, u.name, u.email, u.role, u.exp, u.gold, u.diamonds, u.dame, u.level
    FROM sessions s
    JOIN users u ON u.id = s.user_id
    WHERE s.token_hash = ${hashToken(token)}
      AND s.expires_at > NOW()
    LIMIT 1
  `;
  return (row as DbUser | undefined) ?? null;
}

export async function getCurrentUser(): Promise<DbUser | null> {
  const store = await cookies();
  const token = store.get(COOKIE)?.value;
  if (!token) return null;
  return lookupToken(token);
}

export async function getRequestUser(request: NextRequest): Promise<DbUser | null> {
  const token = request.cookies.get(COOKIE)?.value;
  if (!token) return null;
  return lookupToken(token);
}

export async function createSession(userId: number) {
  const db = requireDb();
  const raw = crypto.randomBytes(32).toString("base64url");
  const tokenHash = hashToken(raw);
  const expires = new Date(Date.now() + SESSION_DAYS * 86400_000);

  await db`
    INSERT INTO sessions(id, token_hash, user_id, expires_at)
    VALUES (${crypto.randomUUID()}, ${tokenHash}, ${userId}, ${expires.toISOString()})
  `;

  const store = await cookies();
  store.set(COOKIE, raw, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires,
  });
}

export async function clearSession() {
  const db = requireDb();
  const store = await cookies();
  const token = store.get(COOKIE)?.value;
  if (token) {
    await db`DELETE FROM sessions WHERE token_hash = ${hashToken(token)}`;
  }
  store.delete(COOKIE);
}

export function isAdminUser(user: { role: string } | null) {
  return user?.role === "admin";
}

export function hasAdminToken(request: NextRequest) {
  const configured = process.env.ADMIN_TOKEN;
  const provided = request.headers.get("x-admin-token");
  if (!configured || !provided) return false;
  const a = Buffer.from(configured);
  const b = Buffer.from(provided);
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

export async function requireAdminRequest(request: NextRequest) {
  if (hasAdminToken(request)) return { id: 0, name: "ADMIN_TOKEN", email: "", role: "admin" as const };
  const user = await getRequestUser(request);
  if (!isAdminUser(user)) return null;
  return user;
}
