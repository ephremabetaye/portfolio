"use client";
import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import Image from "next/image";
import { Play } from "lucide-react";
import { useLanguage, bi } from "@/components/providers/language-provider";
import { pickImage, resolveVideoSource } from "@/lib/media";
import VideoModal from "@/components/media/VideoModal";

export default function ProjectCard({ project }: { project: any }) {
  const { lang } = useLanguage();
  const [playing, setPlaying] = useState(false);
  // Photo from Google Cloud/Drive, or — as an alternative — the YouTube video thumbnail.
  const thumb = pickImage(project.thumbnail, project.videoUrl);
  // Play the video right here, without leaving the page.
  const hasVideo = resolveVideoSource(project.videoUrl).kind !== "none";

  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }}
      className="group relative glass-card overflow-hidden hover:-translate-y-1 transition duration-300"
    >
      <Link href={`/projects/${project.slug}`} className="block">
        <div className="relative aspect-[16/10] overflow-hidden bg-black">
          {thumb ? (
            <Image src={thumb} alt={bi(project.title, lang)} fill className="object-cover group-hover:scale-110 transition duration-700" sizes="(max-width:768px)100vw,(max-width:1200px)50vw,33vw" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-[color:var(--muted)]">No image</div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" />
          <div className="absolute top-3 left-3 flex gap-2">
            <span className="text-[10px] uppercase tracking-widest px-2.5 py-1 rounded-full bg-white/10 backdrop-blur border border-white/20">{project.category}</span>
            {project.featured && <span className="text-[10px] uppercase tracking-widest px-2.5 py-1 rounded-full bg-[color:var(--accent)]/80">Featured</span>}
          </div>
          {hasVideo && (
            <button
              type="button"
              aria-label="Play video"
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); setPlaying(true); }}
              className="absolute bottom-3 right-3 z-10 w-11 h-11 rounded-full bg-black/50 backdrop-blur border border-white/25 flex items-center justify-center hover:scale-110 hover:bg-[color:var(--accent)]/80 transition"
            >
              <Play size={16} fill="currentColor" />
            </button>
          )}
        </div>
        <div className="p-5">
          <h3 className="text-lg font-semibold group-hover:text-white">{bi(project.title, lang)}</h3>
          <p className="text-sm text-[color:var(--muted)] mt-2 line-clamp-2 leading-relaxed">{bi(project.description, lang)}</p>
          <div className="mt-4 flex items-center gap-2 text-xs text-[color:var(--accent-2)]">View project →</div>
        </div>
      </Link>
      {playing && <VideoModal url={project.videoUrl} title={bi(project.title, lang)} onClose={() => setPlaying(false)} />}
    </motion.article>
  );
}
