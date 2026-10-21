import type { MetadataRoute } from "next";
import { getSiteUrl } from "@/lib/env";

const base = getSiteUrl();

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    "/", "/profile", "/projects", "/skills", "/blog", "/contact",
  ].map((p) => ({ url: `${base}${p}`, lastModified: new Date() }));
}
