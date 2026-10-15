"use client";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { Mail, MapPin, Phone, Globe, Video } from "lucide-react";
import { useLanguage, bi } from "@/components/providers/language-provider";

export default function ProfilePage() {
  const { t, lang } = useLanguage();
  const [profile, setProfile] = useState<any>(null);
  useEffect(() => { fetch("/api/profile").then(r => r.json()).then(d => setProfile(d.data)).catch(() => {}); }, []);
  if (!profile) return <div className="container-x py-24"><div className="skeleton h-10 w-1/3" /></div>;
  const social = profile.social || {};
  return (
    <div className="container-x py-16">
      <div className="grid md:grid-cols-3 gap-10">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="md:col-span-1">
          <div className="relative mx-auto w-full max-w-sm aspect-[3/4] rounded-2xl overflow-hidden border border-white/10 bg-[color:var(--surface)] shadow-2xl">
            {profile.image ? <Image src={profile.image} alt={profile.name} fill className="object-cover" sizes="(max-width:768px)90vw,320px" /> : null}
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
          </div>
          <div className="mt-6 space-y-2 text-sm text-[color:var(--muted)]">
            {profile.location && <div className="flex items-center gap-2"><MapPin size={14}/>{profile.location}</div>}
            {profile.phone && <div className="flex items-center gap-2"><Phone size={14}/>{profile.phone}</div>}
            {profile.contactEmail && <div className="flex items-center gap-2"><Mail size={14}/>{profile.contactEmail}</div>}
          </div>
          <div className="flex gap-2 mt-4 flex-wrap">
            {social.instagram && <a href={social.instagram} target="_blank" rel="noreferrer" className="p-2 rounded-full border border-[color:var(--border)] hover:bg-white/10"><Globe size={16}/></a>}
            {social.youtube && <a href={social.youtube} target="_blank" rel="noreferrer" className="p-2 rounded-full border border-[color:var(--border)] hover:bg-white/10"><Video size={16}/></a>}
            {social.linkedin && <a href={social.linkedin} target="_blank" rel="noreferrer" className="p-2 rounded-full border border-[color:var(--border)] hover:bg-white/10"><Globe size={16}/></a>}
            {social.vimeo && <a href={social.vimeo} target="_blank" rel="noreferrer" className="p-2 rounded-full border border-[color:var(--border)] hover:bg-white/10"><Video size={16}/></a>}
            {social.website && <a href={social.website} target="_blank" rel="noreferrer" className="p-2 rounded-full border border-[color:var(--border)] hover:bg-white/10"><Globe size={16}/></a>}
          </div>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="md:col-span-2">
          <h1 className="text-4xl md:text-5xl font-extrabold">{profile.name}</h1>
          <p className="text-xl text-[color:var(--accent-2)] mt-2">{profile.title}</p>
          <div className="mt-6 text-[color:var(--muted)] leading-relaxed">{bi(profile.bio, lang)}</div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mt-8">
            <div className="rounded-xl border border-[color:var(--border)] p-4 text-center">
              <div className="text-3xl font-bold">{profile.yearsExperience}+</div>
              <div className="text-xs text-[color:var(--muted)] mt-1">{t("profile.experience")}</div>
            </div>
            <div className="rounded-xl border border-[color:var(--border)] p-4 text-center">
              <div className="text-3xl font-bold">{(profile.services || []).length}</div>
              <div className="text-xs text-[color:var(--muted)] mt-1">{t("profile.services")}</div>
            </div>
            <div className="rounded-xl border border-[color:var(--border)] p-4 text-center">
              <div className="text-3xl font-bold">{(profile.tools || []).length}</div>
              <div className="text-xs text-[color:var(--muted)] mt-1">{t("profile.tools")}</div>
            </div>
          </div>

          <div className="mt-10">
            <h2 className="text-2xl font-bold mb-3">{t("profile.services")}</h2>
            <div className="flex flex-wrap gap-2">
              {(profile.services || []).map((s: string, i: number) => <span key={i} className="px-3 py-1.5 rounded-full border border-[color:var(--border)] text-sm">{s}</span>)}
            </div>
          </div>

          <div className="mt-8">
            <h2 className="text-2xl font-bold mb-3">{t("profile.tools")}</h2>
            <div className="flex flex-wrap gap-2">
              {(profile.tools || []).map((s: string, i: number) => <span key={i} className="px-3 py-1.5 rounded-full bg-white/5 text-sm">{s}</span>)}
            </div>
          </div>

          <div className="mt-8">
            <h2 className="text-2xl font-bold mb-3">{t("profile.philosophy")}</h2>
            <p className="text-[color:var(--muted)] leading-relaxed">{bi(profile.philosophy, lang)}</p>
          </div>

          {profile.achievements?.length > 0 && (
            <div className="mt-8">
              <h2 className="text-2xl font-bold mb-3">{t("profile.achievements")}</h2>
              <ul className="space-y-2 text-[color:var(--muted)]">
                {profile.achievements.map((a: string, i: number) => <li key={i} className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-[color:var(--accent)]"/>{a}</li>)}
              </ul>
            </div>
          )}
        </motion.div>
      </div>

      <div className="mt-16 text-center">
        <h2 className="text-3xl font-bold">{t("profile.hire")}</h2>
        <Link href="/contact" className="inline-flex items-center gap-2 mt-4 px-6 py-3 rounded-full bg-[color:var(--accent)] hover:opacity-90 transition">Contact Me</Link>
      </div>
    </div>
  );
}

