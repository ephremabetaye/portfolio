"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Lock, Mail, Loader2, Eye, EyeOff } from "lucide-react";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const r = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const d = await r.json();
      if (r.ok && d.success) {
        toast.success("Welcome");
        router.push("/admin");
        router.refresh();
      } else {
        const message = d.error || "Invalid credentials";
        setError(message);
        toast.error(message);
      }
    } catch {
      setError("Login failed. Check your connection and try again.");
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
              <input
                value={email}
                onChange={(e: any) => setEmail(e.target.value)}
                type="email"
                required
                autoComplete="username"
                className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-[color:var(--bg)] border border-[color:var(--border)] outline-none focus:border-[color:var(--accent)]"
              />
            </div>
          </div>
          <div>
            <label className="text-sm text-[color:var(--muted)]">Password</label>
            <div className="mt-1 relative">
              <input
                value={password}
                onChange={(e: any) => setPassword(e.target.value)}
                type={showPassword ? "text" : "password"}
                required
                autoComplete="current-password"
                className="w-full pl-3 pr-11 py-2.5 rounded-xl bg-[color:var(--bg)] border border-[color:var(--border)] outline-none focus:border-[color:var(--accent)]"
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                aria-label={showPassword ? "Hide password" : "Show password"}
                title={showPassword ? "Hide password" : "Show password"}
                className="absolute right-1.5 top-1/2 -translate-y-1/2 p-2 rounded-lg text-[color:var(--muted)] hover:text-white hover:bg-white/10 transition"
              >
                {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
              </button>
            </div>
          </div>
          {error && (
            <div className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl px-3 py-2">
              {error}
            </div>
          )}
          <button disabled={loading} className="w-full py-3 rounded-xl bg-[color:var(--accent)] hover:opacity-90 transition flex items-center justify-center gap-2 disabled:opacity-50">
            {loading ? <Loader2 size={18} className="animate-spin" /> : null} Sign In
          </button>
        </form>
        <p className="text-center text-xs text-[color:var(--muted)] mt-5">
          Deployment check:{" "}
          <a href="/api/health" target="_blank" rel="noreferrer" className="underline hover:text-white">
            /api/health
          </a>
        </p>
      </div>
    </div>
  );
}
