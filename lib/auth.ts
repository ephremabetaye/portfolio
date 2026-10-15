import crypto from "crypto";
import bcrypt from "bcryptjs";
import { cookies } from "next/headers";

const SESSION_COOKIE = "admin_session";
const MAX_AGE = 60 * 60 * 24 * 7; // 7 days

function secret() {
  return process.env.SESSION_SECRET || "dev-secret-change-me";
}

export function getAdminPasswordHash() {
  const raw = process.env.ADMIN_PASSWORD_HASH || "";
  if (raw.startsWith("$2")) return raw;
  // Allow base64-encoded hashes for environments where $ interpolation is a problem
  try {
    const decoded = Buffer.from(raw, "base64").toString("utf8");
    if (decoded.startsWith("$2")) return decoded;
  } catch {
    // ignore
  }
  return raw;
}

function sign(payload: string) {
  return crypto.createHmac("sha256", secret()).update(payload).digest("hex");
}

export function verifyPassword(plain: string, hash: string) {
  return bcrypt.compare(plain, hash);
}

export function createSessionValue(email: string) {
  const payload = `${email}:${Date.now()}`;
  const signature = sign(payload);
  return `${payload}:${signature}`;
}

export function verifySessionValue(value: string | undefined | null) {
  if (!value) return null;
  const parts = value.split(":");
  if (parts.length !== 3) return null;
  const [email, ts, sig] = parts;
  const payload = `${email}:${ts}`;
  const expected = sign(payload);
  if (!crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expected))) return null;
  const adminEmail = process.env.ADMIN_EMAIL;
  if (!adminEmail || email !== adminEmail) return null;
  const age = Date.now() - Number(ts);
  if (Number.isNaN(age) || age < 0 || age > MAX_AGE * 1000) return null;
  return email;
}

export async function getAdminSession() {
  const store = await cookies();
  const value = store.get(SESSION_COOKIE)?.value;
  return verifySessionValue(value);
}

export async function setAdminSessionCookie(value: string) {
  const store = await cookies();
  store.set(SESSION_COOKIE, value, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: MAX_AGE,
  });
}

export async function clearAdminSessionCookie() {
  const store = await cookies();
  store.delete(SESSION_COOKIE);
}

export function isAdminConfigured() {
  return !!process.env.ADMIN_EMAIL && !!process.env.ADMIN_PASSWORD_HASH && !!process.env.SESSION_SECRET;
}

export const ADMIN_COOKIE_NAME = SESSION_COOKIE;