import { getDemoStore, isDemoMode } from "./demo-store";
import { connectDB } from "./mongodb";
import { SiteSettings } from "@/models/SiteSettings";

const EMAILJS_API = "https://api.emailjs.com/api/v1.0/email/send";

export type EmailjsConfig = {
  serviceId: string;
  templateId: string;
  autoReplyTemplateId: string;
  publicKey: string;
  privateKey: string;
  toEmail: string;
  replyTo: string;
  siteName: string;
};

export type ContactLike = {
  name?: string;
  email: string;
  subject?: string;
  message: string;
};

export type EmailResult = { sent: boolean; error?: string };

async function loadSettings(): Promise<Record<string, any>> {
  if (isDemoMode()) return (getDemoStore().settings || {}) as Record<string, any>;
  try {
    await connectDB();
    const settings = await SiteSettings.findOne().lean();
    return (settings as Record<string, any>) || {};
  } catch {
    return {};
  }
}

/** Email config: Admin → Settings takes priority, then environment variables. */
export async function getEmailjsConfig(): Promise<EmailjsConfig> {
  const settings = await loadSettings();
  const e = (settings.emailjs || {}) as Record<string, any>;
  const toEmail = String(
    e.toEmail || process.env.EMAILJS_TO_EMAIL || process.env.ADMIN_EMAIL || settings.contactEmail || ""
  ).trim();
  return {
    serviceId: String(e.serviceId || process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID || process.env.EMAILJS_SERVICE_ID || "").trim(),
    templateId: String(e.templateId || process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID || process.env.EMAILJS_TEMPLATE_ID || "").trim(),
    autoReplyTemplateId: String(e.autoReplyTemplateId || process.env.EMAILJS_AUTO_REPLY_TEMPLATE_ID || "").trim(),
    publicKey: String(e.publicKey || process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY || process.env.EMAILJS_PUBLIC_KEY || "").trim(),
    privateKey: String(process.env.EMAILJS_PRIVATE_KEY || "").trim(),
    toEmail,
    replyTo: String(process.env.ADMIN_EMAIL || toEmail || settings.contactEmail || "").trim(),
    siteName: String(settings.siteName || "Portfolio"),
  };
}

export function isEmailjsConfigured(config: EmailjsConfig) {
  return !!(config.serviceId && config.publicKey && (config.templateId || config.autoReplyTemplateId));
}

/**
 * EmailJS rejects requests that do not look like they come from a browser.
 * Sending the site's Origin/Referer headers keeps server-side calls working
 * with just the public key (a private key can still be set via EMAILJS_PRIVATE_KEY).
 */
function siteOrigin(req?: Request) {
  const origin = req?.headers.get("origin") || process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  return origin.replace(/\/+$/, "");
}

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Send via the EmailJS REST API. Gmail-backed services occasionally fail with
 * transient "Internal error encountered" responses, so failed sends are retried
 * with a short backoff before giving up.
 */
async function emailjsSend(config: EmailjsConfig, templateId: string, params: Record<string, string>, origin: string, attempts = 3) {
  if (!templateId) throw new Error("No EmailJS template configured");
  let lastError: Error | undefined;
  for (let attempt = 1; attempt <= attempts; attempt++) {
    try {
      const res = await fetch(EMAILJS_API, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Origin: origin,
          Referer: `${origin}/`,
        },
        body: JSON.stringify({
          service_id: config.serviceId,
          template_id: templateId,
          user_id: config.publicKey,
          ...(config.privateKey ? { accessToken: config.privateKey } : {}),
          template_params: params,
        }),
      });
      if (res.ok) return;
      const detail = (await res.text().catch(() => "")).trim();
      lastError = new Error(detail || `EmailJS request failed (${res.status})`);
    } catch (err) {
      lastError = err instanceof Error ? err : new Error("EmailJS request failed");
    }
    if (attempt < attempts) await sleep(700 * attempt);
  }
  throw lastError || new Error("EmailJS request failed");
}

function autoReplySubject(siteName: string, lang: "en" | "am") {
  return lang === "am" ? `ስለ መልዕክትዎ እናመሰግናለን — ${siteName}` : `Thanks for contacting ${siteName}`;
}

export function buildAutoReplyText(message: ContactLike, siteName: string, lang: "en" | "am" = "en") {
  const name = (message.name || "").trim();
  const body = message.message.trim();
  if (lang === "am") {
    return [
      name ? `ሰላም ${name}፣` : "ሰላም፣",
      "",
      `${siteName}ን ስለተገኙ እናመሰግናለን። ይህ መልዕክትዎ መደረሱን የሚያረጋግጥ ራስ-ሰር ምላሽ ነው፤ በተቻለ ፍጥነት በእራሴ እመልስልዎታለሁ።`,
      "",
      "የላኩት መልዕክት፦",
      body,
      "",
      "ከሰላምታ ጋር፣",
      siteName,
    ].join("\n");
  }
  return [
    name ? `Hi ${name},` : "Hi there,",
    "",
    `Thanks for contacting ${siteName}! This is an automatic confirmation that your message has been received — I will get back to you personally as soon as possible.`,
    "",
    "Your message:",
    body,
    "",
    "Best regards,",
    siteName,
  ].join("\n");
}

/** Notify the site owner about a new contact message. */
export async function sendOwnerNotification(
  config: EmailjsConfig,
  req: Request | undefined,
  message: ContactLike
): Promise<EmailResult> {
  if (!config.templateId) return { sent: false, error: "No notification template configured" };
  if (!config.toEmail) return { sent: false, error: "No notification address configured (set Send To Email in Admin → Settings or ADMIN_EMAIL in .env)" };
  try {
    await emailjsSend(config, config.templateId, {
      from_name: message.name || "",
      from_email: message.email,
      reply_to: message.email,
      subject: message.subject || `New message from ${message.name || message.email}`,
      message: message.message,
      to_email: config.toEmail,
      site_name: config.siteName,
    }, siteOrigin(req));
    return { sent: true };
  } catch (err) {
    return { sent: false, error: err instanceof Error ? err.message : "Failed to send notification email" };
  }
}

/** Automatic confirmation email to the person who submitted the form. */
export async function sendAutoReply(
  config: EmailjsConfig,
  req: Request | undefined,
  message: ContactLike,
  lang: "en" | "am" = "en"
): Promise<EmailResult> {
  const templateId = config.autoReplyTemplateId || config.templateId;
  if (!templateId) return { sent: false, error: "No auto-reply template configured" };
  if (!message.email) return { sent: false, error: "No recipient email" };
  try {
    await emailjsSend(config, templateId, {
      to_email: message.email,
      to_name: message.name || "",
      from_name: config.siteName,
      from_email: config.replyTo || config.toEmail,
      reply_to: config.replyTo || config.toEmail,
      subject: autoReplySubject(config.siteName, lang),
      message: buildAutoReplyText(message, config.siteName, lang),
      original_subject: message.subject || "",
      original_message: message.message,
      site_name: config.siteName,
    }, siteOrigin(req));
    return { sent: true };
  } catch (err) {
    return { sent: false, error: err instanceof Error ? err.message : "Failed to send auto-reply email" };
  }
}

/** A reply written by the admin in Admin → Messages. */
export async function sendReplyToUser(
  config: EmailjsConfig,
  req: Request | undefined,
  message: ContactLike,
  replyBody: string
): Promise<EmailResult> {
  const templateId = config.autoReplyTemplateId || config.templateId;
  if (!templateId) return { sent: false, error: "No reply template configured" };
  if (!message.email) return { sent: false, error: "No recipient email" };
  const raw = (message.subject || "").trim();
  const subject = raw ? `Re: ${raw.replace(/^(re:\s*)+/i, "")}` : `Re: your message to ${config.siteName}`;
  const quoted = message.message.split(/\r?\n/).map((line) => `> ${line}`).join("\n");
  const text = `${replyBody.trim()}\n\n---\nOn ${new Date().toUTCString()}, ${message.name || message.email} wrote:\n\n${quoted}`;
  try {
    await emailjsSend(config, templateId, {
      to_email: message.email,
      to_name: message.name || "",
      from_name: config.siteName,
      from_email: config.replyTo || config.toEmail,
      reply_to: config.replyTo || config.toEmail,
      subject,
      message: text,
      original_subject: message.subject || "",
      original_message: message.message,
      site_name: config.siteName,
    }, siteOrigin(req));
    return { sent: true };
  } catch (err) {
    return { sent: false, error: err instanceof Error ? err.message : "Failed to send reply email" };
  }
}
