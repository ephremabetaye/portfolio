"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Calendar, Wrench, User, ExternalLink } from "lucide-react";
import { useLanguage, bi } from "@/components/providers/language-provider";
import { pickImage, resolveVideoSource } from "@/lib/media";
import ImageLightbox from "@/components/media/ImageLightbox";

export default function ProjectDetailPage() {
  const params = useParams<{ slug: string }>();
  const slug = params?.slug;
  const { t, lang } = useLanguage();
  const [project, setProject] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [zoom, setZoom] = useState(false);
  useEffect(() => {
    if (!slug) return;
    fetch(`/api/projects/${slug}`).then(r => r.json()).then(d => setProject(d.data)).finally(() => setLoading(false));
  }, [slug]);
  if (loading) return <div className="container-x py-24"><div className="skeleton h-10 w-1/2" /></div>;
  if (!project) return <div className="container-x py-24">{t("projects.noProjects")}</div>;

  // Video comes from YouTube (embedded player) or Google Cloud/Drive (native player / preview).
  const video = resolveVideoSource(project.videoUrl);
  // Photo from Google Cloud/Drive, or the YouTube/Drive video thumbnail as an alternative.
  const thumb = pickImage(project.thumbnail, project.videoUrl);
  const watchLabel = video.kind === "youtube" ? "Watch on YouTube" : video.kind === "drive" ? "Open in Google Drive" : "Watch";

  return (
    <div className="container-x py-12">
      <Link href="/projects" className="inline-flex items-center gap-2 text-sm text-[color:var(--muted)] hover:text-white mb-6"><ArrowLeft size={16}/>Back</Link>
      <div className="aspect-video w-full max-h-[420px] rounded-2xl overflow-hidden border border-[color:var(--border)] bg-[color:var(--surface)]">
        {video.kind === "youtube" || video.kind === "drive" || video.kind === "embed" ? (
          <iframe
            src={video.embedUrl}
            title={bi(project.title,lang)}
            className="w-full h-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
          />
        ) : video.kind === "file" ? (
          <video src={video.src} poster={thumb || undefined} controls playsInline className="w-full h-full" />
        ) : thumb ? (
          <img src={thumb} alt={bi(project.title,lang)} onClick={() => setZoom(true)} className="w-full h-full object-cover cursor-zoom-in" />
        ) : null}
      </div>
      {zoom && thumb && <ImageLightbox src={thumb} alt={bi(project.title, lang)} onClose={() => setZoom(false)} />}
      <div className="grid md:grid-cols-3 gap-8 mt-8">
        <div className="md:col-span-2">
          <h1 className="text-4xl font-extrabold">{bi(project.title, lang)}</h1>
          <p className="text-[color:var(--muted)] mt-2">{project.category}</p>
          <div className="mt-6 text-[color:var(--muted)] leading-relaxed whitespace-pre-wrap">{bi(project.description, lang)}</div>
        </div>
        <div className="space-y-4">
          {project.projectDate && <div className="rounded-xl border border-[color:var(--border)] p-4"><div className="text-xs text-[color:var(--muted)] flex items-center gap-1"><Calendar size={12}/>Date</div><div className="mt-1">{new Date(project.projectDate).toLocaleDateString()}</div></div>}
          {project.client && <div className="rounded-xl border border-[color:var(--border)] p-4"><div className="text-xs text-[color:var(--muted)] flex items-center gap-1"><User size={12}/>Client</div><div className="mt-1">{project.client}</div></div>}
          {project.tools?.length > 0 && <div className="rounded-xl border border-[color:var(--border)] p-4"><div className="text-xs text-[color:var(--muted)] flex items-center gap-1"><Wrench size={12}/>Tools</div><div className="flex flex-wrap gap-1.5 mt-2">{project.tools.map((t: string,i:number)=><span key={i} className="px-2 py-0.5 rounded bg-white/5 text-xs">{t}</span>)}</div></div>}
          {project.videoUrl && <a href={video.kind !== "none" ? video.watchUrl : project.videoUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-[color:var(--border)] hover:bg-white/10"><ExternalLink size={14}/>{watchLabel}</a>}
        </div>
      </div>
    </div>
  );
}