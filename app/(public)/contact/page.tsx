"use client";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Mail, Phone, MapPin, CircleCheck, Send } from "lucide-react";
import emailjs from "@emailjs/browser";
import { toast } from "sonner";
import { useLanguage, bi } from "@/components/providers/language-provider";

const EMPTY_FORM = { name: "", email: "", subject: "", message: "" };

export default function ContactPage() {
  const { t, lang } = useLanguage();
  const [profile, setProfile] = useState<any>(null);
  const [settings, setSettings] = useState<any>({});
  const [form, setForm] = useState({ ...EMPTY_FORM });
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState<null | "email" | "saved" | "emailFailed">(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    fetch("/api/profile").then(r => r.json()).then(d => setProfile(d.data)).catch(() => {});
    fetch("/api/settings").then(r => r.json()).then(d => setSettings(d.data || {})).catch(() => {});
  }, []);

  // EmailJS config: set in Admin → Settings, or via NEXT_PUBLIC_EMAILJS_* env vars.
  const emailjsConfig = {
    serviceId: settings?.emailjs?.serviceId || process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID || "",
    templateId: settings?.emailjs?.templateId || process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID || "",
    publicKey: settings?.emailjs?.publicKey || process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY || "",
  };
  const emailjsReady = !!(emailjsConfig.serviceId && emailjsConfig.templateId && emailjsConfig.publicKey);
  const toEmail = settings?.emailjs?.toEmail || settings?.contactEmail || profile?.contactEmail || "";

  function validate() {
    const e: Record<string, string> = {};
    if (!form.name.trim()) e.name = "Required";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = "Valid email required";
    if (!form.message.trim()) e.message = "Required";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      // 1) Always store the message first — it shows up in Admin → Messages.
      const r = await fetch("/api/contact", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
      const d = await r.json();
      if (!(r.ok && d.success)) {
        toast.error(d.error || t("contact.errorMsg"));
        return;
      }

      const params = {
        from_name: form.name,
        from_email: form.email,
        reply_to: form.email,
        subject: form.subject || `New message from ${form.name}`,
        message: form.message,
        to_email: toEmail,
        site_name: settings?.siteName || "Portfolio",
      };
      setForm({ ...EMPTY_FORM });

      // 2) Email it through EmailJS (if configured). Failure never loses the message.
      if (emailjsReady) {
        try {
          await emailjs.send(emailjsConfig.serviceId, emailjsConfig.templateId, params, { publicKey: emailjsConfig.publicKey });
          setSent("email");
          toast.success(t("contact.emailReady"));
        } catch (err) {
          console.error("EmailJS send failed", err);
          setSent("emailFailed");
          toast.warning(t("contact.emailFailed"));
        }
      } else {
        setSent("saved");
        toast.success(t("contact.emailSkipped"));
      }
    } catch {
      toast.error(t("contact.errorMsg"));
    } finally {
      setLoading(false);
    }
  }

  const social = profile?.social || {};
  const contactEmail = profile?.contactEmail || social.email || settings?.contactEmail;

  return (
    <div className="container-x py-16">
      <h1 className="text-4xl md:text-5xl font-extrabold mb-2">{t("contact.title")}</h1>
      <p className="text-[color:var(--muted)] mb-10">{t("contact.subtitle")}</p>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1 space-y-4">
          <div className="rounded-2xl border border-[color:var(--border)] bg-[color:var(--surface)] p-5 space-y-4">
            <div className="text-xs uppercase tracking-widest text-[color:var(--muted)]">{t("contact.info")}</div>
            {contactEmail && (
              <a href={`mailto:${contactEmail}`} className="flex items-center gap-3 text-sm break-all hover:text-white">
                <Mail size={16} className="text-[color:var(--accent)] shrink-0" />{contactEmail}
              </a>
            )}
            {profile?.phone && <div className="flex items-center gap-3 text-sm"><Phone size={16} className="text-[color:var(--accent)] shrink-0" />{profile.phone}</div>}
            {profile?.location && <div className="flex items-center gap-3 text-sm"><MapPin size={16} className="text-[color:var(--accent)] shrink-0" />{profile.location}</div>}
          </div>
          {social.whatsapp && <a href={social.whatsapp} target="_blank" rel="noreferrer" className="block text-center px-4 py-3 rounded-full bg-green-500/20 border border-green-500/30 hover:bg-green-500/30">WhatsApp</a>}
        </div>

        {sent ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="md:col-span-2 rounded-2xl border border-[color:var(--border)] bg-[color:var(--surface)] p-8 flex flex-col items-center justify-center text-center min-h-[320px]"
          >
            <CircleCheck size={56} className={sent === "emailFailed" ? "text-amber-400" : "text-emerald-400"} />
            <h2 className="text-2xl font-bold mt-4">{t("contact.sentTitle")}</h2>
            <p className="text-[color:var(--muted)] mt-2 max-w-md">
              {sent === "email" ? t("contact.emailReady") : sent === "emailFailed" ? t("contact.emailFailed") : t("contact.emailSkipped")}
            </p>
            <button
              onClick={() => setSent(null)}
              className="inline-flex items-center gap-2 mt-6 px-6 py-3 rounded-full border border-[color:var(--border)] hover:bg-white/10 transition"
            >
              <Send size={16} /> {t("contact.another")}
            </button>
          </motion.div>
        ) : (
          <motion.form onSubmit={submit} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="md:col-span-2 rounded-2xl border border-[color:var(--border)] bg-[color:var(--surface)] p-5 md:p-8 space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <Field label={t("contact.name")} value={form.name} onChange={(v: any) => setForm({ ...form, name: v })} error={errors.name} />
              <Field label={t("contact.email")} value={form.email} onChange={(v: any) => setForm({ ...form, email: v })} error={errors.email} type="email" />
            </div>
            <Field label={t("contact.subject")} value={form.subject} onChange={(v: any) => setForm({ ...form, subject: v })} />
            <div>
              <label className="text-sm text-[color:var(--muted)]">{t("contact.message")}</label>
              <textarea value={form.message} onChange={(e: any) => setForm({ ...form, message: e.target.value })} rows={6}
                className="mt-1 w-full px-3 py-2.5 rounded-xl bg-[color:var(--surface)] border border-[color:var(--border)] outline-none focus:border-[color:var(--accent)]" />
              {errors.message && <div className="text-xs text-red-400 mt-1">{errors.message}</div>}
            </div>
            <button type="submit" disabled={loading} className="px-6 py-3 rounded-full bg-[color:var(--accent)] hover:opacity-90 transition disabled:opacity-50">
              {loading ? t("common.loading") : t("contact.send")}
            </button>
          </motion.form>
        )}
      </div>
    </div>
  );
}

function Field({ label, value, onChange, error, type = "text" }: any) {
  return (
    <div>
      <label className="text-sm text-[color:var(--muted)]">{label}</label>
      <input type={type} value={value} onChange={(e: any) => onChange(e.target.value)}
        className="mt-1 w-full px-3 py-2.5 rounded-xl bg-[color:var(--surface)] border border-[color:var(--border)] outline-none focus:border-[color:var(--accent)]" />
      {error && <div className="text-xs text-red-400 mt-1">{error}</div>}
    </div>
  );
}
