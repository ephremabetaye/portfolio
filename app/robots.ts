import type { MetadataRoute } from "next";
import { getSiteUrl } from "@/lib/env";

const base = getSiteUrl();

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/", disallow: ["/admin"] },
    sitemap: `${base}/sitemap.xml`,
  };
}
