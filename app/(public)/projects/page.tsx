"use client";
import { useEffect, useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import ProjectCard from "@/components/projects/ProjectCard";
import { useLanguage, bi } from "@/components/providers/language-provider";
import { Search } from "lucide-react";

const CATS = ["All", "Commercial", "Music Videos", "Cinematic", "Social Media", "Documentary", "Motion Graphics"];

export default function ProjectsPage() {
  const { t, lang } = useLanguage();
  const [projects, setProjects] = useState<any[]>([]);
  const [cat, setCat] = useState("All");
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/projects").then(r => r.json()).then(d => setProjects(d.data || [])).finally(() => setLoading(false));
  }, []);

  const categories = useMemo(() => {
    const set = new Set(projects.map(p => p.category).filter(Boolean));
    return ["All", ...Array.from(set)];
  }, [projects]);

  const filtered = projects.filter(p => (cat === "All" || p.category === cat) && (q === "" || (bi(p.title, lang) + bi(p.description, lang)).toLowerCase().includes(q.toLowerCase())));

  return (
    <div className="container-x py-16">
      <h1 className="text-4xl md:text-5xl font-extrabold mb-2">{t("projects.title")}</h1>
      <p className="text-[color:var(--muted)] mb-8">{t("projects.subtitle")}</p>

      <div className="flex flex-col md:flex-row gap-4 mb-8">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[color:var(--muted)]" />
          <input value={q} onChange={e => setQ(e.target.value)} placeholder={t("common.search")} className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-[color:var(--surface)] border border-[color:var(--border)] outline-none focus:border-[color:var(--accent)]" />
        </div>
        <div className="flex gap-2 overflow-x-auto no-scrollbar">
          {categories.map(c => (
            <button key={c} onClick={() => setCat(c)} className={`px-4 py-2 rounded-full text-sm whitespace-nowrap border transition ${cat === c ? "bg-[color:var(--accent)] border-[color:var(--accent)]" : "border-[color:var(--border)] hover:bg-white/10"}`}>{c}</button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">{Array.from({length:6}).map((_,i) => <div key={i} className="skeleton h-64" />)}</div>
      ) : filtered.length === 0 ? (
        <div className="text-[color:var(--muted)]">{t("projects.noProjects")}</div>
      ) : (
        <motion.div layout className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence>
            {filtered.map(p => (
              <motion.div key={p._id} layout initial={{opacity:0,scale:.95}} animate={{opacity:1,scale:1}} exit={{opacity:0,scale:.95}}>
                <ProjectCard project={p} />
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      )}
    </div>
  );
}
