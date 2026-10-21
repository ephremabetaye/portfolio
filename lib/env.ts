/**
 * Environment helpers.
 *
 * Vercel (and copy/paste from dashboards) often adds surrounding quotes or
 * trailing whitespace to env values. These helpers normalize values before
 * they are used for comparisons, so a value like `"admin@example.com "` does
 * not cause a login to fail with "Invalid credentials".
 */

function clean(value?: string | null) {
  let result = (value ?? "").trim();
  if (
    (result.startsWith('"') && result.endsWith('"')) ||
    (result.startsWith("'") && result.endsWith("'"))
  ) {
    result = result.slice(1, -1).trim();
  }
  return result;
}

export function envValue(name: string) {
  return clean(process.env[name]);
}

/** MongoDB connection string. Supports the common MONGODB_URL alias too. */
export function getMongoUri() {
  return envValue("MONGODB_URI") || envValue("MONGODB_URL");
}

/**
 * Public site URL. Falls back to the URL Vercel injects at build/runtime so
 * email links, sitemap.xml and robots.txt do not point at localhost after a
 * deployment when NEXT_PUBLIC_SITE_URL was not set.
 */
export function getSiteUrl() {
  const configured = envValue("NEXT_PUBLIC_SITE_URL");
  const isLocal = /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?/i.test(configured);

  // If someone copied a local .env to Vercel, prefer the real deployment URL.
  if (configured && !(isVercel() && isLocal)) {
    return configured.replace(/\/+$/, "");
  }

  const vercelUrl =
    envValue("VERCEL_PROJECT_PRODUCTION_URL") ||
    envValue("VERCEL_BRANCH_URL") ||
    envValue("VERCEL_URL");

  if (vercelUrl) {
    return `https://${vercelUrl.replace(/^https?:\/\//, "").replace(/\/+$/, "")}`;
  }

  return configured ? configured.replace(/\/+$/, "") : "http://localhost:3000";
}

export function isProduction() {
  return process.env.NODE_ENV === "production";
}

export function isVercel() {
  return !!process.env.VERCEL;
}
