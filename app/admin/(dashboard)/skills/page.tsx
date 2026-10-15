"use client";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Plus, Pencil, Trash2 } from "lucide-react";

export default function AdminSkills() {
  const [items, setItems] = useState<any[]>([]);
  const [modal, setModal] = useState<any>(null);
  const [saving, setSaving] = useState(false);

  async function load() {
    const r = await fetch("/api/skills").then(x => x.json());
    setItems(r.data || []);
  }
  useEffect(() => { load(); }, []);

  function newItem() { setModal({ name: "", category: "Editing", description: { en: "", am: "" }, proficiency: 0, icon: "", order: 0 }); }
  function editItem(it: any) { setModal({ ...it }); }

  async function save() {
    setSaving(true);
    try {
      const body = { ...modal };
      const url = modal._id ? `/api/skills/${modal._id}` : "/api/skills";
      const method = modal._id ? "PUT" : "POST";
      const r = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      const d = await r.json();
      if (r.ok && d.success) { toast.success("Saved"); setModal(null); load(); }
      else toast.error(d.error || "Failed");
    } catch { toast.error("Failed"); }
    finally { setSaving(false); }
  }

  async function del(id: string) {
    if (!confirm("Delete skill?")) return;
    const r = await fetch(`/api/skills/${id}`, { method: "DELETE" }).then(x=>x.json());
    if (r.success) { toast.success("Deleted"); load(); } else toast.error(r.error);
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Skills</h1>
        <button onClick={newItem} className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[color:var(--accent)] hover:opacity-90"><Plus size={16}/>New Skill</button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {items.map(it => (
          <div key={it._id} className="rounded-xl border border-[color:var(--border)] bg-[color:var(--surface)] p-4 flex items-center justify-between">
            <div>
              <div className="font-semibold">{it.name}</div>
              <div className="text-xs text-[color:var(--muted)]">{it.category} · {it.proficiency}%</div>
            </div>
            <div className="flex gap-1">
              <button onClick={()=>editItem(it)} className="p-1.5 rounded-lg hover:bg-white/10"><Pencil size={14}/></button>
              <button onClick={()=>del(it._id)} className="p-1.5 rounded-lg hover:bg-red-500/10 text-red-400"><Trash2 size={14}/></button>
            </div>
          </div>
        ))}
      </div>

      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-2xl max-h-[90vh] overflow-auto rounded-2xl bg-[color:var(--surface)] border border-[color:var(--border)] p-6">
            <h2 className="text-xl font-bold mb-4">{modal._id ? "Edit Skill" : "New Skill"}</h2>
            <div className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <Field label="Name" value={modal.name || ""} onChange={(v: any)=>setM("name", v)} />
                <Field label="Category" value={modal.category || ""} onChange={(v: any)=>setM("category", v)} />
                <Field label="Proficiency (0-100)" value={modal.proficiency ?? 0} onChange={(v: any)=>setM("proficiency", Number(v))} type="number" />
                <Field label="Icon (optional)" value={modal.icon || ""} onChange={(v: any)=>setM("icon", v)} />
                <Field label="Order" value={modal.order ?? 0} onChange={(v: any)=>setM("order", Number(v))} type="number" />
              </div>
              <LangField label="Description (EN)" value={modal.description?.en || ""} onChange={(v: any)=>setM("description", { ...modal.description, en: v })} />
              <LangField label="Description (AM)" value={modal.description?.am || ""} onChange={(v: any)=>setM("description", { ...modal.description, am: v })} />
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
function Field({ label, value, onChange, type="text" }: any) { return (<div><label className="text-xs text-[color:var(--muted)]">{label}</label><input type={type} value={value} onChange={(e: any)=>onChange(e.target.value)} className="mt-1 w-full px-3 py-2.5 rounded-xl bg-[color:var(--bg)] border border-[color:var(--border)] outline-none focus:border-[color:var(--accent)]" /></div>); }
function LangField({ label, value, onChange }: any) { return (<div><label className="text-xs text-[color:var(--muted)]">{label}</label><textarea value={value} onChange={(e: any)=>onChange(e.target.value)} rows={3} className="mt-1 w-full px-3 py-2.5 rounded-xl bg-[color:var(--bg)] border border-[color:var(--border)] outline-none focus:border-[color:var(--accent)]" /></div>); }
