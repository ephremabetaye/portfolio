"use client";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Save } from "lucide-react";
import MediaUrlField from "@/components/admin/MediaUrlField";
import { mediaLinkError } from "@/lib/media";

export default function AdminSettings() {
  const [s, setS] = useState<any>({});
  const [projects, setProjects] = useState<any[]>([]);
  const [orig, setOrig] = useState<any>({}); // original media links (legacy values may be kept untouched)
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch("/api/settings").then(r => r.json()).then(d => {
      setS(d.data || {});
      setOrig({ showreelUrl: d.data?.showreelUrl || "" });
    }).catch(()=>{});
    fetch("/api/projects?all=1").then(r => r.json()).then(d => setProjects(d.data || [])).catch(()=>{});
  }, []);

  function set(k: string, v: any) { setS((p: any) => ({ ...p, [k]: v })); }
  function setLang(k: string, lang: string, v: string) { setS((p: any) => ({ ...p, [k]: { ...(p[k] || {}), [lang]: v } })); }

  async function save() {
    const reelError = mediaLinkError("video", s.showreelUrl, orig.showreelUrl);
    if (reelError) return toast.error(reelError);
    setSaving(true);
    try {
      const r = await fetch("/api/settings", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(s) });
      const d = await r.json();
      if (r.ok && d.success) { setS(d.data); toast.success("Settings saved"); }
      else toast.error(d.error || "Failed");
    } catch { toast.error("Failed"); }
    finally { setSaving(false); }
  }

  const featured: string[] = Array.isArray(s.featuredProjectIds) ? s.featuredProjectIds : [];
  function toggleFeatured(id: string) {
    set("featuredProjectIds", featured.includes(id) ? featured.filter(x=>x!==id) : [...featured, id]);
  }

  return (
    <div className="max-w-4xl">
      <h1 className="text-2xl font-bold mb-6">Homepage & Site Settings</h1>
      <div className="space-y-6">
        <Section title="Brand & SEO">
          <Grid>
            <Input label="Site Name" value={s.siteName || ""} onChange={(v: any)=>set("siteName",v)} />
            <Input label="Logo Text" value={s.logoText || ""} onChange={(v: any)=>set("logoText",v)} />
            <Input label="Accent Color" value={s.accentColor || "#7c5cff"} onChange={(v: any)=>set("accentColor",v)} />
            <Input label="Default Language" value={s.defaultLanguage || "en"} onChange={(v: any)=>set("defaultLanguage",v)} />
            <Input label="Contact Email" value={s.contactEmail || ""} onChange={(v: any)=>set("contactEmail",v)} />
            <MediaUrlField
              label="Showreel (link)"
              kind="video"
              value={s.showreelUrl || ""}
              onChange={(v: string)=>set("showreelUrl",v)}
              original={orig.showreelUrl}
              hint="Paste a YouTube link or a Google Cloud / Google Drive video link."
            />
            <Input label="SEO Title" value={s.seoTitle || ""} onChange={(v: any)=>set("seoTitle",v)} full />
            <Input label="SEO Description" value={s.seoDescription || ""} onChange={(v: any)=>set("seoDescription",v)} full />
          </Grid>
        </Section>

        <Section title="Hero Section">
          <LangField label="Heading (EN)" value={s.heroHeading?.en || ""} onChange={(v: any)=>setLang("heroHeading","en",v)} />
          <LangField label="Heading (AM)" value={s.heroHeading?.am || ""} onChange={(v: any)=>setLang("heroHeading","am",v)} />
          <LangField label="Subtitle (EN)" value={s.heroSubtitle?.en || ""} onChange={(v: any)=>setLang("heroSubtitle","en",v)} />
          <LangField label="Subtitle (AM)" value={s.heroSubtitle?.am || ""} onChange={(v: any)=>setLang("heroSubtitle","am",v)} />
          <LangField label="Intro (EN)" value={s.introText?.en || ""} onChange={(v: any)=>setLang("introText","en",v)} />
          <LangField label="Intro (AM)" value={s.introText?.am || ""} onChange={(v: any)=>setLang("introText","am",v)} />
          <Grid>
            <Input label="Primary Button Text (EN)" value={s.primaryButtonText?.en || ""} onChange={(v: any)=>setLang("primaryButtonText","en",v)} />
            <Input label="Primary Button Text (AM)" value={s.primaryButtonText?.am || ""} onChange={(v: any)=>setLang("primaryButtonText","am",v)} />
            <Input label="Primary Button Link" value={s.primaryButtonLink || "/projects"} onChange={(v: any)=>set("primaryButtonLink",v)} />
            <Input label="Secondary Button Text (EN)" value={s.secondaryButtonText?.en || ""} onChange={(v: any)=>setLang("secondaryButtonText","en",v)} />
            <Input label="Secondary Button Text (AM)" value={s.secondaryButtonText?.am || ""} onChange={(v: any)=>setLang("secondaryButtonText","am",v)} />
            <Input label="Secondary Button Link" value={s.secondaryButtonLink || "/contact"} onChange={(v: any)=>set("secondaryButtonLink",v)} />
          </Grid>
        </Section>

        <Section title="About Section">
          <LangField label="About Heading (EN)" value={s.aboutHeading?.en || ""} onChange={(v: any)=>setLang("aboutHeading","en",v)} />
          <LangField label="About Heading (AM)" value={s.aboutHeading?.am || ""} onChange={(v: any)=>setLang("aboutHeading","am",v)} />
          <LangField label="About Text (EN)" value={s.aboutText?.en || ""} onChange={(v: any)=>setLang("aboutText","en",v)} />
          <LangField label="About Text (AM)" value={s.aboutText?.am || ""} onChange={(v: any)=>setLang("aboutText","am",v)} />
        </Section>

        <Section title="Contact CTA">
          <LangField label="CTA Heading (EN)" value={s.contactCtaHeading?.en || ""} onChange={(v: any)=>setLang("contactCtaHeading","en",v)} />
          <LangField label="CTA Heading (AM)" value={s.contactCtaHeading?.am || ""} onChange={(v: any)=>setLang("contactCtaHeading","am",v)} />
          <LangField label="CTA Text (EN)" value={s.contactCtaText?.en || ""} onChange={(v: any)=>setLang("contactCtaText","en",v)} />
          <LangField label="CTA Text (AM)" value={s.contactCtaText?.am || ""} onChange={(v: any)=>setLang("contactCtaText","am",v)} />
        </Section>

        <Section title="Footer">
          <LangField label="Footer Text (EN)" value={s.footerText?.en || ""} onChange={(v: any)=>setLang("footerText","en",v)} />
          <LangField label="Footer Text (AM)" value={s.footerText?.am || ""} onChange={(v: any)=>setLang("footerText","am",v)} />
        </Section>

        <Section title="Featured Projects">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {projects.map((p:any) => (
              <label key={p._id} className="flex items-center gap-2 text-sm px-3 py-2 rounded-lg bg-[color:var(--bg)] border border-[color:var(--border)] cursor-pointer">
                <input type="checkbox" checked={featured.includes(p._id)} onChange={()=>toggleFeatured(p._id)} />
                {p.title?.en}
              </label>
            ))}
          </div>
        </Section>

        <Section title="Social Links (Settings)">
          <Grid>
            {["instagram","youtube","vimeo","linkedin","twitter","whatsapp","email","website"].map(k => (
              <Input key={k} label={k} value={s.social?.[k] || ""} onChange={(v: any)=>set("social", { ...s.social, [k]: v })} />
            ))}
          </Grid>
        </Section>

        <Section title="EmailJS (contact form email)">
          <p className="text-xs text-[color:var(--muted)] leading-relaxed">
            Every contact message is always saved in <b>Admin → Messages</b>. To also receive it by email, create a free account at
            emailjs.com, add an email service and a template (template variables: {"{{from_name}}"}, {"{{from_email}}"}, {"{{reply_to}}"}, {"{{subject}}"}, {"{{message}}"}, {"{{to_email}}"}),
            then paste the IDs below.
          </p>
          <Grid>
            <Input label="Service ID" value={s.emailjs?.serviceId || ""} onChange={(v: any)=>set("emailjs", { ...s.emailjs, serviceId: v })} />
            <Input label="Template ID" value={s.emailjs?.templateId || ""} onChange={(v: any)=>set("emailjs", { ...s.emailjs, templateId: v })} />
            <Input label="Public Key" value={s.emailjs?.publicKey || ""} onChange={(v: any)=>set("emailjs", { ...s.emailjs, publicKey: v })} />
            <Input label="Send To Email" value={s.emailjs?.toEmail || ""} onChange={(v: any)=>set("emailjs", { ...s.emailjs, toEmail: v })} />
          </Grid>
        </Section>

        <button onClick={save} disabled={saving} className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[color:var(--accent)] hover:opacity-90 disabled:opacity-50">
          <Save size={18}/>{saving ? "Saving..." : "Save Settings"}
        </button>
      </div>
    </div>
  );
}

function Section({ title, children }: any) { return (<div className="rounded-2xl border border-[color:var(--border)] bg-[color:var(--surface)] p-5"><h2 className="font-semibold mb-4">{title}</h2><div className="space-y-4">{children}</div></div>); }
function Grid({ children }: any) { return <div className="grid grid-cols-1 md:grid-cols-2 gap-4">{children}</div>; }
function Input({ label, value, onChange, full }: any) { return (<div className={full ? "md:col-span-2" : ""}><label className="text-xs text-[color:var(--muted)]">{label}</label><input value={value} onChange={(e: any)=>onChange(e.target.value)} className="mt-1 w-full px-3 py-2.5 rounded-xl bg-[color:var(--bg)] border border-[color:var(--border)] outline-none focus:border-[color:var(--accent)]" /></div>); }
function LangField({ label, value, onChange }: any) { return (<div><label className="text-xs text-[color:var(--muted)]">{label}</label><textarea value={value} onChange={(e: any)=>onChange(e.target.value)} rows={3} className="mt-1 w-full px-3 py-2.5 rounded-xl bg-[color:var(--bg)] border border-[color:var(--border)] outline-none focus:border-[color:var(--accent)]" /></div>); }
