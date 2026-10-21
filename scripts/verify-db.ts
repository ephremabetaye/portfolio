/**
 * Test the exact MongoDB connection string before redeploying.
 *
 *   npm run verify:db
 *
 * Reads .env.local first, then .env — the same precedence Next.js uses.
 */
import dotenv from "dotenv";
import mongoose from "mongoose";
import { connectDB } from "../lib/mongodb";
import { getMongoUri } from "../lib/env";

dotenv.config({ path: ".env.local" });
dotenv.config();

async function run() {
  const uri = getMongoUri();
  if (!uri) {
    console.error("MONGODB_URI is not set in .env.local / .env.");
    process.exit(1);
  }
  if (uri.includes("<") || uri.includes(">")) {
    console.error(
      "MONGODB_URI contains angle brackets (< >). Remove them from around the username and password.\n" +
        "Correct format: mongodb+srv://USERNAME:PASSWORD@cluster.mongodb.net/database"
    );
    process.exit(1);
  }

  // Never print the password. Show only the host and username.
  try {
    const parsed = new URL(uri);
    console.log("\nMongoDB target:");
    console.log("  host:     " + parsed.host);
    console.log("  username: " + decodeURIComponent(parsed.username));
    console.log("  database: " + (parsed.pathname.replace(/^\//, "") || "(default)"));
  } catch {
    console.error("MONGODB_URI is not a valid URL. Check for unencoded special characters in the password.");
    process.exit(1);
  }

  try {
    await connectDB();
    await mongoose.connection.db?.admin().command({ ping: 1 });
    console.log("\nSUCCESS: connected to MongoDB and the ping succeeded.\n");
    process.exit(0);
  } catch (e) {
    console.error("\nFAILED: " + (e instanceof Error ? e.message : e));
    console.error(
      "\nFix checklist:\n" +
        "  1. Use a Database Access user, not your Atlas account email/password.\n" +
        "  2. Reset that user's password and paste it into the URI.\n" +
        "  3. Percent-encode special characters: @ -> %40, # -> %23, % -> %25, : -> %3A, / -> %2F, ? -> %3F, & -> %26, + -> %2B, space -> %20.\n" +
        "  4. Make sure Network Access allows 0.0.0.0/0 (or your host's IPs).\n" +
        "  5. Update the same URI in your hosting provider and redeploy.\n"
    );
    process.exit(1);
  }
}

run().catch((e) => {
  console.error(e instanceof Error ? e.message : e);
  process.exit(1);
});
