"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Lock, Mail, Loader2 } from "lucide-react";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const r = await fetch("/api/admin/login", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email, password }) });
      const d = await r.json();
      if (r.ok && d.success) {
        toast.success("Welcome");
        router.push("/admin");
        router.refresh();
      } else {
        toast.error(d.error || "Invalid credentials");
      }
    } catch {
      toast.error("Login failed");
    } finally {
      setLoading(false);
    }
  }
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-md rounded-2xl border border-[color:var(--border)] bg-[color:var(--surface)] p-8 shadow-xl">
        <div className="text-center mb-6">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-[color:var(--accent)]/20 border border-[color:var(--accent)]/30 flex items-center justify-center mb-3">
            <Lock size={24} className="text-[color:var(--accent)]" />
          </div>
          <h1 className="text-2xl font-bold">Administrator Login</h1>
          <p className="text-sm text-[color:var(--muted)] mt-1">Sign in to manage your portfolio</p>
        </div>
        <form onSubmit={submit} className="space-y-4">
          <div>
            <label className="text-sm text-[color:var(--muted)]">Email</label>
            <div className="mt-1 relative">
              <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[color:var(--muted)]" />
              <input value={email} onChange={(e: any)=>setEmail(e.target.value)} type="email" required className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-[color:var(--bg)] border border-[color:var(--border)] outline-none focus:border-[color:var(--accent)]" />
            </div>
          </div>
          <div>
            <label className="text-sm text-[color:var(--muted)]">Password</label>
            <input value={password} onChange={(e: any)=>setPassword(e.target.value)} type="password" required className="mt-1 w-full px-3 py-2.5 rounded-xl bg-[color:var(--bg)] border border-[color:var(--border)] outline-none focus:border-[color:var(--accent)]" />
          </div>
          <button disabled={loading} className="w-full py-3 rounded-xl bg-[color:var(--accent)] hover:opacity-90 transition flex items-center justify-center gap-2">
            {loading ? <Loader2 size={18} className="animate-spin"/> : null} Sign In
          </button>
        </form>
      </div>
    </div>
  );
}
