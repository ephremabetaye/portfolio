"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { ArrowRight, Play } from "lucide-react";
import ProjectCard from "@/components/projects/ProjectCard";
import { useLanguage, bi } from "@/components/providers/language-provider";
import { resolveImageUrl, resolveVideoSource } from "@/lib/media";
import SkillIcon from "@/components/skills/SkillIcon";
import VideoModal from "@/components/media/VideoModal";

export default function HomePage() {
  const { t, lang } = useLanguage();
  const [settings, setSettings] = useState<any>({});
  const [projects, setProjects] = useState<any[]>([]);
  const [posts, setPosts] = useState<any[]>([]);
  const [skills, setSkills] = useState<any[]>([]);
  const [profile, setProfile] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [reelOpen, setReelOpen] = useState(false);

  useEffect(() => {
    Promise.all([
      fetch("/api/settings").then(r => r.json()).catch(() => ({ data: {} })),
      fetch("/api/projects?featured=1").then(r => r.json()).catch(() => ({ data: [] })),
      fetch("/api/blog").then(r => r.json()).catch(() => ({ data: [] })),
      fetch("/api/skills").then(r => r.json()).catch(() => ({ data: [] })),
      fetch("/api/profile").then(r => r.json()).catch(() => ({ data: {} })),
    ]).then(([s, p, b, k, prof]) => {
      setSettings(s.data || {});
      const fp = p.data || [];
      if (fp.length === 0) fetch("/api/projects").then(r => r.json()).then(d => setProjects(d.data || [])).catch(() => {});
      else setProjects(fp);
      setPosts((b.data || []).slice(0, 3));
      setSkills((k.data || []).slice(0, 8));
      setProfile(prof.data || {});
    }).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="container-x py-24"><div className="skeleton h-10 w-1/2" /></div>;

  const heading = bi(settings?.heroHeading, lang) || t("hero.title");
  const subtitle = bi(settings?.heroSubtitle, lang) || t("hero.subtitle");
  // Photo comes from Google Cloud/Drive (or a YouTube thumbnail as an alternative).
  const profileImg = resolveImageUrl(profile?.image);
  // Showreel comes from YouTube or Google Cloud/Drive.
  const showreel = resolveVideoSource(settings?.showreelUrl);

  return (
    <div>
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10">
          <div className="absolute -top-40 -left-40 w-96 h-96 rounded-full bg-[color:var(--accent)]/20 blur-3xl" />
          <div className="absolute top-20 right-0 w-96 h-96 rounded-full bg-[color:var(--accent-2)]/10 blur-3xl" />
        </div>
        <div className="container-x pt-20 pb-16 md:pt-28 md:pb-24 grid md:grid-cols-2 gap-10 items-center">
          <div>
            <motion.h1 initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }} className="text-4xl md:text-6xl font-extrabold leading-tight">
              <span className="gradient-text">{heading}</span>
            </motion.h1>
            <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.15 }} className="text-lg text-[color:var(--muted)] mt-5 max-w-xl">
              {subtitle}
            </motion.p>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.3 }} className="flex flex-wrap gap-3 mt-8">
              <Link href={settings?.primaryButtonLink || "/projects"} className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[color:var(--accent)] hover:opacity-90 transition font-medium">
                {bi(settings?.primaryButtonText, lang) || t("hero.viewWork")} <ArrowRight size={16}/>
              </Link>
              <Link href={settings?.secondaryButtonLink || "/contact"} className="inline-flex items-center gap-2 px-6 py-3 rounded-full border border-[color:var(--border)] hover:bg-white/10 transition font-medium">
                {bi(settings?.secondaryButtonText, lang) || t("hero.contactMe")}
              </Link>
            </motion.div>
          </div>
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.9, delay: 0.2 }} className="relative max-w-sm mx-auto">
            <div className="absolute -inset-4 rounded-3xl bg-gradient-to-br from-[color:var(--accent)]/30 to-[color:var(--accent-2)]/20 blur-2xl" />
            <div className="relative rounded-3xl overflow-hidden border border-white/10 shadow-2xl bg-[color:var(--surface)]">
              {profileImg ? (
                <img src={profileImg} alt={profile?.name} className="w-full aspect-[4/5] object-cover" />
              ) : (
                <div className="w-full aspect-[4/5] bg-gradient-to-br from-[color:var(--surface-2)] to-black" />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
              <div className="absolute bottom-0 inset-x-0 p-5">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-full bg-white/15 backdrop-blur border border-white/20 flex items-center justify-center overflow-hidden">
                    {profileImg && <img src={profileImg} alt="" className="w-full h-full object-cover" />}
                  </div>
                  <div>
                    <div className="font-semibold">{profile?.name || "Amanuel Bekele"}</div>
                    <div className="text-xs text-[color:var(--muted)]">{profile?.title || "Video Editor"}</div>
                  </div>
                </div>
              </div>
              {showreel.kind !== "none" && (
                <button
                  type="button"
                  onClick={() => setReelOpen(true)}
                  title={t("hero.showreel")}
                  aria-label={t("hero.showreel")}
                  className="absolute top-4 right-4 w-12 h-12 rounded-full bg-black/40 backdrop-blur border border-white/20 flex items-center justify-center hover:scale-110 transition"
                >
                  <Play size={20} fill="currentColor" />
                </button>
              )}
            </div>
          </motion.div>
        </div>
      </section>

      <section className="container-x py-20">
        <div className="flex items-end justify-between mb-8">
          <div>
            <h2 className="section-title">{t("home.featuredProjects")}</h2>
            <p className="text-[color:var(--muted)] mt-2">A selection of recent work.</p>
          </div>
          <Link href="/projects" className="hidden md:inline-flex items-center gap-2 text-sm hover:text-white text-[color:var(--muted)]">All <ArrowRight size={16}/></Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.length === 0 ? (
            <div className="col-span-full text-[color:var(--muted)]">{t("projects.noProjects")}</div>
          ) : (
            projects.map((p: any) => <ProjectCard key={p._id} project={p} />)
          )}
        </div>
      </section>

      <section className="container-x py-16">
        <h2 className="section-title mb-8">{t("home.skills")}</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {skills.map((s: any, i: number) => (
            <motion.div key={s._id} initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.05 }} className="glass-card p-5 hover:-translate-y-1 transition">
              <div className="flex items-center gap-3">
                <SkillIcon skill={s} size={40} />
                <div className="min-w-0">
                  <div className="font-semibold truncate">{s.name}</div>
                  <div className="text-xs text-[color:var(--muted)] mt-0.5 truncate">{bi(s.description, lang) || s.category}</div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {posts.length > 0 && (
        <section className="container-x py-16">
          <h2 className="section-title mb-8">{t("home.recentPosts")}</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {posts.map((p: any) => {
              const img = resolveImageUrl(p.featuredImage);
              return (
              <Link key={p._id} href={`/blog/${p.slug}`} className="group glass-card overflow-hidden hover:-translate-y-1 transition">
                <div className="relative aspect-video overflow-hidden bg-black">
                  {img && <Image src={img} alt={bi(p.title, lang)} fill className="object-cover group-hover:scale-105 transition duration-500" sizes="(max-width:768px)100vw,33vw" />}
                </div>
                <div className="p-5">
                  <div className="font-semibold">{bi(p.title, lang)}</div>
                  <div className="text-sm text-[color:var(--muted)] mt-2 line-clamp-2">{bi(p.excerpt, lang)}</div>
                </div>
              </Link>
              );
            })}
          </div>
        </section>
      )}

      <section className="container-x py-20 text-center">
        <h2 className="section-title">{bi(settings?.contactCtaHeading, lang) || t("home.contactCta")}</h2>
        <p className="text-[color:var(--muted)] mt-3">{bi(settings?.contactCtaText, lang) || t("home.contactCtaSub")}</p>
        <Link href="/contact" className="inline-flex items-center gap-2 mt-6 px-6 py-3 rounded-full bg-[color:var(--accent)] hover:opacity-90 transition">{t("hero.contactMe")} <ArrowRight size={16}/></Link>
      </section>

      {reelOpen && settings?.showreelUrl && (
        <VideoModal url={settings.showreelUrl} title={settings?.siteName ? `${settings.siteName} — ${t("hero.showreel")}` : t("hero.showreel")} onClose={() => setReelOpen(false)} />
      )}
    </div>
  );
}
