import {
  createSessionValue,
  getAdminEmail,
  getAdminPasswordHash,
  getAdminPlainPassword,
  isAdminConfigured,
  isAdminHashValid,
  setAdminSessionCookie,
  verifyPassword,
} from "@/lib/auth";
import { jsonError, jsonOk, rateLimit, getClientIp } from "@/lib/utilities";

const CONFIG_HELP =
  "Admin login is not configured on this deployment. In Vercel → Project → Settings → Environment Variables set ADMIN_EMAIL, ADMIN_PASSWORD_HASH (or ADMIN_PASSWORD), and SESSION_SECRET, then redeploy.";

export async function POST(req: Request) {
  const ip = getClientIp(req);
  if (!rateLimit(`login:${ip}`, 5, 60_000)) return jsonError("Too many requests", 429);
  if (!isAdminConfigured()) return jsonError(CONFIG_HELP, 500);
  if (!isAdminHashValid() && !getAdminPlainPassword()) return jsonError(CONFIG_HELP, 500);

  try {
    const body = await req.json();
    const email = String(body?.email || "").trim().toLowerCase();
    const password = String(body?.password || "");
    const adminEmail = getAdminEmail();

    if (email !== adminEmail) return jsonError("Invalid credentials", 401);

    const ok = await verifyPassword(password, getAdminPasswordHash());
    if (!ok) return jsonError("Invalid credentials", 401);

    const value = createSessionValue(adminEmail);
    await setAdminSessionCookie(value);
    return jsonOk({ authenticated: true });
  } catch (e) {
    console.error("Admin login failed:", e);
    return jsonError("Login failed", 500);
  }
}
