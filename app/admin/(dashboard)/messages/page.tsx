"use client";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Trash2, Mail, MailOpen, Search } from "lucide-react";

export default function AdminMessages() {
  const [items, setItems] = useState<any[]>([]);
  const [selected, setSelected] = useState<any>(null);
  const [filter, setFilter] = useState<"all" | "read" | "unread">("all");
  const [q, setQ] = useState("");
  async function load() {
    const url = filter === "all" ? "/api/contact" : `/api/contact?read=${filter === "read"}`;
    const r = await fetch(url).then(x => x.json());
    setItems(r.data || []);
  }
  useEffect(() => { load(); }, [filter]);
  const filtered = items.filter(m => (q === "" || (m.name + m.email + m.subject + m.message).toLowerCase().includes(q.toLowerCase())));
  async function toggleRead(m: any) {
    await fetch(`/api/contact/${m._id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ read: !m.read }) });
    load();
    if (selected?._id === m._id) setSelected({ ...m, read: !m.read });
  }
  async function del(id: string) {
    if (!confirm("Delete message?")) return;
    const r = await fetch(`/api/contact/${id}`, { method: "DELETE" }).then(x=>x.json());
    if (r.success) { toast.success("Deleted"); load(); setSelected(null); } else toast.error(r.error);
  }
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Contact Messages</h1>
      </div>
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[color:var(--muted)]" />
          <input value={q} onChange={(e: any)=>setQ(e.target.value)} placeholder="Search..." className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-[color:var(--surface)] border border-[color:var(--border)] outline-none focus:border-[color:var(--accent)]" />
        </div>
        <div className="flex gap-2">
          {(["all","unread","read"] as const).map(f => (
            <button key={f} onClick={()=>setFilter(f)} className={`px-4 py-2 rounded-full text-sm border transition ${filter===f ? "bg-[color:var(--accent)] border-[color:var(--accent)]" : "border-[color:var(--border)] hover:bg-white/10"}`}>{f}</button>
          ))}
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="space-y-2">
          {filtered.map(m => (
            <button key={m._id} onClick={()=>{ setSelected(m); if(!m.read) toggleRead(m); }} className={`w-full text-left rounded-xl border border-[color:var(--border)] p-4 hover:bg-white/5 transition ${selected?._id===m._id ? "bg-white/5" : ""}`}>
              <div className="flex items-center justify-between">
                <div className="font-semibold text-sm">{m.name}</div>
                {!m.read && <span className="w-2 h-2 rounded-full bg-[color:var(--accent)]" />}
              </div>
              <div className="text-xs text-[color:var(--muted)] mt-1">{m.subject || "(no subject)"}</div>
              <div className="text-xs text-[color:var(--muted)] mt-1">{new Date(m.createdAt).toLocaleString()}</div>
            </button>
          ))}
          {filtered.length === 0 && <div className="text-sm text-[color:var(--muted)]">No messages</div>}
        </div>
        <div className="rounded-2xl border border-[color:var(--border)] bg-[color:var(--surface)] p-6 min-h-[300px]">
          {selected ? (
            <>
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="text-lg font-semibold">{selected.name}</div>
                  <div className="text-sm text-[color:var(--muted)]">{selected.email}</div>
                </div>
                <div className="flex gap-2">
                  <button onClick={()=>toggleRead(selected)} className="p-2 rounded-lg hover:bg-white/10">{selected.read ? <MailOpen size={16}/> : <Mail size={16}/>}</button>
                  <button onClick={()=>del(selected._id)} className="p-2 rounded-lg hover:bg-red-500/10 text-red-400"><Trash2 size={16}/></button>
                </div>
              </div>
              {selected.subject && <div className="text-sm font-medium mb-2">Subject: {selected.subject}</div>}
              <div className="text-sm text-[color:var(--muted)] mb-4">{new Date(selected.createdAt).toLocaleString()}</div>
              <div className="whitespace-pre-wrap leading-relaxed">{selected.message}</div>
              <div className="mt-6">
                <a href={`mailto:${selected.email}?subject=Re: ${encodeURIComponent(selected.subject || "")}`} className="inline-block px-4 py-2 rounded-full bg-[color:var(--accent)] hover:opacity-90 text-sm">Reply via email</a>
              </div>
            </>
          ) : (
            <div className="text-sm text-[color:var(--muted)]">Select a message</div>
          )}
        </div>
      </div>
    </div>
  );
}
