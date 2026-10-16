"use client";

import { checkMediaLink, describeSource, resolveImageUrl, resolveVideoSource } from "@/lib/media";

type Props = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  kind: "image" | "video";
  hint?: string;
  full?: boolean;
  /** The value already stored when the editor was opened — a legacy link kept untouched is allowed on save. */
  original?: string;
};

/**
 * Link-only media input for the admin. Accepts:
 *  - video: YouTube links or Google Cloud / Google Drive links
 *  - image: Google Cloud / Google Drive links, or a YouTube link (thumbnail is used)
 * Shows live validation + preview. No file uploads.
 */
export default function MediaUrlField({ label, value, onChange, kind, hint, full, original }: Props) {
  const check = checkMediaLink(kind, value);
  const trimmed = (value || "").trim();
  // An unchanged legacy value (e.g. an old image host) is kept as-is when saving.
  const isLegacy = !!trimmed && !check.ok && !!original && trimmed === original.trim();
  const showPreview = !!trimmed && (check.ok || isLegacy);

  return (
    <div className={full ? "md:col-span-2" : ""}>
      <label className="text-xs text-[color:var(--muted)]">{label}</label>
      <div className="mt-1 flex gap-2">
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          spellCheck={false}
          placeholder={
            kind === "image"
              ? "https://storage.googleapis.com/your-bucket/photo.jpg  or  https://www.youtube.com/watch?v=..."
              : "https://www.youtube.com/watch?v=...  or  https://storage.googleapis.com/your-bucket/clip.mp4"
          }
          className="w-full px-3 py-2.5 rounded-xl bg-[color:var(--bg)] border border-[color:var(--border)] outline-none focus:border-[color:var(--accent)]"
        />
        {value ? (
          <button
            type="button"
            onClick={() => onChange("")}
            className="shrink-0 px-3 rounded-xl border border-[color:var(--border)] text-xs text-[color:var(--muted)] hover:bg-white/10"
          >
            Clear
          </button>
        ) : null}
      </div>

      <div className="mt-2 flex items-start gap-3">
        {showPreview && <Preview kind={kind} value={trimmed} />}
        <div className="text-xs min-w-0">
          {!trimmed ? (
            <span className="text-[color:var(--muted)]">Link only — file uploads are disabled.</span>
          ) : check.ok ? (
            <span className="text-emerald-400">
              ✓ {describeSource(check.source)} link accepted{check.source === "youtube" && kind === "image" ? " — the video thumbnail will be used" : ""}
              {check.note ? ` (${check.note})` : ""}
            </span>
          ) : isLegacy ? (
            <span className="text-amber-400">
              ⚠ Existing link kept — it still displays on the site. New links must come from {kind === "image" ? "Google Cloud / Google Drive (or YouTube for the thumbnail)" : "YouTube or Google Cloud / Google Drive"}.
            </span>
          ) : (
            <span className="text-red-400">✕ {check.error}</span>
          )}
          {hint && <div className="text-[11px] text-[color:var(--muted)] mt-1">{hint}</div>}
        </div>
      </div>
    </div>
  );
}

function Preview({ kind, value }: { kind: "image" | "video"; value: string }) {
  if (kind === "image") {
    const src = resolveImageUrl(value);
    if (!src) return null;
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img src={src} alt="preview" className="h-20 w-32 object-cover rounded-lg border border-[color:var(--border)] bg-black shrink-0" />
    );
  }

  const video = resolveVideoSource(value);
  if (video.kind === "youtube" || video.kind === "drive") {
    return (
      <div className="relative h-20 w-32 shrink-0 rounded-lg overflow-hidden border border-[color:var(--border)] bg-black">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={video.thumbnail} alt="preview" className="w-full h-full object-cover" />
        <span className="absolute inset-0 flex items-center justify-center text-white/90 text-lg">▶</span>
        <span className="absolute bottom-1 left-1 text-[10px] px-1.5 py-0.5 rounded bg-black/70 text-white/90">
          {video.kind === "youtube" ? "YouTube" : "Drive"}
        </span>
      </div>
    );
  }
  if (video.kind === "file") {
    return (
      <video src={video.src} muted playsInline controls className="h-20 w-32 shrink-0 rounded-lg border border-[color:var(--border)] bg-black object-cover" />
    );
  }
  return null;
}
