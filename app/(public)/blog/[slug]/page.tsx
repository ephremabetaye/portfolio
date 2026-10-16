"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Calendar, Clock } from "lucide-react";
import { useLanguage, bi } from "@/components/providers/language-provider";
import Image from "next/image";
import { readingTime } from "@/lib/utilities";
import { resolveImageUrl } from "@/lib/media";
import ImageLightbox from "@/components/media/ImageLightbox";

export default function ArticlePage() {
  const params = useParams<{ slug: string }>();
  const slug = params?.slug;
  const { t, lang } = useLanguage();
  const [post, setPost] = useState<any>(null);
  const [related, setRelated] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [zoom, setZoom] = useState(false);
  useEffect(() => {
    if (!slug) return;
    fetch(`/api/blog/${slug}`).then(r => r.json()).then(async d => {
      const p = d.data; setPost(p);
      if (p) {
        const r = await fetch("/api/blog").then(x => x.json());
        setRelated((r.data || []).filter((x: any) => x.slug !== p.slug && (x.categories||[]).some((c:string)=> (p.categories||[]).includes(c))).slice(0,3));
      }
    }).finally(() => setLoading(false));
  }, [slug]);
  if (loading) return <div className="container-x py-24"><div className="skeleton h-10 w-1/2" /></div>;
  if (!post) return <div className="container-x py-24">{t("blog.empty")}</div>;
  const featuredImg = resolveImageUrl(post.featuredImage);
  return (
    <article className="container-x py-12 max-w-3xl">
      <Link href="/blog" className="inline-flex items-center gap-2 text-sm text-[color:var(--muted)] hover:text-white mb-6"><ArrowLeft size={16}/>Back</Link>
      {featuredImg && (
        <div className="relative aspect-video rounded-2xl overflow-hidden mb-8 cursor-zoom-in" onClick={() => setZoom(true)}>
          <Image src={featuredImg} alt={bi(post.title,lang)} fill className="object-cover" sizes="(max-width:768px)100vw,768px" />
        </div>
      )}
      {zoom && featuredImg && <ImageLightbox src={featuredImg} alt={bi(post.title, lang)} onClose={() => setZoom(false)} />}
      <h1 className="text-4xl md:text-5xl font-extrabold">{bi(post.title, lang)}</h1>
      <div className="flex flex-wrap gap-4 text-sm text-[color:var(--muted)] mt-4">
        <span>{post.author}</span>
        {post.publishedAt && <span className="flex items-center gap-1"><Calendar size={14}/>{new Date(post.publishedAt).toLocaleDateString()}</span>}
        <span className="flex items-center gap-1"><Clock size={14}/>{readingTime(bi(post.content,lang))} {t("blog.minRead")}</span>
      </div>
      {(post.categories||[]).length > 0 && <div className="flex gap-2 mt-4 flex-wrap">{post.categories.map((c:string,i:number)=><span key={i} className="px-2 py-1 rounded-full bg-white/5 text-xs">{c}</span>)}</div>}
      <div className="prose-dark mt-8 whitespace-pre-wrap">{bi(post.content, lang)}</div>
      {related.length > 0 && (
        <section className="mt-16">
          <h2 className="text-2xl font-bold mb-4">{t("blog.related")}</h2>
          <div className="grid md:grid-cols-3 gap-4">
            {related.map((r:any) => {
              const img = resolveImageUrl(r.featuredImage);
              return (
              <Link key={r._id} href={`/blog/${r.slug}`} className="rounded-xl border border-[color:var(--border)] overflow-hidden">
                <div className="aspect-video bg-[color:var(--surface)]">{img && <img src={img} alt="" className="w-full h-full object-cover" />}</div>
                <div className="p-3 text-sm font-medium">{bi(r.title, lang)}</div>
              </Link>
              );
            })}
          </div>
        </section>
      )}
    </article>
  );
}