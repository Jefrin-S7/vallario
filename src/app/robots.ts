import type { MetadataRoute } from "next";

// Reads the deployed site URL from env so this doesn't have to be edited by
// hand for staging vs. production — set NEXT_PUBLIC_SITE_URL accordingly.
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.vallario.com";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin", "/admin/", "/api/", "/dashboard", "/checkout"],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
