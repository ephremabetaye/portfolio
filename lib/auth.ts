import crypto from "crypto";
import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import { envValue } from "@/lib/env";

const SESSION_COOKIE = "admin_session";
const MAX_AGE = 60 * 60 * 24 * 7; // 7 days
const BCRYPT_HASH_RE = /^\$2[aby]\$\d{2}\$[./A-Za-z0-9]{53}$/;

function secret() {
  return envValue("SESSION_SECRET") || "dev-secret-change-me";
}

export function getAdminEmail() {
  return envValue("ADMIN_EMAIL").toLowerCase();
}

/**
 * Supports both:
 *  - a raw bcrypt hash:             $2b$12$...
 *  - a base64-encoded bcrypt hash:  JDJiJDEy...
 *
 * The base64 form is recommended for Vercel/.env because `$` characters are
 * expanded by some dotenv loaders and can be mangled when copy/pasting.
 */
export function getAdminPasswordHash() {
  const raw = envValue("ADMIN_PASSWORD_HASH");
  if (!raw) return "";
  if (BCRYPT_HASH_RE.test(raw)) return raw;

  try {
    const decoded = Buffer.from(raw, "base64").toString("utf8").trim();
    if (BCRYPT_HASH_RE.test(decoded)) return decoded;
  } catch {
    // ignore
  }
  return raw;
}

/**
 * Optional escape hatch for deployments where the bcrypt hash was copied
 * incorrectly. When set, this plain password is accepted in addition to (not
 * instead of) a valid hash. Prefer ADMIN_PASSWORD_HASH in production.
 */
export function getAdminPlainPassword() {
  return envValue("ADMIN_PASSWORD");
}

export function isAdminHashValid() {
  return BCRYPT_HASH_RE.test(getAdminPasswordHash());
}

function sign(payload: string) {
  return crypto.createHmac("sha256", secret()).update(payload).digest("hex");
}

function safeEqual(a: string, b: string) {
  const left = Buffer.from(a);
  const right = Buffer.from(b);
  if (left.length !== right.length) return false;
  return crypto.timingSafeEqual(left, right);
}

export async function verifyPassword(plain: string, hash: string) {
  const plainPassword = getAdminPlainPassword();
  if (plainPassword) {
    // Constant-time comparison for the optional plain-password fallback.
    if (safeEqual(plain, plainPassword)) return true;
  }
  if (!hash || !BCRYPT_HASH_RE.test(hash)) return false;
  try {
    return await bcrypt.compare(plain, hash);
  } catch {
    return false;
  }
}

export function createSessionValue(email: string) {
  const payload = `${email.toLowerCase()}:${Date.now()}`;
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
  if (!safeEqual(sig, expected)) return null;

  const adminEmail = getAdminEmail();
  if (!adminEmail || email.toLowerCase() !== adminEmail) return null;

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
  const configuredPassword = isAdminHashValid() || !!getAdminPlainPassword();
  return !!getAdminEmail() && configuredPassword && !!envValue("SESSION_SECRET");
}

/** Safe, secret-free status for the deployment health check. */
export function getAdminConfigStatus() {
  const hash = getAdminPasswordHash();
  const email = getAdminEmail();
  const [localPart, domain] = email.split("@");
  return {
    emailConfigured: !!email,
    emailHint: localPart ? `${localPart.slice(0, 2)}***@${domain || ""}` : "",
    passwordHashConfigured: !!envValue("ADMIN_PASSWORD_HASH"),
    passwordHashValid: isAdminHashValid(),
    // Only the bcrypt version/cost + start of the salt. Useful to confirm
    // which hash is deployed without exposing the full hash.
    passwordHashFingerprint: hash ? hash.slice(0, 18) : "",
    plainPasswordConfigured: !!getAdminPlainPassword(),
    sessionSecretConfigured: !!envValue("SESSION_SECRET"),
    configured: isAdminConfigured(),
  };
}

export const ADMIN_COOKIE_NAME = SESSION_COOKIE;
