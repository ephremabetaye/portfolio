import { connectDB } from "@/lib/mongodb";
import { ContactMessage } from "@/models/ContactMessage";
import { getAdminSession } from "@/lib/auth";
import { jsonError, jsonOk, rateLimit, getClientIp } from "@/lib/utilities";
import { getDemoStore, isDemoMode, nextDemoId, persistDemoStore } from "@/lib/demo-store";

export async function GET(req: Request) {
  const session = await getAdminSession();
  if (!session) return jsonError("Unauthorized", 401);
  const url = new URL(req.url);
  const read = url.searchParams.get("read");
  if (isDemoMode()) {
    let data = [...getDemoStore().messages];
    if (read === "true") data = data.filter((m: any) => m.read);
    if (read === "false") data = data.filter((m: any) => !m.read);
    return jsonOk(data.sort((a: any, b: any) => String(b.createdAt).localeCompare(String(a.createdAt))));
  }
  try {
    await connectDB();
    const q: Record<string, unknown> = {};
    if (read === "true") q.read = true;
    if (read === "false") q.read = false;
    const items = await ContactMessage.find(q).sort({ createdAt: -1 }).lean();
    return jsonOk(items);
  } catch (e) {
    return jsonError("Database unavailable", 503);
  }
}

export async function POST(req: Request) {
  const ip = getClientIp(req);
  if (!rateLimit(`contact:${ip}`, 10, 60_000)) return jsonError("Too many requests", 429);
  try {
    const body = await req.json();
    const name = String(body?.name || "").trim();
    const email = String(body?.email || "").trim();
    const subject = String(body?.subject || "").trim();
    const message = String(body?.message || "").trim();
    if (!name || !email || !message) return jsonError("Name, email, and message are required", 400);
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return jsonError("Invalid email", 400);
    if (message.length > 5000) return jsonError("Message too long", 400);
    if (isDemoMode()) {
      const store = getDemoStore();
      const doc = { _id: nextDemoId("m"), name, email, subject, message, read: false, createdAt: new Date().toISOString() };
      store.messages.unshift(doc);
      persistDemoStore();
      return jsonOk(doc, 201);
    }
    await connectDB();
    const doc = await ContactMessage.create({ name, email, subject, message });
    return jsonOk(doc, 201);
  } catch (e) {
    return jsonError("Failed to send message", 500);
  }
}