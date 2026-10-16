"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, Languages, Camera } from "lucide-react";
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
        <Link
          href="/"
          aria-label="Ephrem Abtaye — Professional Video Editor and Graphic Designer — Home"
          className="group flex min-w-0 items-center gap-2.5 rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--accent)]/60"
        >
          <motion.span
            initial={{ opacity: 0, scale: 0.5, rotate: -14 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            transition={{ type: "spring", stiffness: 260, damping: 17 }}
            whileHover={{ rotate: -8, scale: 1.08 }}
            whileTap={{ scale: 0.92 }}
            className="relative flex h-9 w-9 shrink-0 items-center justify-center"
          >
            <span aria-hidden className="absolute -inset-1 rounded-xl bg-gradient-to-br from-[color:var(--accent)]/60 to-[color:var(--accent-2)]/60 opacity-0 blur-md transition-opacity duration-300 group-hover:opacity-100" />
            <span aria-hidden className="absolute inset-0 rounded-xl bg-gradient-to-br from-[color:var(--accent)] to-[color:var(--accent-2)] shadow-lg shadow-[color:var(--accent)]/30" />
            <Camera size={18} strokeWidth={2.1} className="relative text-white" />
          </motion.span>
          <motion.span
            initial={{ opacity: 0, x: -14 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, ease: "easeOut", delay: 0.05 }}
            className="flex min-w-0 flex-col leading-tight"
          >
            <span className="relative inline-block">
              <span className="brand-shimmer text-[15px] font-extrabold tracking-tight lg:text-base">Ephrem Abtaye</span>
              <span aria-hidden className="absolute -bottom-0.5 left-0 h-[2px] w-full origin-left scale-x-0 rounded-full bg-gradient-to-r from-[color:var(--accent)] to-[color:var(--accent-2)] transition-transform duration-300 group-hover:scale-x-100" />
            </span>
            <span className="mt-0.5 hidden whitespace-nowrap text-[8.5px] font-semibold uppercase tracking-[0.18em] text-[color:var(--muted)] transition-colors duration-300 group-hover:text-[color:var(--accent-2)] lg:block">
              Professional Video Editor &amp; Graphic Designer
            </span>
          </motion.span>
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
