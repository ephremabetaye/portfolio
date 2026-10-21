export function slugify(input: string) {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

export function safeUrl(url?: string | null) {
  if (!url) return "";
  try {
    const u = new URL(url);
    if (u.protocol !== "http:" && u.protocol !== "https:") return "";
    return url;
  } catch {
    return "";
  }
}

export function readingTime(text: string) {
  const words = text.split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 200));
}

export function jsonError(message: string, status = 400) {
  return Response.json({ success: false, error: message }, { status });
}

export function jsonOk(data: unknown, status = 200) {
  return Response.json({ success: true, data }, { status });
}

// Basic in-memory rate limit (per-process)
const buckets = new Map<string, { count: number; reset: number }>();
export function rateLimit(key: string, limit: number, windowMs: number) {
  const now = Date.now();
  const b = buckets.get(key);
  if (!b || b.reset < now) {
    buckets.set(key, { count: 1, reset: now + windowMs });
    return true;
  }
  if (b.count >= limit) return false;
  b.count += 1;
  return true;
}

export function getClientIp(req: Request) {
  const xf = req.headers.get("x-forwarded-for");
  if (xf) return xf.split(",")[0].trim();
  return req.headers.get("x-real-ip") || "unknown";
}