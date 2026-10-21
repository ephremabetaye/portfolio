import { connectDB } from "@/lib/mongodb";
import { ContactMessage } from "@/models/ContactMessage";
import { getAdminSession } from "@/lib/auth";
import { jsonError, jsonOk, rateLimit, getClientIp } from "@/lib/utilities";
import { getDemoStore, isDemoMode, nextDemoId, persistDemoStore } from "@/lib/demo-store";
import { getEmailjsConfig, isEmailjsConfigured, sendAutoReply, sendOwnerNotification } from "@/lib/email";
import { getMongoUri } from "@/lib/env";

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
  // In production the demo store is intentionally disabled, so a missing
  // database would otherwise surface only as a generic "Failed to send message".
  if (!isDemoMode() && !getMongoUri()) {
    return jsonError(
      "Contact form is not connected to a database on this deployment. Add MONGODB_URI in Vercel → Project → Settings → Environment Variables and redeploy.",
      503
    );
  }
  try {
    const body = await req.json();
    const name = String(body?.name || "").trim();
    const email = String(body?.email || "").trim();
    const subject = String(body?.subject || "").trim();
    const message = String(body?.message || "").trim();
    const lang = body?.lang === "am" ? "am" : "en";
    if (!name || !email || !message) return jsonError("Name, email, and message are required", 400);
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return jsonError("Invalid email", 400);
    if (message.length > 5000) return jsonError("Message too long", 400);

    // 1) Always store the message first — it shows up in Admin → Messages.
    let doc: any;
    if (isDemoMode()) {
      const store = getDemoStore();
      doc = { _id: nextDemoId("m"), name, email, subject, message, read: false, notified: false, autoReplySent: false, replies: [], createdAt: new Date().toISOString() };
      store.messages.unshift(doc);
      persistDemoStore();
    } else {
      await connectDB();
      doc = await ContactMessage.create({ name, email, subject, message });
    }

    // 2) Email from the server: a notification to the site owner and an
    //    automatic reply to the sender's own email address. Failures are
    //    reported in the response but never lose the stored message.
    const config = await getEmailjsConfig();
    const status = { configured: isEmailjsConfigured(config), notified: false, autoReplied: false, error: "" };
    if (status.configured) {
      const target = { name, email, subject, message };
      // Send one after another: two simultaneous sends through the same
      // Gmail-backed EmailJS service can fail with transient API errors.
      const notifyResult = await sendOwnerNotification(config, req, target);
      const autoReplyResult = await sendAutoReply(config, req, target, lang);
      status.notified = notifyResult.sent;
      status.autoReplied = autoReplyResult.sent;
      status.error = autoReplyResult.error || notifyResult.error || "";
      if (isDemoMode()) {
        doc.notified = status.notified;
        doc.autoReplySent = status.autoReplied;
        persistDemoStore();
      } else {
        await ContactMessage.findByIdAndUpdate(doc._id, {
          $set: { notified: status.notified, autoReplySent: status.autoReplied },
        }).catch(() => {});
      }
    }

    return jsonOk({ message: doc, email: status }, 201);
  } catch (e) {
    console.error("Contact form error:", e);
    return jsonError("Failed to send message. The database connection failed; check MONGODB_URI and MongoDB Atlas network access.", 500);
  }
}

/** Bulk action: mark every message as read. */
export async function PUT(req: Request) {
  const session = await getAdminSession();
  if (!session) return jsonError("Unauthorized", 401);
  try {
    const body = await req.json().catch(() => ({}));
    if (!body?.markAllRead) return jsonError("Nothing to do", 400);
    if (isDemoMode()) {
      const store = getDemoStore();
      for (const m of store.messages) m.read = true;
      persistDemoStore();
      return jsonOk({ updated: store.messages.length });
    }
    await connectDB();
    const res = await ContactMessage.updateMany({ read: false }, { $set: { read: true } });
    return jsonOk({ updated: res.modifiedCount ?? 0 });
  } catch (e) {
    return jsonError("Failed to update messages", 500);
  }
}