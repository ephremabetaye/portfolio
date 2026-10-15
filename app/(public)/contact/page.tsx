"use client";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Mail, Phone, MapPin } from "lucide-react";
import { toast } from "sonner";
import { useLanguage, bi } from "@/components/providers/language-provider";

export default function ContactPage() {
  const { t, lang } = useLanguage();
  const [profile, setProfile] = useState<any>(null);
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string,string>>({});
  useEffect(() => { fetch("/api/profile").then(r => r.json()).then(d => setProfile(d.data)).catch(()=>{}); }, []);

  function validate() {
    const e: Record<string,string> = {};
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
      const r = await fetch("/api/contact", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
      const d = await r.json();
      if (r.ok && d.success) {
        toast.success(t("contact.successMsg"));
        setForm({ name: "", email: "", subject: "", message: "" });
      } else {
        toast.error(d.error || t("contact.errorMsg"));
      }
    } catch {
      toast.error(t("contact.errorMsg"));
    } finally {
      setLoading(false);
    }
  }

  const social = profile?.social || {};
  return (
    <div className="container-x py-16">
      <h1 className="text-4xl md:text-5xl font-extrabold mb-2">{t("contact.title")}</h1>
      <p className="text-[color:var(--muted)] mb-10">{t("contact.subtitle")}</p>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1 space-y-4">
          <div className="rounded-2xl border border-[color:var(--border)] bg-[color:var(--surface)] p-5 space-y-4">
            <div className="flex items-center gap-3 text-sm break-all"><Mail size={16} className="text-[color:var(--accent)] shrink-0"/>{profile?.contactEmail || social.email}</div>
            <div className="flex items-center gap-3 text-sm"><Phone size={16} className="text-[color:var(--accent)]"/>{profile?.phone}</div>
            <div className="flex items-center gap-3 text-sm"><MapPin size={16} className="text-[color:var(--accent)]"/>{profile?.location}</div>
          </div>
          {social.whatsapp && <a href={social.whatsapp} target="_blank" rel="noreferrer" className="block text-center px-4 py-3 rounded-full bg-green-500/20 border border-green-500/30 hover:bg-green-500/30">WhatsApp</a>}
        </div>
        <motion.form onSubmit={submit} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="md:col-span-2 rounded-2xl border border-[color:var(--border)] bg-[color:var(--surface)] p-5 md:p-8 space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <Field label={t("contact.name")} value={form.name} onChange={(v: any)=>setForm({...form,name:v})} error={errors.name} />
            <Field label={t("contact.email")} value={form.email} onChange={(v: any)=>setForm({...form,email:v})} error={errors.email} type="email" />
          </div>
          <Field label={t("contact.subject")} value={form.subject} onChange={(v: any)=>setForm({...form,subject:v})} />
          <div>
            <label className="text-sm text-[color:var(--muted)]">{t("contact.message")}</label>
            <textarea value={form.message} onChange={(e: any)=>setForm({...form,message:e.target.value})} rows={6}
              className="mt-1 w-full px-3 py-2.5 rounded-xl bg-[color:var(--surface)] border border-[color:var(--border)] outline-none focus:border-[color:var(--accent)]" />
            {errors.message && <div className="text-xs text-red-400 mt-1">{errors.message}</div>}
          </div>
          <button type="submit" disabled={loading} className="px-6 py-3 rounded-full bg-[color:var(--accent)] hover:opacity-90 transition disabled:opacity-50">
            {loading ? t("common.loading") : t("contact.send")}
          </button>
        </motion.form>
      </div>
    </div>
  );
}

function Field({ label, value, onChange, error, type="text" }: any) {
  return (
    <div>
      <label className="text-sm text-[color:var(--muted)]">{label}</label>
      <input type={type} value={value} onChange={(e: any)=>onChange(e.target.value)}
        className="mt-1 w-full px-3 py-2.5 rounded-xl bg-[color:var(--surface)] border border-[color:var(--border)] outline-none focus:border-[color:var(--accent)]" />
      {error && <div className="text-xs text-red-400 mt-1">{error}</div>}
    </div>
  );
}
