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
      "MONGODB_URI is not configured. Add it in Vercel → Project → Settings → Environment Variables (MongoDB Atlas connection string) and redeploy."
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
    throw e;
  }
  return cached.conn;
}

export function isDBConfigured() {
  return !!getMongoUri();
}
