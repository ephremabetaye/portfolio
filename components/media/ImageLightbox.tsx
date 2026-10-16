"use client";

import { useEffect } from "react";
import { createPortal } from "react-dom";
import { motion } from "framer-motion";
import { X } from "lucide-react";

type Props = {
  src: string;
  alt?: string;
  onClose: () => void;
};

/**
 * Full-screen viewer for photos — clicking an image opens it inside the site.
 * Portalled to <body> so ancestor transforms/backdrop-filters can never clip it.
 */
export default function ImageLightbox({ src, alt, onClose }: Props) {
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

  // The lightbox only opens from a client interaction; the guard covers any server render.
  if (typeof document === "undefined") return null;

  return createPortal(
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
      className="fixed inset-0 z-[110] flex items-center justify-center bg-black/90 backdrop-blur-sm p-4 cursor-zoom-out"
    >
      <button onClick={onClose} aria-label="Close image" className="absolute top-4 right-4 p-2 rounded-full border border-white/15 hover:bg-white/10">
        <X size={18} />
      </button>
      <motion.img
        initial={{ opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.2 }}
        src={src}
        alt={alt || "Image"}
        onClick={(e) => e.stopPropagation()}
        className="max-h-[90vh] max-w-full rounded-xl object-contain shadow-2xl"
      />
    </motion.div>,
    document.body
  );
}
