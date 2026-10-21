/**
 * Check the admin credentials that will be used by the app.
 *
 *   npm run verify:admin -- "YourPassword"
 *
 * Reads .env.local first, then .env — the same precedence Next.js uses.
 */
import dotenv from "dotenv";
import bcrypt from "bcryptjs";

dotenv.config({ path: ".env.local" });
dotenv.config();

const password = process.argv[2];
const email = (process.env.ADMIN_EMAIL || "").trim();
const raw = (process.env.ADMIN_PASSWORD_HASH || "").trim();
const plain = (process.env.ADMIN_PASSWORD || "").trim();
const secret = (process.env.SESSION_SECRET || "").trim();
const BCRYPT_HASH_RE = /^\$2[aby]\$\d{2}\$[./A-Za-z0-9]{53}$/;

let hash = raw;
if (raw && !BCRYPT_HASH_RE.test(raw)) {
  const decoded = Buffer.from(raw, "base64").toString("utf8").trim();
  if (BCRYPT_HASH_RE.test(decoded)) hash = decoded;
}

console.log("\nAdmin configuration:");
console.log("  ADMIN_EMAIL:            " + (email || "(not set)"));
console.log("  ADMIN_PASSWORD_HASH:    " + (raw ? (BCRYPT_HASH_RE.test(hash) ? "valid" : "INVALID FORMAT") : "(not set)"));
console.log("  ADMIN_PASSWORD:         " + (plain ? "set (plain-text fallback)" : "(not set)"));
console.log("  SESSION_SECRET:         " + (secret ? "set" : "(not set)"));

if (password) {
  const hashMatches = BCRYPT_HASH_RE.test(hash) ? bcrypt.compareSync(password, hash) : false;
  const plainMatches = plain ? password === plain : false;
  console.log("\n  Password check:         " + (hashMatches || plainMatches ? "MATCH" : "NO MATCH"));
  if (!hashMatches && !plainMatches) {
    console.log("  → Generate a fresh hash: npm run hash:admin -- \"YourPassword\"");
  }
} else {
  console.log("\n  Pass a password to test it: npm run verify:admin -- \"YourPassword\"");
}
console.log();
