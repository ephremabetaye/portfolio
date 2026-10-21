import { connectDB } from "@/lib/mongodb";
import { ContactMessage } from "@/models/ContactMessage";
import { getAdminSession } from "@/lib/auth";
import { jsonError, jsonOk } from "@/lib/utilities";
import { getDemoStore, isDemoMode, persistDemoStore } from "@/lib/demo-store";
import { getEmailjsConfig, isEmailjsConfigured, sendReplyToUser } from "@/lib/email";
import { isValidObjectId } from "mongoose";

type Ctx = { params: Promise<{ id: string }> };

/** Send a reply email to the person who wrote the message (Admin → Messages). */
export async function POST(req: Request, { params }: Ctx) {
  const session = await getAdminSession();
  if (!session) return jsonError("Unauthorized", 401);
  const { id } = await params;

  const body = await req.json().catch(() => ({}));
  const replyBody = String(body?.message || "").trim();
  if (!replyBody) return jsonError("Reply message is required", 400);
  if (replyBody.length > 5000) return jsonError("Reply too long", 400);

  const config = await getEmailjsConfig();
  if (!isEmailjsConfigured(config)) {
    return jsonError("Email is not configured yet. Add your EmailJS details in Admin → Settings.", 400);
  }

  try {
    if (isDemoMode()) {
      const store = getDemoStore();
      const msg = store.messages.find((m: any) => m._id === id);
      if (!msg) return jsonError("Not found", 404);
      const result = await sendReplyToUser(config, req, { name: msg.name, email: msg.email, subject: msg.subject, message: msg.message }, replyBody);
      if (!result.sent) return jsonError(result.error || "Failed to send reply email", 502);
      msg.replies = [...(msg.replies || []), { body: replyBody, sentAt: new Date().toISOString(), by: session }];
      msg.read = true;
      persistDemoStore();
      return jsonOk(msg);
    }

    if (!isValidObjectId(id)) return jsonError("Invalid id", 400);
    await connectDB();
    const msg = await ContactMessage.findById(id).lean();
    if (!msg) return jsonError("Not found", 404);

    const result = await sendReplyToUser(config, req, {
      name: msg.name,
      email: msg.email,
      subject: msg.subject,
      message: msg.message,
    }, replyBody);
    if (!result.sent) return jsonError(result.error || "Failed to send reply email", 502);

    const updated = await ContactMessage.findByIdAndUpdate(id, {
      $push: { replies: { body: replyBody, sentAt: new Date(), by: session } },
      $set: { read: true },
    }, { new: true }).lean();
    return jsonOk(updated);
  } catch (e) {
    return jsonError("Failed to send reply", 500);
  }
}
