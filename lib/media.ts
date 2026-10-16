/**
 * Media link helpers (photos & videos are link-only in this project).
 *
 * Rules:
 *  - Videos must be YouTube links (rendered with the YouTube embed player)
 *    or Google Cloud Storage / Google Drive links (rendered with a native player / Drive preview).
 *  - Images must be Google Cloud Storage / Google Drive links, or a YouTube link
 *    (the video thumbnail is then used as the image — "alternative" source).
 *
 * `validate*` / `enforce*` functions are used by the admin UI and the API routes to
 * enforce the sources. `resolve*` functions are used by the public pages to render
 * media from whichever approved source was stored (plus legacy links so old data
 * still displays).
 */

export type MediaSourceKind = "youtube" | "gcs" | "drive" | "google" | "external" | "invalid" | "none";

export type MediaCheck =
  | { ok: true; source: MediaSourceKind; normalized: string; note?: string }
  | { ok: false; error: string };

const IMAGE_EXT_RE = /\.(jpe?g|png|gif|webp|avif|bmp|svg|heic|heif|tiff?)(?:$|[?#])/i;
const VIDEO_EXT_RE = /\.(mp4|webm|mov|m4v|ogv|ogg|avi|mkv)(?:$|[?#])/i;

export const IMAGE_LINK_RULE =
  "Images must be a Google Cloud or Google Drive link (e.g. https://storage.googleapis.com/your-bucket/photo.jpg). You can also paste a YouTube link and its video thumbnail will be used as the image.";
export const VIDEO_LINK_RULE =
  "Videos must be a YouTube link (e.g. https://www.youtube.com/watch?v=...) or a Google Cloud / Google Drive link to a video file.";

export function parseHttpUrl(raw?: string | null): URL | null {
  if (!raw) return null;
  try {
    const u = new URL(raw.trim());
    if (u.protocol !== "http:" && u.protocol !== "https:") return null;
    return u;
  } catch {
    return null;
  }
}

/* ------------------------------------------------------------------ */
/* YouTube                                                             */
/* ------------------------------------------------------------------ */

const YOUTUBE_HOSTS = new Set([
  "youtube.com",
  "www.youtube.com",
  "m.youtube.com",
  "music.youtube.com",
  "youtu.be",
  "www.youtu.be",
  "youtube-nocookie.com",
  "www.youtube-nocookie.com",
]);

export function extractYouTubeId(raw?: string | null): string | null {
  const u = parseHttpUrl(raw);
  if (!u) return null;
  const host = u.hostname.toLowerCase();
  if (!YOUTUBE_HOSTS.has(host)) return null;

  let id: string | null = null;
  const path = u.pathname.replace(/\/+$/, "");
  if (host.endsWith("youtu.be")) {
    id = path.split("/").filter(Boolean)[0] ?? null;
  } else {
    id = u.searchParams.get("v");
    if (!id) {
      const m = path.match(/\/(?:embed|shorts|live|v)\/([^/]+)/);
      if (m) id = m[1];
    }
  }
  if (!id) return null;
  id = id.split(/[&?/]/)[0];
  return /^[\w-]{6,}$/.test(id) ? id : null;
}

export function youTubeWatchUrl(id: string) {
  return `https://www.youtube.com/watch?v=${id}`;
}

export function youTubeEmbedUrl(id: string) {
  return `https://www.youtube.com/embed/${id}?rel=0`;
}

export function youTubeThumbnailUrl(id: string) {
  return `https://i.ytimg.com/vi/${id}/hqdefault.jpg`;
}

/* ------------------------------------------------------------------ */
/* Google Cloud Storage / Firebase Storage                             */
/* ------------------------------------------------------------------ */

const GCS_HOSTS = new Set([
  "storage.googleapis.com",
  "storage.cloud.google.com",
  "firebasestorage.googleapis.com",
]);

const GOOGLE_IMAGE_HOSTS = new Set([
  "i.ytimg.com",
  "img.youtube.com",
  "lh3.googleusercontent.com",
  "lh4.googleusercontent.com",
  "lh5.googleusercontent.com",
  "lh6.googleusercontent.com",
  "yt3.ggpht.com",
]);

export function isGoogleCloudUrl(raw?: string | null): boolean {
  const u = parseHttpUrl(raw);
  return !!u && GCS_HOSTS.has(u.hostname.toLowerCase());
}

/** storage.cloud.google.com console download links -> public storage.googleapis.com links. */
export function normalizeGoogleCloudUrl(raw: string): string {
  const u = parseHttpUrl(raw);
  if (!u) return raw;
  if (u.hostname.toLowerCase() === "storage.cloud.google.com") u.hostname = "storage.googleapis.com";
  return u.toString();
}

/* ------------------------------------------------------------------ */
/* Google Drive                                                        */
/* ------------------------------------------------------------------ */

export function extractGoogleDriveId(raw?: string | null): string | null {
  const u = parseHttpUrl(raw);
  if (!u) return null;
  if (u.hostname.toLowerCase() !== "drive.google.com") return null;
  const m = u.pathname.match(/\/d\/([\w-]{10,})/);
  if (m) return m[1];
  const id = u.searchParams.get("id");
  return id && /^[\w-]{10,}$/.test(id) ? id : null;
}

export function driveWatchUrl(id: string) {
  return `https://drive.google.com/file/d/${id}/view`;
}

export function drivePreviewUrl(id: string) {
  return `https://drive.google.com/file/d/${id}/preview`;
}

/** Direct-usable image URL for a shared Drive file (works for public files). */
export function driveImageUrl(id: string) {
  return `https://lh3.googleusercontent.com/d/${id}`;
}

/* ------------------------------------------------------------------ */
/* Validation (admin UI + API)                                         */
/* ------------------------------------------------------------------ */

export function validateImageLink(raw?: string | null): MediaCheck {
  const value = (raw ?? "").trim();
  if (!value) return { ok: true, source: "none", normalized: "" };

  const u = parseHttpUrl(value);
  if (!u) return { ok: false, error: `Enter a full link starting with http:// or https://. ${IMAGE_LINK_RULE}` };

  const ytId = extractYouTubeId(value);
  if (ytId) {
    return {
      ok: true,
      source: "youtube",
      normalized: youTubeWatchUrl(ytId),
      note: "YouTube link detected — the video thumbnail will be used as the image.",
    };
  }

  if (isGoogleCloudUrl(value)) {
    if (VIDEO_EXT_RE.test(u.pathname)) {
      return { ok: false, error: "That link points to a video file, not an image. Use it in the Video field instead." };
    }
    return { ok: true, source: "gcs", normalized: normalizeGoogleCloudUrl(value) };
  }

  const driveId = extractGoogleDriveId(value);
  if (driveId) return { ok: true, source: "drive", normalized: driveWatchUrl(driveId) };

  if (GOOGLE_IMAGE_HOSTS.has(u.hostname.toLowerCase())) return { ok: true, source: "google", normalized: value };

  return { ok: false, error: IMAGE_LINK_RULE };
}

export function validateVideoLink(raw?: string | null): MediaCheck {
  const value = (raw ?? "").trim();
  if (!value) return { ok: true, source: "none", normalized: "" };

  const u = parseHttpUrl(value);
  if (!u) return { ok: false, error: `Enter a full link starting with http:// or https://. ${VIDEO_LINK_RULE}` };

  const ytId = extractYouTubeId(value);
  if (ytId) return { ok: true, source: "youtube", normalized: youTubeWatchUrl(ytId) };

  if (isGoogleCloudUrl(value)) {
    if (IMAGE_EXT_RE.test(u.pathname)) {
      return { ok: false, error: "That link points to an image file, not a video. Use it in the Thumbnail field instead." };
    }
    return { ok: true, source: "gcs", normalized: normalizeGoogleCloudUrl(value) };
  }

  const driveId = extractGoogleDriveId(value);
  if (driveId) return { ok: true, source: "drive", normalized: driveWatchUrl(driveId) };

  return { ok: false, error: VIDEO_LINK_RULE };
}

export function checkMediaLink(kind: "image" | "video", raw?: string | null): MediaCheck {
  return kind === "image" ? validateImageLink(raw) : validateVideoLink(raw);
}

/**
 * Admin helper: blocks saving only when the link was changed to an unapproved source.
 * Untouched legacy values are allowed so existing items can still be edited.
 */
export function mediaLinkError(kind: "image" | "video", value?: string | null, original?: string | null): string | null {
  if ((value ?? "") === (original ?? "")) return null;
  const check = checkMediaLink(kind, value);
  return check.ok ? null : check.error;
}

/**
 * API helper: validates/normalizes a media field in a request body.
 * Fields that are absent are left untouched; unchanged legacy values pass through.
 */
export function enforceMediaField(
  kind: "image" | "video",
  body: Record<string, unknown>,
  field: string,
  existing?: Record<string, unknown> | null,
): { ok: true } | { ok: false; error: string } {
  const value = body[field];
  if (value === undefined) return { ok: true };
  if (value === null) {
    body[field] = "";
    return { ok: true };
  }
  if (typeof value !== "string") return { ok: false, error: "Invalid media link" };

  const original = existing?.[field];
  const unchanged = typeof original === "string" && value.trim() === original.trim();
  if (unchanged) return { ok: true };

  const check = checkMediaLink(kind, value);
  if (!check.ok) return { ok: false, error: check.error };
  body[field] = check.normalized;
  return { ok: true };
}

/* ------------------------------------------------------------------ */
/* Rendering helpers (public pages)                                    */
/* ------------------------------------------------------------------ */

export type VideoRender =
  | { kind: "youtube"; embedUrl: string; watchUrl: string; thumbnail: string }
  | { kind: "drive"; embedUrl: string; watchUrl: string; thumbnail: string }
  | { kind: "embed"; embedUrl: string; watchUrl: string }
  | { kind: "file"; src: string; watchUrl: string }
  | { kind: "none" };

/** Resolve any stored video link to something renderable (YouTube / Drive / direct file). */
export function resolveVideoSource(raw?: string | null): VideoRender {
  const value = (raw ?? "").trim();
  if (!parseHttpUrl(value)) return { kind: "none" };

  const ytId = extractYouTubeId(value);
  if (ytId) {
    return {
      kind: "youtube",
      embedUrl: youTubeEmbedUrl(ytId),
      watchUrl: youTubeWatchUrl(ytId),
      thumbnail: youTubeThumbnailUrl(ytId),
    };
  }

  const driveId = extractGoogleDriveId(value);
  if (driveId) {
    return {
      kind: "drive",
      embedUrl: drivePreviewUrl(driveId),
      watchUrl: driveWatchUrl(driveId),
      thumbnail: driveImageUrl(driveId),
    };
  }

  // Legacy support: old Vimeo links that may already be stored.
  const vimeo = value.match(/vimeo\.com\/(?:video\/)?(\d+)/);
  if (vimeo) {
    return { kind: "embed", embedUrl: `https://player.vimeo.com/video/${vimeo[1]}`, watchUrl: value };
  }

  return { kind: "file", src: isGoogleCloudUrl(value) ? normalizeGoogleCloudUrl(value) : value, watchUrl: value };
}

/** Resolve any stored image link to a URL usable in <img>/next Image. */
export function resolveImageUrl(raw?: string | null): string {
  const value = (raw ?? "").trim();
  if (!parseHttpUrl(value)) return "";

  const ytId = extractYouTubeId(value);
  if (ytId) return youTubeThumbnailUrl(ytId);

  const driveId = extractGoogleDriveId(value);
  if (driveId) return driveImageUrl(driveId);

  if (isGoogleCloudUrl(value)) return normalizeGoogleCloudUrl(value);
  return value;
}

/**
 * Best image for a card/detail view: the stored thumbnail, or — as an alternative —
 * the thumbnail of the stored YouTube/Drive video.
 */
export function pickImage(thumbnail?: string | null, fallbackVideoUrl?: string | null): string {
  const direct = resolveImageUrl(thumbnail);
  if (direct) return direct;
  const video = resolveVideoSource(fallbackVideoUrl);
  if (video.kind === "youtube" || video.kind === "drive") return video.thumbnail;
  return "";
}

/** Human label for a detected source. */
export function describeSource(kind: MediaSourceKind): string | null {
  switch (kind) {
    case "youtube":
      return "YouTube";
    case "gcs":
      return "Google Cloud";
    case "drive":
      return "Google Drive";
    case "google":
      return "Google";
    default:
      return null;
  }
}
