import mongoose from "mongoose";
import { getMongoUri } from "@/lib/env";

type Cached = { conn: typeof mongoose | null; promise: Promise<typeof mongoose> | null };
const globalAny = global as unknown as { __mongooseCached?: Cached };

if (!globalAny.__mongooseCached) {
  globalAny.__mongooseCached = { conn: null, promise: null };
}
const cached = globalAny.__mongooseCached!;

export async function connectDB() {
  if (cached.conn) return cached.conn;

  const uri = getMongoUri();
  if (!uri) {
    throw new Error(
      "MONGODB_URI is not configured. Add it in your hosting provider's environment variables (MongoDB Atlas connection string) and redeploy."
    );
  }
  if (uri.includes("<password>")) {
    throw new Error(
      "MONGODB_URI still contains the <password> placeholder. Replace it with the database user's password, then redeploy."
    );
  }
  if (uri.includes("<") || uri.includes(">")) {
    throw new Error(
      "MONGODB_URI contains angle brackets (< >). Remove them from around the username and password. " +
        "Correct format: mongodb+srv://USERNAME:PASSWORD@cluster.mongodb.net/database"
    );
  }

  if (!cached.promise) {
    cached.promise = mongoose
      .connect(uri, {
        bufferCommands: false,
        serverSelectionTimeoutMS: 8000,
        connectTimeoutMS: 8000,
      })
      .then((m) => m);
  }
  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    const message = e instanceof Error ? e.message : String(e);
    if (/bad auth|authentication failed|SCRAM/i.test(message)) {
      throw new Error(
        "MongoDB authentication failed (bad auth). The username/password in MONGODB_URI is wrong for this cluster. " +
          "Use a Database Access user (not your Atlas account login), check the password, percent-encode special characters, " +
          "and make sure the user belongs to this cluster. Original error: " +
          message
      );
    }
    throw e;
  }
  return cached.conn;
}

export function isDBConfigured() {
  return !!getMongoUri();
}
