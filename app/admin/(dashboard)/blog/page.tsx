"use client";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, Eye, EyeOff } from "lucide-react";
import MediaUrlField from "@/components/admin/MediaUrlField";
import { mediaLinkError } from "@/lib/media";

export default function AdminBlog() {
  const [items, setItems] = useState<any[]>([]);
  const [modal, setModal] = useState<any>(null);
  const [orig, setOrig] = useState<any>({}); // original media links (legacy values may be kept untouched)
  const [saving, setSaving] = useState(false);
  const [tab, setTab] = useState<"en" | "am">("en");

  async function load() {
    const r = await fetch("/api/blog?all=1").then(x => x.json());
    setItems(r.data || []);
  }
  useEffect(() => { load(); }, []);

  function newItem() { setOrig({}); setModal({ title: { en: "", am: "" }, excerpt: { en: "", am: "" }, content: { en: "", am: "" }, slug: "", featuredImage: "", author: "Amanuel Bekele", categories: "", tags: "", published: false }); }
  function editItem(it: any) {
    setOrig({ featuredImage: it.featuredImage || "" });
    setModal({ ...it, categories: (it.categories || []).join(", "), tags: (it.tags || []).join(", ") });
  }

  async function save() {
    const imgError = mediaLinkError("image", modal.featuredImage, orig.featuredImage);
    if (imgError) return toast.error(imgError);
    setSaving(true);
    try {
      const body = {
        ...modal,
        categories: String(modal.categories || "").split(",").map((s:string)=>s.trim()).filter(Boolean),
        tags: String(modal.tags || "").split(",").map((s:string)=>s.trim()).filter(Boolean),
      };
      const url = modal._id ? `/api/blog/${modal._id}` : "/api/blog";
      const method = modal._id ? "PUT" : "POST";
      const r = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      const d = await r.json();
      if (r.ok && d.success) { toast.success("Saved"); setModal(null); load(); }
      else toast.error(d.error || "Failed");
    } catch { toast.error("Failed"); }
    finally { setSaving(false); }
  }

  async function del(id: string) {
    if (!confirm("Delete article?")) return;
    const r = await fetch(`/api/blog/${id}`, { method: "DELETE" }).then(x=>x.json());
    if (r.success) { toast.success("Deleted"); load(); } else toast.error(r.error);
  }

  async function toggle(it: any) {
    await fetch(`/api/blog/${it._id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ published: !it.published }) });
    load();
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Blog</h1>
        <button onClick={newItem} className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[color:var(--accent)] hover:opacity-90"><Plus size={16}/>New Article</button>
      </div>
      <div className="space-y-3">
        {items.map(it => (
          <div key={it._id} className="rounded-xl border border-[color:var(--border)] bg-[color:var(--surface)] p-4 flex items-center justify-between gap-4">
            <div className="min-w-0">
              <div className="font-semibold truncate">{it.title?.en}</div>
              <div className="text-xs text-[color:var(--muted)]">{(it.categories||[]).join(", ")} · {it.author}</div>
            </div>
            <div className="flex gap-1 shrink-0">
              <button onClick={()=>toggle(it)} className="p-1.5 rounded-lg hover:bg-white/10">{it.published ? <Eye size={14}/> : <EyeOff size={14}/>}</button>
              <button onClick={()=>editItem(it)} className="p-1.5 rounded-lg hover:bg-white/10"><Pencil size={14}/></button>
              <button onClick={()=>del(it._id)} className="p-1.5 rounded-lg hover:bg-red-500/10 text-red-400"><Trash2 size={14}/></button>
            </div>
          </div>
        ))}
      </div>

      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-4xl max-h-[90vh] overflow-auto rounded-2xl bg-[color:var(--surface)] border border-[color:var(--border)] p-6">
            <h2 className="text-xl font-bold mb-4">{modal._id ? "Edit Article" : "New Article"}</h2>
            <div className="flex gap-2 mb-4">
              <button onClick={()=>setTab("en")} className={`px-3 py-1.5 rounded-lg text-sm ${tab==="en" ? "bg-[color:var(--accent)]" : "bg-white/5"}`}>English</button>
              <button onClick={()=>setTab("am")} className={`px-3 py-1.5 rounded-lg text-sm ${tab==="am" ? "bg-[color:var(--accent)]" : "bg-white/5"}`}>Amharic</button>
            </div>
            <div className="space-y-4">
              {tab === "en" ? (
                <>
                  <Field label="Title (EN)" value={modal.title?.en || ""} onChange={(v: any)=>setM("title", { ...modal.title, en: v })} />
                  <Field label="Slug" value={modal.slug || ""} onChange={(v: any)=>setM("slug", v)} />
                  <MediaUrlField
                    label="Featured Image (link)"
                    kind="image"
                    value={modal.featuredImage || ""}
                    onChange={(v: string)=>setM("featuredImage", v)}
                    original={orig.featuredImage}
                    hint="Google Cloud Storage / Google Drive image link. A YouTube link also works — its video thumbnail is used as the image."
                  />
                  <Field label="Author" value={modal.author || ""} onChange={(v: any)=>setM("author", v)} />
                  <Field label="Categories (comma)" value={modal.categories || ""} onChange={(v: any)=>setM("categories", v)} />
                  <Field label="Tags (comma)" value={modal.tags || ""} onChange={(v: any)=>setM("tags", v)} />
                  <Field label="Excerpt (EN)" value={modal.excerpt?.en || ""} onChange={(v: any)=>setM("excerpt", { ...modal.excerpt, en: v })} />
                  <TextArea label="Content (EN)" value={modal.content?.en || ""} onChange={(v: any)=>setM("content", { ...modal.content, en: v })} rows={12} />
                </>
              ) : (
                <>
                  <Field label="Title (AM)" value={modal.title?.am || ""} onChange={(v: any)=>setM("title", { ...modal.title, am: v })} />
                  <Field label="Excerpt (AM)" value={modal.excerpt?.am || ""} onChange={(v: any)=>setM("excerpt", { ...modal.excerpt, am: v })} />
                  <TextArea label="Content (AM)" value={modal.content?.am || ""} onChange={(v: any)=>setM("content", { ...modal.content, am: v })} rows={12} />
                </>
              )}
              <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={!!modal.published} onChange={(e: any)=>setM("published", e.target.checked)}/>Published</label>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button onClick={()=>setModal(null)} className="px-4 py-2 rounded-xl border border-[color:var(--border)] hover:bg-white/10">Cancel</button>
              <button onClick={save} disabled={saving} className="px-4 py-2 rounded-xl bg-[color:var(--accent)] hover:opacity-90 disabled:opacity-50">{saving ? "Saving..." : "Save"}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
  function setM(k:string,v:any){ setModal((p:any)=>({...p,[k]:v})); }
}
function Field({ label, value, onChange }: any) { return (<div><label className="text-xs text-[color:var(--muted)]">{label}</label><input value={value} onChange={(e: any)=>onChange(e.target.value)} className="mt-1 w-full px-3 py-2.5 rounded-xl bg-[color:var(--bg)] border border-[color:var(--border)] outline-none focus:border-[color:var(--accent)]" /></div>); }
function TextArea({ label, value, onChange, rows=6 }: any) { return (<div><label className="text-xs text-[color:var(--muted)]">{label}</label><textarea value={value} onChange={(e: any)=>onChange(e.target.value)} rows={rows} className="mt-1 w-full px-3 py-2.5 rounded-xl bg-[color:var(--bg)] border border-[color:var(--border)] outline-none focus:border-[color:var(--accent)] font-mono text-sm" /></div>); }
