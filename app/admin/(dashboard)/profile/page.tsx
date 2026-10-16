"use client";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Save } from "lucide-react";
import MediaUrlField from "@/components/admin/MediaUrlField";
import { mediaLinkError } from "@/lib/media";

type ProfileState = any;

export default function AdminProfile() {
  const [p, setP] = useState<ProfileState>({});
  const [orig, setOrig] = useState<any>({}); // original media links (legacy values may be kept untouched)
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch("/api/profile").then(r => r.json()).then(d => {
      setP(d.data || {});
      setOrig({ image: d.data?.image || "" });
    }).catch(()=>{});
  }, []);

  function set<K extends string>(k: K, v: any) { setP((prev: any) => ({ ...prev, [k]: v })); }

  async function save() {
    const imgError = mediaLinkError("image", p.image, orig.image);
    if (imgError) return toast.error(imgError);
    setSaving(true);
    try {
      const payload = {
        ...p,
        services: toArray(p.services),
        tools: toArray(p.tools),
        achievements: toArray(p.achievements),
        bio: p.bio || { en: "", am: "" },
        philosophy: p.philosophy || { en: "", am: "" },
      };
      const r = await fetch("/api/profile", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      const d = await r.json();
      if (r.ok && d.success) { setP(d.data); toast.success("Profile saved"); }
      else toast.error(d.error || "Failed");
    } catch { toast.error("Failed"); }
    finally { setSaving(false); }
  }

  return (
    <div className="max-w-4xl">
      <h1 className="text-2xl font-bold mb-6">Profile Management</h1>
      <div className="space-y-6">
        <Section title="Basic">
          <Grid>
            <Input label="Name" value={p.name || ""} onChange={(v: any)=>set("name",v)} />
            <Input label="Title" value={p.title || ""} onChange={(v: any)=>set("title",v)} />
            <Input label="Years Experience" value={p.yearsExperience ?? 0} onChange={(v: any)=>set("yearsExperience", Number(v))} type="number" />
            <Input label="Contact Email" value={p.contactEmail || ""} onChange={(v: any)=>set("contactEmail",v)} />
            <Input label="Phone" value={p.phone || ""} onChange={(v: any)=>set("phone",v)} />
            <Input label="Location" value={p.location || ""} onChange={(v: any)=>set("location",v)} />
            <MediaUrlField
              label="Profile Photo (link)"
              kind="image"
              value={p.image || ""}
              onChange={(v: string)=>set("image",v)}
              original={orig.image}
              hint="Google Cloud Storage / Google Drive image link. A YouTube link also works — its video thumbnail is used as the photo."
              full
            />
            <Input label="Resume URL" value={p.resumeUrl || ""} onChange={(v: any)=>set("resumeUrl",v)} full />
          </Grid>
        </Section>

        <Section title="Biography">
          <LangField label="English" value={p.bio?.en || ""} onChange={(v: any)=>set("bio", { ...p.bio, en: v })} />
          <LangField label="Amharic" value={p.bio?.am || ""} onChange={(v: any)=>set("bio", { ...p.bio, am: v })} />
        </Section>

        <Section title="Philosophy / Approach">
          <LangField label="English" value={p.philosophy?.en || ""} onChange={(v: any)=>set("philosophy", { ...p.philosophy, en: v })} />
          <LangField label="Amharic" value={p.philosophy?.am || ""} onChange={(v: any)=>set("philosophy", { ...p.philosophy, am: v })} />
        </Section>

        <Section title="Services / Tools / Achievements">
          <Input label="Services (comma separated)" value={toArray(p.services).join(", ")} onChange={(v: any)=>set("services", v)} full />
          <Input label="Tools (comma separated)" value={toArray(p.tools).join(", ")} onChange={(v: any)=>set("tools", v)} full />
          <Input label="Achievements (comma separated)" value={toArray(p.achievements).join(", ")} onChange={(v: any)=>set("achievements", v)} full />
        </Section>

        <Section title="Social Links">
          <Grid>
            {["instagram","youtube","vimeo","linkedin","twitter","whatsapp","email","website"].map(k => (
              <Input key={k} label={k} value={p.social?.[k] || ""} onChange={(v: any)=>set("social", { ...p.social, [k]: v })} />
            ))}
          </Grid>
        </Section>

        <button onClick={save} disabled={saving} className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[color:var(--accent)] hover:opacity-90 disabled:opacity-50">
          <Save size={18}/>{saving ? "Saving..." : "Save Profile"}
        </button>
      </div>
    </div>
  );
}

function Section({ title, children }: any) { return (<div className="rounded-2xl border border-[color:var(--border)] bg-[color:var(--surface)] p-5"><h2 className="font-semibold mb-4">{title}</h2><div className="space-y-4">{children}</div></div>); }
function Grid({ children }: any) { return <div className="grid grid-cols-1 md:grid-cols-2 gap-4">{children}</div>; }
function Input({ label, value, onChange, full, type="text" }: any) { return (<div className={full ? "md:col-span-2" : ""}><label className="text-xs text-[color:var(--muted)]">{label}</label><input type={type} value={value} onChange={(e: any)=>onChange(e.target.value)} className="mt-1 w-full px-3 py-2.5 rounded-xl bg-[color:var(--bg)] border border-[color:var(--border)] outline-none focus:border-[color:var(--accent)]" /></div>); }
function LangField({ label, value, onChange }: any) { return (<div><label className="text-xs text-[color:var(--muted)]">{label}</label><textarea value={value} onChange={(e: any)=>onChange(e.target.value)} rows={4} className="mt-1 w-full px-3 py-2.5 rounded-xl bg-[color:var(--bg)] border border-[color:var(--border)] outline-none focus:border-[color:var(--accent)]" /></div>); }
function toArray(v: any): string[] { if (Array.isArray(v)) return v; if (typeof v === "string") return v.split(",").map(s=>s.trim()).filter(Boolean); return []; }
