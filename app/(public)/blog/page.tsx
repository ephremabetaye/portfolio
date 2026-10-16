"use client";
import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { Search } from "lucide-react";
import { useLanguage, bi } from "@/components/providers/language-provider";
import Image from "next/image";
import { readingTime } from "@/lib/utilities";
import { resolveImageUrl } from "@/lib/media";

export default function BlogPage() {
  const { t, lang } = useLanguage();
  const [posts, setPosts] = useState<any[]>([]);
  const [cat, setCat] = useState("All");
  const [q, setQ] = useState("");
  const [visible, setVisible] = useState(9);
  useEffect(() => { fetch("/api/blog").then(r => r.json()).then(d => setPosts(d.data || [])); }, []);
  const categories = useMemo(() => ["All", ...Array.from(new Set(posts.flatMap(p => p.categories || [])))], [posts]);
  const filtered = posts.filter(p => (cat === "All" || (p.categories||[]).includes(cat)) && (q === "" || (bi(p.title,lang)+bi(p.excerpt,lang)).toLowerCase().includes(q.toLowerCase())));
  return (
    <div className="container-x py-16">
      <h1 className="text-4xl md:text-5xl font-extrabold mb-2">{t("blog.title")}</h1>
      <p className="text-[color:var(--muted)] mb-8">{t("blog.subtitle")}</p>
      <div className="flex flex-col md:flex-row gap-4 mb-8">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[color:var(--muted)]" />
          <input value={q} onChange={e => setQ(e.target.value)} placeholder={t("blog.searchPlaceholder")} className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-[color:var(--surface)] border border-[color:var(--border)] outline-none focus:border-[color:var(--accent)]" />
        </div>
        <div className="flex gap-2 overflow-x-auto no-scrollbar">
          {categories.map(c => (
            <button key={c} onClick={() => setCat(c)} className={`px-4 py-2 rounded-full text-sm whitespace-nowrap border transition ${cat === c ? "bg-[color:var(--accent)] border-[color:var(--accent)]" : "border-[color:var(--border)] hover:bg-white/10"}`}>{c}</button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.slice(0, visible).map(p => {
          const img = resolveImageUrl(p.featuredImage);
          return (
          <Link key={p._id} href={`/blog/${p.slug}`} className="group glass-card overflow-hidden hover:-translate-y-1 transition">
            <div className="relative aspect-video overflow-hidden bg-black">
              {img && <Image src={img} alt={bi(p.title,lang)} fill className="object-cover group-hover:scale-105 transition duration-500" sizes="(max-width:768px)100vw,33vw" />}
            </div>
            <div className="p-5">
              <div className="text-xs text-[color:var(--accent)]">{(p.categories||[]).join(" · ")}</div>
              <h3 className="font-semibold mt-2 group-hover:text-white">{bi(p.title, lang)}</h3>
              <p className="text-sm text-[color:var(--muted)] mt-2 line-clamp-3">{bi(p.excerpt, lang)}</p>
              <div className="flex items-center justify-between mt-4 text-xs text-[color:var(--muted)]">
                <span>{p.author}</span>
                <span>{readingTime(bi(p.content, lang))} {t("blog.minRead")}</span>
              </div>
            </div>
          </Link>
          );
        })}
      </div>

      {filtered.length > visible && (
        <div className="text-center mt-10">
          <button onClick={() => setVisible(v => v + 9)} className="px-6 py-3 rounded-full border border-[color:var(--border)] hover:bg-white/10">Load more</button>
        </div>
      )}
      {filtered.length === 0 && <div className="text-[color:var(--muted)] mt-8">{t("blog.empty")}</div>}
    </div>
  );
}
