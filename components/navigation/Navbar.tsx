"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, Languages } from "lucide-react";
import { useState } from "react";
import { useLanguage } from "@/components/providers/language-provider";

const links = [
  { href: "/", key: "nav.home" },
  { href: "/profile", key: "nav.profile" },
  { href: "/projects", key: "nav.projects" },
  { href: "/skills", key: "nav.skills" },
  { href: "/blog", key: "nav.blog" },
  { href: "/contact", key: "nav.contact" },
];

export default function Navbar() {
  const { t, lang, setLang } = useLanguage();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  return (
    <header className="sticky top-0 z-50 glass border-b border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.35)]">
      <div className="container-x flex items-center justify-between h-16">
        <Link href="/" className="flex items-center gap-2 font-bold text-lg tracking-tight">
          <span className="w-8 h-8 rounded-lg bg-gradient-to-br from-[color:var(--accent)] to-[color:var(--accent-2)] flex items-center justify-center text-white text-sm shadow-lg">C</span>
          <span className="gradient-text">CineCut</span>
        </Link>
        <nav className="hidden md:flex items-center gap-1">
          {links.map((l) => {
            const active = pathname === l.href;
            return (
              <Link key={l.href} href={l.href} className="relative px-3 py-2 text-sm text-[color:var(--muted)] hover:text-white transition-colors">
                {active && <motion.span layoutId="nav-pill" className="absolute inset-0 rounded-full bg-white/10" transition={{ duration: 0.3 }} />}
                <span className={active ? "text-white relative z-10" : "relative z-10"}>{t(l.key)}</span>
              </Link>
            );
          })}
        </nav>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setLang(lang === "en" ? "am" : "en")}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-[color:var(--border)] text-sm hover:bg-white/10 transition"
            aria-label="Switch language"
          >
            <Languages size={16} />
            {lang === "en" ? "AM" : "EN"}
          </button>
          <button className="md:hidden p-2" onClick={() => setOpen(true)} aria-label="Open menu">
            <Menu size={20} />
          </button>
        </div>
      </div>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 z-50 md:hidden"
            onClick={() => setOpen(false)}
          >
            <motion.aside
              initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 26, stiffness: 300 }}
              className="absolute right-0 top-0 h-full w-72 bg-[color:var(--surface)] p-6 flex flex-col gap-2"
              onClick={(e) => e.stopPropagation()}
            >
              <button className="self-end p-2" onClick={() => setOpen(false)} aria-label="Close menu"><X size={20}/></button>
              {links.map((l) => (
                <Link key={l.href} href={l.href} onClick={() => setOpen(false)} className={`px-3 py-2 rounded-lg ${pathname === l.href ? "bg-white/10 text-white" : "text-[color:var(--muted)]"}`}>
                  {t(l.key)}
                </Link>
              ))}
            </motion.aside>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
