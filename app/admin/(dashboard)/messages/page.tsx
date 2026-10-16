"use client";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Trash2, Mail, MailOpen, Search, CheckCheck, Inbox } from "lucide-react";

export default function AdminMessages() {
  const [all, setAll] = useState<any[]>([]);
  const [selected, setSelected] = useState<any>(null);
  const [filter, setFilter] = useState<"all" | "read" | "unread">("all");
  const [q, setQ] = useState("");

  async function load() {
    const r = await fetch("/api/contact").then(x => x.json());
    setAll(r.data || []);
  }
  useEffect(() => { load(); }, []);

  const items = all.filter(m => (filter === "all" ? true : filter === "read" ? !!m.read : !m.read));
  const filtered = items.filter(m => (q === "" || (m.name + m.email + m.subject + m.message).toLowerCase().includes(q.toLowerCase())));
  const unread = all.filter(m => !m.read).length;
  const counts = { all: all.length, unread, read: all.length - unread };

  async function toggleRead(m: any) {
    await fetch(`/api/contact/${m._id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ read: !m.read }) });
    await load();
    setAll(prev => {
      const next = prev.map(x => (x._id === m._id ? { ...x, read: !m.read } : x));
      if (selected?._id === m._id) setSelected({ ...m, read: !m.read });
      return next;
    });
  }

  async function markAllRead() {
    const r = await fetch("/api/contact", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ markAllRead: true }) }).then(x => x.json());
    if (r.success) { toast.success("All messages marked as read"); setSelected(selected ? { ...selected, read: true } : null); load(); }
    else toast.error(r.error || "Failed");
  }

  async function del(id: string) {
    if (!confirm("Delete message?")) return;
    const r = await fetch(`/api/contact/${id}`, { method: "DELETE" }).then(x => x.json());
    if (r.success) { toast.success("Deleted"); load(); setSelected(null); } else toast.error(r.error);
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold">Contact Messages</h1>
          {unread > 0 && <span className="text-xs px-2.5 py-1 rounded-full bg-[color:var(--accent)]/20 border border-[color:var(--accent)]/40">{unread} unread</span>}
        </div>
        <button
          onClick={markAllRead}
          disabled={unread === 0}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-[color:var(--border)] text-sm hover:bg-white/10 disabled:opacity-40"
        >
          <CheckCheck size={15} /> Mark all read
        </button>
      </div>

      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[color:var(--muted)]" />
          <input value={q} onChange={(e: any) => setQ(e.target.value)} placeholder="Search by name, email, subject..." className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-[color:var(--surface)] border border-[color:var(--border)] outline-none focus:border-[color:var(--accent)]" />
        </div>
        <div className="flex gap-2">
          {(["all", "unread", "read"] as const).map(f => (
            <button key={f} onClick={() => setFilter(f)} className={`px-4 py-2 rounded-full text-sm border transition capitalize ${filter === f ? "bg-[color:var(--accent)] border-[color:var(--accent)]" : "border-[color:var(--border)] hover:bg-white/10"}`}>
              {f} <span className="opacity-60">({counts[f]})</span>
            </button>
          ))}
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="space-y-2">
          {filtered.map(m => (
            <button
              key={m._id}
              onClick={() => { setSelected(m); if (!m.read) toggleRead(m); }}
              className={`w-full text-left rounded-xl border p-4 hover:bg-white/5 transition ${selected?._id === m._id ? "bg-white/5 border-[color:var(--accent)]/40" : "border-[color:var(--border)]"} ${!m.read ? "border-l-4 border-l-[color:var(--accent)]" : ""}`}
            >
              <div className="flex items-center justify-between gap-3">
                <div className={`text-sm truncate ${!m.read ? "font-bold" : "font-semibold"}`}>{m.name}</div>
                <div className="text-[10px] text-[color:var(--muted)] shrink-0">{new Date(m.createdAt).toLocaleDateString()}</div>
              </div>
              <div className="text-xs text-[color:var(--muted)] mt-1 truncate">{m.subject || "(no subject)"}</div>
              <div className="text-xs text-[color:var(--muted)] mt-1 truncate">{m.message}</div>
            </button>
          ))}
          {filtered.length === 0 && (
            <div className="flex items-center gap-3 text-sm text-[color:var(--muted)] rounded-xl border border-dashed border-[color:var(--border)] p-6">
              <Inbox size={18} /> No messages {q ? "match your search" : "here yet"}
            </div>
          )}
        </div>

        <div className="rounded-2xl border border-[color:var(--border)] bg-[color:var(--surface)] p-6 min-h-[300px] self-start">
          {selected ? (
            <>
              <div className="flex items-start justify-between mb-4">
                <div className="min-w-0">
                  <div className="text-lg font-semibold truncate">{selected.name}</div>
                  <a href={`mailto:${selected.email}`} className="text-sm text-[color:var(--accent-2)] hover:underline break-all">{selected.email}</a>
                </div>
                <div className="flex gap-2 shrink-0">
                  <button onClick={() => toggleRead(selected)} title={selected.read ? "Mark as unread" : "Mark as read"} className="p-2 rounded-lg hover:bg-white/10">{selected.read ? <MailOpen size={16} /> : <Mail size={16} />}</button>
                  <button onClick={() => del(selected._id)} title="Delete" className="p-2 rounded-lg hover:bg-red-500/10 text-red-400"><Trash2 size={16} /></button>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-3 text-xs text-[color:var(--muted)] mb-4">
                <span>{new Date(selected.createdAt).toLocaleString()}</span>
                {selected.subject && <span className="px-2 py-0.5 rounded-full bg-white/5 border border-[color:var(--border)]">Subject: {selected.subject}</span>}
              </div>
              <div className="whitespace-pre-wrap leading-relaxed text-sm">{selected.message}</div>
              <div className="mt-6 flex flex-wrap gap-3">
                <a href={`mailto:${selected.email}?subject=${encodeURIComponent("Re: " + (selected.subject || ""))}`} className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[color:var(--accent)] hover:opacity-90 text-sm"><Mail size={14} /> Reply via email</a>
                <a href={`mailto:?subject=${encodeURIComponent(selected.subject || "")}&body=${encodeURIComponent("\n\n---\n" + selected.message)}`} className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-[color:var(--border)] hover:bg-white/10 text-sm">Forward</a>
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-full min-h-[250px] text-center text-sm text-[color:var(--muted)]">
              <Inbox size={32} className="mb-3 opacity-50" />
              Select a message to read it
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
