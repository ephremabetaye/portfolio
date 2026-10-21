import mongoose from "mongoose";

const ReplySchema = new mongoose.Schema({
  body: { type: String, required: true },
  sentAt: { type: Date, default: Date.now },
  by: { type: String, default: "" },
}, { _id: false });

const ContactMessageSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  subject: { type: String, default: "" },
  message: { type: String, required: true },
  read: { type: Boolean, default: false },
  notified: { type: Boolean, default: false },
  autoReplySent: { type: Boolean, default: false },
  replies: { type: [ReplySchema], default: [] },
}, { timestamps: true });

export const ContactMessage = mongoose.models.ContactMessage || mongoose.model("ContactMessage", ContactMessageSchema);
export default ContactMessage;
