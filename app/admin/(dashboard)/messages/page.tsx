"use client";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Trash2, Mail, MailOpen, Search, CheckCheck, Inbox, Send, Loader2, CornerDownRight } from "lucide-react";

export default function AdminMessages() {
  const [all, setAll] = useState<any[]>([]);
  const [selected, setSelected] = useState<any>(null);
  const [filter, setFilter] = useState<"all" | "read" | "unread">("all");
  const [q, setQ] = useState("");
  const [replyText, setReplyText] = useState("");
  const [sendingReply, setSendingReply] = useState(false);

  async function load() {
    const r = await fetch("/api/contact").then(x => x.json());
    setAll(r.data || []);
  }
  useEffect(() => { load(); }, []);

  const items = all.filter(m => (filter === "all" ? true : filter === "read" ? !!m.read : !m.read));
  const filtered = items.filter(m => (q === "" || (m.name + m.email + m.subject + m.message).toLowerCase().includes(q.toLowerCase())));
  const unread = all.filter(m => !m.read).length;
  const counts = { all: all.length, unread, read: all.length - unread };

  function selectMessage(m: any) {
    if (selected?._id === m._id) return;
    setSelected(m);
    setReplyText("");
    if (!m.read) toggleRead(m);
  }

  async function toggleRead(m: any) {
    await fetch(`/api/contact/${m._id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ read: !m.read }) });
    await load();
    setAll(prev => prev.map(x => (x._id === m._id ? { ...x, read: !m.read } : x)));
    setSelected((prevSel: any) => (prevSel && prevSel._id === m._id ? { ...prevSel, read: !m.read } : prevSel));
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

  async function sendReply() {
    if (!selected || !replyText.trim() || sendingReply) return;
    setSendingReply(true);
    try {
      const r = await fetch(`/api/contact/${selected._id}/reply`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: replyText.trim() }),
      });
      const d = await r.json();
      if (r.ok && d.success) {
        toast.success(`Reply sent to ${selected.email}`);
        const updated = d.data;
        setSelected(updated);
        setAll(prev => prev.map(x => (x._id === updated._id ? updated : x)));
        setReplyText("");
      } else {
        toast.error(d.error || "Failed to send reply");
      }
    } catch {
      toast.error("Failed to send reply");
    } finally {
      setSendingReply(false);
    }
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
              onClick={() => selectMessage(m)}
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

        <div className="rounded-2xl border border-[color:var(--border)] bg-[color:var(--surface)] p-6 min-h-[300px] self-start min-w-0">
          {selected ? (
            <>
              <div className="flex items-start justify-between mb-4 gap-3">
                <div className="min-w-0">
                  <div className="text-lg font-semibold truncate">{selected.name}</div>
                  <a href={`mailto:${selected.email}`} className="text-sm text-[color:var(--accent-2)] hover:underline break-all">{selected.email}</a>
                </div>
                <div className="flex gap-2 shrink-0">
                  <button onClick={() => toggleRead(selected)} title={selected.read ? "Mark as unread" : "Mark as read"} className="p-2 rounded-lg hover:bg-white/10">{selected.read ? <MailOpen size={16} /> : <Mail size={16} />}</button>
                  <button onClick={() => del(selected._id)} title="Delete" className="p-2 rounded-lg hover:bg-red-500/10 text-red-400"><Trash2 size={16} /></button>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2 text-xs text-[color:var(--muted)] mb-4">
                <span>{new Date(selected.createdAt).toLocaleString()}</span>
                {selected.subject && <span className="px-2 py-0.5 rounded-full bg-white/5 border border-[color:var(--border)] break-all">Subject: {selected.subject}</span>}
                {selected.autoReplySent && (
                  <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-300">Auto-reply sent to sender</span>
                )}
                {!!(selected.replies?.length) && (
                  <span className="px-2 py-0.5 rounded-full bg-sky-500/10 border border-sky-500/30 text-sky-300">
                    {selected.replies.length} repl{selected.replies.length === 1 ? "y" : "ies"} sent
                  </span>
                )}
              </div>

              <div className="whitespace-pre-wrap break-words leading-relaxed text-sm max-h-72 overflow-y-auto rounded-xl border border-[color:var(--border)] bg-[color:var(--bg)] p-4">
                {selected.message}
              </div>

              {!!(selected.replies?.length) && (
                <div className="mt-5 space-y-2">
                  <div className="text-xs uppercase tracking-widest text-[color:var(--muted)]">Reply history</div>
                  {selected.replies.map((rep: any, i: number) => (
                    <div key={i} className="rounded-xl border border-[color:var(--border)] bg-[color:var(--bg)] p-3">
                      <div className="flex items-center gap-2 text-[10px] text-[color:var(--muted)] mb-1">
                        <CornerDownRight size={12} />
                        <span>You replied · {new Date(rep.sentAt).toLocaleString()}</span>
                      </div>
                      <div className="text-sm whitespace-pre-wrap break-words">{rep.body}</div>
                    </div>
                  ))}
                </div>
              )}

              <div className="mt-6 pt-4 border-t border-[color:var(--border)]">
                <div className="text-xs uppercase tracking-widest text-[color:var(--muted)] mb-2">Reply to {selected.name}</div>
                <textarea
                  value={replyText}
                  onChange={(e: any) => setReplyText(e.target.value)}
                  rows={4}
                  placeholder={`Write your reply to ${selected.email}...`}
                  className="w-full px-3 py-2.5 rounded-xl bg-[color:var(--bg)] border border-[color:var(--border)] outline-none focus:border-[color:var(--accent)] text-sm"
                />
                <div className="mt-3 flex flex-wrap items-center gap-3">
                  <button
                    onClick={sendReply}
                    disabled={sendingReply || !replyText.trim()}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[color:var(--accent)] hover:opacity-90 text-sm disabled:opacity-40"
                  >
                    {sendingReply ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
                    {sendingReply ? "Sending..." : "Send Reply"}
                  </button>
                  <a
                    href={`mailto:${selected.email}?subject=${encodeURIComponent("Re: " + (selected.subject || ""))}`}
                    className="text-xs text-[color:var(--muted)] hover:underline"
                  >
                    or open in mail app
                  </a>
                </div>
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
