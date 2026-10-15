"use client";
import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { Menu, X, LogOut, LayoutDashboard, User, Globe2, FolderKanban, Sparkles, FileText, Inbox, Settings as Cog } from "lucide-react";
import { toast } from "sonner";

const nav = [
  { href: "/admin", label: "Overview", icon: LayoutDashboard },
  { href: "/admin/profile", label: "Profile", icon: User },
  { href: "/admin/settings", label: "Homepage & Settings", icon: Globe2 },
  { href: "/admin/projects", label: "Projects", icon: FolderKanban },
  { href: "/admin/skills", label: "Skills", icon: Sparkles },
  { href: "/admin/blog", label: "Blog", icon: FileText },
  { href: "/admin/messages", label: "Messages", icon: Inbox },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [authed, setAuthed] = useState<boolean | null>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    fetch("/api/admin/session").then(r => r.json()).then(d => {
      if (!d.success) { router.replace("/admin/login"); setAuthed(false); }
      else setAuthed(true);
    }).catch(() => { router.replace("/admin/login"); setAuthed(false); });
  }, [router]);

  async function logout() {
    await fetch("/api/admin/logout", { method: "POST" });
    toast.success("Logged out");
    router.replace("/admin/login");
  }

  if (authed === null) return <div className="min-h-screen flex items-center justify-center"><div className="skeleton w-10 h-10 rounded-full" /></div>;
  if (!authed) return null;

  return (
    <div className="min-h-screen flex">
      {/* Desktop sidebar */}
      <aside className="hidden md:flex w-64 flex-col border-r border-white/10 glass p-4">
        <Link href="/admin" className="text-lg font-bold gradient-text mb-6">Admin Dashboard</Link>
        <nav className="flex flex-col gap-1 flex-1">
          {nav.map(item => {
            const Icon = item.icon;
            const active = pathname === item.href;
            return (
              <Link key={item.href} href={item.href} className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition ${active ? "bg-[color:var(--accent)]/20 text-white" : "text-[color:var(--muted)] hover:bg-white/5 hover:text-white"}`}>
                <Icon size={16}/>{item.label}
              </Link>
            );
          })}
        </nav>
        <button onClick={logout} className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-[color:var(--muted)] hover:bg-red-500/10 hover:text-red-400 transition">
          <LogOut size={16}/>Logout
        </button>
      </aside>

      {/* Mobile header */}
      <div className="md:hidden fixed top-0 inset-x-0 z-50 bg-[color:var(--bg)]/80 backdrop-blur border-b border-[color:var(--border)] flex items-center justify-between px-4 h-14">
        <button onClick={() => setOpen(true)} className="p-2"><Menu size={20}/></button>
        <span className="font-semibold">Admin</span>
        <button onClick={logout} className="p-2"><LogOut size={18}/></button>
      </div>

      {/* Mobile drawer */}
      {open && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          <div className="fixed inset-0 bg-black/60" onClick={() => setOpen(false)} />
          <aside className="relative w-72 bg-[color:var(--surface)] p-4 flex flex-col">
            <button onClick={() => setOpen(false)} className="self-end p-2 mb-2"><X size={20}/></button>
            {nav.map(item => {
              const Icon = item.icon;
              return (
                <Link key={item.href} href={item.href} onClick={() => setOpen(false)} className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm mb-1 ${pathname === item.href ? "bg-[color:var(--accent)]/20 text-white" : "text-[color:var(--muted)]"}`}>
                  <Icon size={16}/>{item.label}
                </Link>
              );
            })}
          </aside>
        </div>
      )}

      <main className="flex-1 p-4 md:p-8 mt-14 md:mt-0 overflow-x-hidden">{children}</main>
    </div>
  );
}
