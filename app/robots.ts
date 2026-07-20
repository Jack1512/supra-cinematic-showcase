import type { MetadataRoute } from "next";
import { envSiteUrl } from "@/lib/utils";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
    },
    sitemap: `${envSiteUrl()}/sitemap.xml`,
  };
}
