import bcrypt from "bcryptjs";

const password = process.argv[2];
if (!password) {
  console.error("Usage: npm run hash:admin -- yourPassword");
  process.exit(1);
}

const hash = bcrypt.hashSync(password, 12);
const base64 = Buffer.from(hash, "utf8").toString("base64");

console.log("\nBcrypt hash (raw):\n" + hash);
console.log("\nBase64 hash (recommended for Vercel — paste this as ADMIN_PASSWORD_HASH):\n" + base64);
console.log("\n.env.local line:\nADMIN_PASSWORD_HASH=" + base64);
console.log("\nVerification: " + (bcrypt.compareSync(password, hash) ? "OK" : "FAILED"));
console.log("\nNext steps:");
console.log("  1. Vercel → Project → Settings → Environment Variables");
console.log("  2. Add ADMIN_EMAIL, ADMIN_PASSWORD_HASH (value above), SESSION_SECRET");
console.log("  3. Redeploy, then open /api/health to confirm admin.configured = true\n");
