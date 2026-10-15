"use client";
import { useEffect, useState } from "react";
import { FolderKanban, FileText, Sparkles, Inbox, MailOpen } from "lucide-react";

export default function AdminOverview() {
  const [data, setData] = useState<any>(null);
  useEffect(() => { fetch("/api/admin/dashboard").then(r => r.json()).then(d => setData(d.data)).catch(()=>{}); }, []);
  const stats = data?.stats || {};
  const cards = [
    { label: "Published Projects", value: stats.projects, icon: FolderKanban },
    { label: "Blog Posts", value: stats.posts, icon: FileText },
    { label: "Skills", value: stats.skills, icon: Sparkles },
    { label: "Messages", value: stats.messages, icon: Inbox },
    { label: "Unread Messages", value: stats.unread, icon: MailOpen },
  ];
  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Dashboard Overview</h1>
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
        {cards.map(c => {
          const Icon = c.icon;
          return (
            <div key={c.label} className="rounded-2xl border border-[color:var(--border)] bg-[color:var(--surface)] p-5">
              <div className="flex items-center justify-between">
                <Icon size={18} className="text-[color:var(--accent)]" />
                <span className="text-2xl font-bold">{c.value ?? "—"}</span>
              </div>
              <div className="text-xs text-[color:var(--muted)] mt-2">{c.label}</div>
            </div>
          );
        })}
      </div>
      <div className="grid md:grid-cols-2 gap-6">
        <div className="rounded-2xl border border-[color:var(--border)] bg-[color:var(--surface)] p-5">
          <h2 className="font-semibold mb-4">Recent Messages</h2>
          <div className="space-y-3">
            {(data?.recentMessages || []).map((m: any) => (
              <div key={m._id} className="flex items-center justify-between text-sm">
                <div>
                  <div className="font-medium">{m.name}</div>
                  <div className="text-xs text-[color:var(--muted)]">{m.subject || m.message?.slice(0,40)}</div>
                </div>
                <span className={`w-2 h-2 rounded-full ${m.read ? "bg-gray-500" : "bg-[color:var(--accent)]"}`} />
              </div>
            ))}
            {!data?.recentMessages?.length && <div className="text-sm text-[color:var(--muted)]">No messages</div>}
          </div>
        </div>
        <div className="rounded-2xl border border-[color:var(--border)] bg-[color:var(--surface)] p-5">
          <h2 className="font-semibold mb-4">Recently Updated Projects</h2>
          <div className="space-y-3">
            {(data?.recentProjects || []).map((p: any) => (
              <div key={p._id} className="flex items-center justify-between text-sm">
                <div className="font-medium">{p.title?.en}</div>
                <span className={`text-xs px-2 py-0.5 rounded-full ${p.published ? "bg-green-500/20 text-green-400" : "bg-gray-500/20 text-gray-400"}`}>{p.published ? "Published" : "Draft"}</span>
              </div>
            ))}
            {!data?.recentProjects?.length && <div className="text-sm text-[color:var(--muted)]">No projects</div>}
          </div>
        </div>
      </div>
    </div>
  );
}
