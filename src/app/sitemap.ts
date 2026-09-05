import type { MetadataRoute } from "next";
import { products } from "@/lib/data/products";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.vallario.com";

export default function sitemap(): MetadataRoute.Sitemap {
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${SITE_URL}/`, changeFrequency: "daily", priority: 1 },
    { url: `${SITE_URL}/shop`, changeFrequency: "daily", priority: 0.9 },
    { url: `${SITE_URL}/support`, changeFrequency: "monthly", priority: 0.7 },
    { url: `${SITE_URL}/legal`, changeFrequency: "monthly", priority: 0.6 },
    { url: `${SITE_URL}/legal/privacy`, changeFrequency: "monthly", priority: 0.5 },
    { url: `${SITE_URL}/legal/terms`, changeFrequency: "monthly", priority: 0.5 },
    { url: `${SITE_URL}/legal/refunds`, changeFrequency: "monthly", priority: 0.5 },
    { url: `${SITE_URL}/legal/license`, changeFrequency: "monthly", priority: 0.5 },
  ];

  const productRoutes: MetadataRoute.Sitemap = products.map((p) => ({
    url: `${SITE_URL}/products/${p.slug}`,
    lastModified: p.updatedAt,
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  return [...staticRoutes, ...productRoutes];
}
