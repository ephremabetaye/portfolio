"use client";

import { useEffect } from "react";
import { createPortal } from "react-dom";
import { motion } from "framer-motion";
import { X } from "lucide-react";
import { resolveVideoSource } from "@/lib/media";

type Props = {
  url: string;
  title?: string;
  onClose: () => void;
};

/**
 * Plays a video inside the site (no redirect): YouTube embeds, Google Drive previews,
 * or Google Cloud / direct video files in a native player.
 *
 * The modal is portalled to <body> so it always covers the whole viewport: ancestors
 * using backdrop-filter or transforms (e.g. the glass project cards) become containing
 * blocks for position:fixed elements and would otherwise clip the player inside the card.
 */
export default function VideoModal({ url, title, onClose }: Props) {
  const video = resolveVideoSource(url);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [onClose]);

  if (typeof document === "undefined" || video.kind === "none") return null;

  // The player opens from a click (user gesture), so start embedded playback right away.
  const embedUrl =
    video.kind === "youtube" || video.kind === "embed"
      ? `${video.embedUrl}${video.embedUrl.includes("?") ? "&" : "?"}autoplay=1`
      : video.kind === "drive"
        ? video.embedUrl
        : "";

  return createPortal(
    <motion.div
      role="dialog"
      aria-modal="true"
      aria-label={title || "Video player"}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      onClick={onClose}
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/85 backdrop-blur-sm p-4"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.2 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-4xl"
      >
        <div className="flex items-center justify-between gap-4 mb-3">
          <div className="font-semibold truncate">{title || "Video"}</div>
          <button onClick={onClose} aria-label="Close video" className="p-2 rounded-full border border-white/15 hover:bg-white/10 shrink-0">
            <X size={18} />
          </button>
        </div>
        <div className="aspect-video rounded-2xl overflow-hidden border border-white/10 bg-black shadow-2xl">
          {video.kind === "youtube" || video.kind === "drive" || video.kind === "embed" ? (
            <iframe
              src={embedUrl}
              title={title || "Video"}
              className="w-full h-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; fullscreen"
              allowFullScreen
            />
          ) : (
            <video src={video.src} controls autoPlay playsInline className="w-full h-full" />
          )}
        </div>
        <div className="mt-3 flex items-center justify-between text-xs text-[color:var(--muted)]">
          <span>Playing inside the site.</span>
          {video.kind !== "file" && (
            <a href={video.watchUrl} target="_blank" rel="noreferrer" className="hover:text-white underline underline-offset-2">
              Open original
            </a>
          )}
        </div>
      </motion.div>
    </motion.div>,
    document.body
  );
}
