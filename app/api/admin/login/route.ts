import { getAdminSession, verifyPassword, createSessionValue, setAdminSessionCookie, isAdminConfigured, getAdminPasswordHash } from "@/lib/auth";
import { jsonError, jsonOk, rateLimit, getClientIp } from "@/lib/utilities";

export async function POST(req: Request) {
  const ip = getClientIp(req);
  if (!rateLimit(`login:${ip}`, 5, 60_000)) return jsonError("Too many requests", 429);
  if (!isAdminConfigured()) return jsonError("Admin is not configured correctly", 500);
  try {
    const body = await req.json();
    const email = String(body?.email || "").trim().toLowerCase();
    const password = String(body?.password || "");
    const adminEmail = (process.env.ADMIN_EMAIL || "").toLowerCase();
    const hash = getAdminPasswordHash();
    if (email !== adminEmail) return jsonError("Invalid credentials", 401);
    const ok = await verifyPassword(password, hash);
    if (!ok) return jsonError("Invalid credentials", 401);
    const value = createSessionValue(process.env.ADMIN_EMAIL!);
    await setAdminSessionCookie(value);
    return jsonOk({ authenticated: true });
  } catch (e) {
    return jsonError("Login failed", 500);
  }
}