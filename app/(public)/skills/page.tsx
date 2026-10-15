"use client";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useLanguage, bi } from "@/components/providers/language-provider";

export default function SkillsPage() {
  const { t, lang } = useLanguage();
  const [skills, setSkills] = useState<any[]>([]);
  useEffect(() => { fetch("/api/skills").then(r => r.json()).then(d => setSkills(d.data || [])); }, []);
  const groups = skills.reduce((acc: any, s) => { (acc[s.category] ||= []).push(s); return acc; }, {});
  return (
    <div className="container-x py-16">
      <h1 className="text-4xl md:text-5xl font-extrabold mb-2">{t("skillsPage.title")}</h1>
      <p className="text-[color:var(--muted)] mb-10">{t("skillsPage.subtitle")}</p>
      {Object.keys(groups).map(cat => (
        <div key={cat} className="mb-10">
          <h2 className="text-2xl font-bold mb-4">{cat}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {groups[cat].map((s: any, i: number) => (
              <motion.div key={s._id} initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.05 }} className="glass-card p-5 hover:-translate-y-1 transition">
                <div className="flex items-center justify-between">
                  <div className="font-semibold">{s.name}</div>
                  {s.proficiency ? <div className="text-sm text-[color:var(--accent-2)]">{s.proficiency}%</div> : null}
                </div>
                <p className="text-sm text-[color:var(--muted)] mt-1">{bi(s.description, lang)}</p>
                {s.proficiency ? (
                  <div className="mt-3 h-1.5 bg-white/5 rounded-full overflow-hidden">
                    <motion.div initial={{ width: 0 }} whileInView={{ width: `${s.proficiency}%` }} viewport={{ once: true }} transition={{ duration: 1 }} className="h-full bg-gradient-to-r from-[color:var(--accent)] to-[color:var(--accent-2)]" />
                  </div>
                ) : null}
              </motion.div>
            ))}
          </div>
        </div>
      ))}
      {skills.length === 0 && <div className="text-[color:var(--muted)]">{t("common.empty")}</div>}
    </div>
  );
}
