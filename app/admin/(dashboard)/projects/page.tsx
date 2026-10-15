"use client";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, Eye, EyeOff, Star } from "lucide-react";

export default function AdminProjects() {
  const [items, setItems] = useState<any[]>([]);
  const [modal, setModal] = useState<any>(null); // null closed, object editing or {new:true}
  const [saving, setSaving] = useState(false);

  async function load() {
    const r = await fetch("/api/projects?all=1").then(x => x.json());
    setItems(r.data || []);
  }
  useEffect(() => { load(); }, []);

  function newItem() { setModal({ title: { en: "", am: "" }, description: { en: "", am: "" }, slug: "", category: "Commercial", tags: "", tools: "", client: "", projectDate: "", thumbnail: "", videoUrl: "", featured: false, published: true, order: 0 }); }
  function editItem(it: any) {
    setModal({ ...it, tags: (it.tags || []).join(", "), tools: (it.tools || []).join(", "), projectDate: it.projectDate ? it.projectDate.slice(0,10) : "" });
  }

  async function save() {
    setSaving(true);
    try {
      const body = {
        ...modal,
        tags: String(modal.tags || "").split(",").map((s:string)=>s.trim()).filter(Boolean),
        tools: String(modal.tools || "").split(",").map((s:string)=>s.trim()).filter(Boolean),
        projectDate: modal.projectDate ? new Date(modal.projectDate) : null,
      };
      const url = modal._id ? `/api/projects/${modal._id}` : "/api/projects";
      const method = modal._id ? "PUT" : "POST";
      const r = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      const d = await r.json();
      if (r.ok && d.success) { toast.success("Saved"); setModal(null); load(); }
      else toast.error(d.error || "Failed");
    } catch { toast.error("Failed"); }
    finally { setSaving(false); }
  }

  async function del(id: string) {
    if (!confirm("Delete this project?")) return;
    const r = await fetch(`/api/projects/${id}`, { method: "DELETE" }).then(x=>x.json());
    if (r.success) { toast.success("Deleted"); load(); } else toast.error(r.error);
  }

  async function toggle(it: any, field: "published" | "featured") {
    await fetch(`/api/projects/${it._id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ [field]: !it[field] }) });
    load();
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Projects</h1>
        <button onClick={newItem} className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[color:var(--accent)] hover:opacity-90"><Plus size={16}/>New Project</button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {items.map(it => (
          <div key={it._id} className="rounded-2xl border border-[color:var(--border)] bg-[color:var(--surface)] overflow-hidden">
            <div className="aspect-video bg-black"><img src={it.thumbnail} alt="" className="w-full h-full object-cover"/></div>
            <div className="p-4">
              <div className="flex items-center justify-between">
                <div className="font-semibold">{it.title?.en}</div>
                <div className="flex gap-1">
                  <button onClick={()=>toggle(it,"featured")} className={cn("p-1.5 rounded-lg hover:bg-white/10", it.featured && "text-yellow-400")}><Star size={14}/></button>
                  <button onClick={()=>toggle(it,"published")} className="p-1.5 rounded-lg hover:bg-white/10">{it.published ? <Eye size={14}/> : <EyeOff size={14}/>}</button>
                  <button onClick={()=>editItem(it)} className="p-1.5 rounded-lg hover:bg-white/10"><Pencil size={14}/></button>
                  <button onClick={()=>del(it._id)} className="p-1.5 rounded-lg hover:bg-red-500/10 text-red-400"><Trash2 size={14}/></button>
                </div>
              </div>
              <div className="text-xs text-[color:var(--muted)] mt-1">{it.category} · {it.client}</div>
            </div>
          </div>
        ))}
      </div>

      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-3xl max-h-[90vh] overflow-auto rounded-2xl bg-[color:var(--surface)] border border-[color:var(--border)] p-6">
            <h2 className="text-xl font-bold mb-4">{modal._id ? "Edit Project" : "New Project"}</h2>
            <div className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <Field label="Title (EN)" value={modal.title?.en || ""} onChange={(v: any)=>setM("title", { ...modal.title, en: v })} />
                <Field label="Title (AM)" value={modal.title?.am || ""} onChange={(v: any)=>setM("title", { ...modal.title, am: v })} />
              </div>
              <Field label="Slug" value={modal.slug || ""} onChange={(v: any)=>setM("slug", v)} />
              <div className="grid md:grid-cols-2 gap-4">
                <TextArea label="Description (EN)" value={modal.description?.en || ""} onChange={(v: any)=>setM("description", { ...modal.description, en: v })} />
                <TextArea label="Description (AM)" value={modal.description?.am || ""} onChange={(v: any)=>setM("description", { ...modal.description, am: v })} />
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <Field label="Category" value={modal.category || ""} onChange={(v: any)=>setM("category", v)} />
                <Field label="Client" value={modal.client || ""} onChange={(v: any)=>setM("client", v)} />
                <Field label="Tags (comma)" value={modal.tags || ""} onChange={(v: any)=>setM("tags", v)} />
                <Field label="Tools (comma)" value={modal.tools || ""} onChange={(v: any)=>setM("tools", v)} />
                <Field label="Project Date" value={modal.projectDate || ""} onChange={(v: any)=>setM("projectDate", v)} type="date" />
                <Field label="Order" value={modal.order ?? 0} onChange={(v: any)=>setM("order", Number(v))} type="number" />
              </div>
              <Field label="Thumbnail URL" value={modal.thumbnail || ""} onChange={(v: any)=>setM("thumbnail", v)} />
              <Field label="Video URL" value={modal.videoUrl || ""} onChange={(v: any)=>setM("videoUrl", v)} />
              <div className="flex gap-6">
                <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={!!modal.featured} onChange={(e: any)=>setM("featured", e.target.checked)}/>Featured</label>
                <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={!!modal.published} onChange={(e: any)=>setM("published", e.target.checked)}/>Published</label>
              </div>
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

  function setM(k: string, v: any) { setModal((p:any) => ({ ...p, [k]: v })); }
}

function Field({ label, value, onChange, type="text" }: any) { return (<div><label className="text-xs text-[color:var(--muted)]">{label}</label><input type={type} value={value} onChange={(e: any)=>onChange(e.target.value)} className="mt-1 w-full px-3 py-2.5 rounded-xl bg-[color:var(--bg)] border border-[color:var(--border)] outline-none focus:border-[color:var(--accent)]" /></div>); }
function TextArea({ label, value, onChange }: any) { return (<div><label className="text-xs text-[color:var(--muted)]">{label}</label><textarea value={value} onChange={(e: any)=>onChange(e.target.value)} rows={4} className="mt-1 w-full px-3 py-2.5 rounded-xl bg-[color:var(--bg)] border border-[color:var(--border)] outline-none focus:border-[color:var(--accent)]" /></div>); }
// cn unused maybe remove
function cn(...a:any[]){return a.filter(Boolean).join(" ");}
