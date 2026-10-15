"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useLanguage } from "@/components/providers/language-provider";
import { Globe, Video, Mail } from "lucide-react";
const Instagram = Globe;
const Youtube = Video;
const Linkedin = Globe;

export default function Footer() {
  const { t, lang } = useLanguage();
  const [settings, setSettings] = useState<any>(null);
  useEffect(() => {
    fetch("/api/settings").then(r => r.json()).then(d => setSettings(d.data)).catch(() => {});
  }, []);
  const name = settings?.siteName || "CineCut";
  const social = settings?.social || {};
  return (
    <footer className="mt-24 border-t border-[color:var(--border)] py-12">
      <div className="container-x grid gap-8 md:grid-cols-3">
        <div>
          <div className="text-xl font-bold gradient-text">{name}</div>
          <p className="text-sm text-[color:var(--muted)] mt-3">
            {settings ? (settings.footerText?.[lang] || settings.footerText?.en || "") : t("hero.subtitle")}
          </p>
        </div>
        <div>
          <div className="text-sm font-semibold mb-3">{t("nav.projects")}</div>
          <ul className="space-y-2 text-sm text-[color:var(--muted)]">
            <li><Link href="/projects">Portfolio</Link></li>
            <li><Link href="/blog">Blog</Link></li>
            <li><Link href="/profile">Profile</Link></li>
          </ul>
        </div>
        <div>
          <div className="text-sm font-semibold mb-3">{t("contact.title")}</div>
          <div className="flex gap-3">
            {social.instagram && <a href={social.instagram} target="_blank" rel="noreferrer" className="p-2 rounded-full border border-[color:var(--border)] hover:bg-white/10"><Instagram size={16}/></a>}
            {social.youtube && <a href={social.youtube} target="_blank" rel="noreferrer" className="p-2 rounded-full border border-[color:var(--border)] hover:bg-white/10"><Youtube size={16}/></a>}
            {social.linkedin && <a href={social.linkedin} target="_blank" rel="noreferrer" className="p-2 rounded-full border border-[color:var(--border)] hover:bg-white/10"><Linkedin size={16}/></a>}
            {social.email && <a href={`mailto:${social.email}`} className="p-2 rounded-full border border-[color:var(--border)] hover:bg-white/10"><Mail size={16}/></a>}
          </div>
        </div>
      </div>
      <div className="container-x mt-8 pt-6 border-t border-[color:var(--border)] text-xs text-[color:var(--muted)]">
        © {new Date().getFullYear()} {name}. {t("footer.rights")}
      </div>
    </footer>
  );
}
