// VALLARIO seed catalog.
// In production this data lives in Firestore (`products` collection — see
// src/lib/firebase/schema.md). This file mirrors that schema so the storefront
// can render real product shapes before Firebase is wired up.

export type ProductType =
  | "ebook"
  | "course"
  | "template"
  | "n8n_workflow"
  | "ai_agent"
  | "reels_pack"
  | "bundle";

export interface Product {
  id: string;
  slug: string;
  name: string;
  shortDescription: string;
  description: string;
  price: number;
  compareAtPrice?: number;
  currency: "USD";
  category: string;
  subcategory?: string;
  tags: string[];
  productType: ProductType;
  image: string;
  gallery: string[];
  accent: "violet" | "gold" | "emerald" | "crimson" | "steel";
  features: string[];
  whatsIncluded: string[];
  fileFormat: string;
  fileSize: string;
  license: "Personal" | "Commercial" | "Personal & Commercial";
  version: string;
  status: "active" | "draft" | "archived";
  featured: boolean;
  bestseller: boolean;
  newArrival: boolean;
  rating: number;
  reviewCount: number;
  salesCount: number;
  createdAt: string;
  updatedAt: string;
  meta?: Record<string, string | number | string[]>;
}

export const products: Product[] = [
  {
    id: "prod_mega_bundle",
    slug: "vallario-digital-product-mega-bundle",
    name: "VALLARIO Digital Product Mega Bundle",
    shortDescription:
      "Every VALLARIO collection in a single all-in-one bundle — AI automation, courses, ebooks, and content, together.",
    description:
      "The Mega Bundle brings VALLARIO's full catalog into one purchase: automation templates, a learning library, a business ebook shelf, and a content pack, sized for anyone who wants the entire toolkit at once instead of assembling it piece by piece. Everything ships with lifetime access and the update cadence of the individual products it contains.",
    price: 149,
    compareAtPrice: 397,
    currency: "USD",
    category: "Digital Product Bundles",
    tags: ["bundle", "best-value", "ai", "courses", "ebooks", "reels"],
    productType: "bundle",
    image: "/products/mega-bundle.png",
    gallery: ["/products/mega-bundle.png"],
    accent: "gold",
    features: [
      "Includes the AI & Automation, Courses, Ebooks, and Reels collections",
      "One-time payment, lifetime access",
      "Every included collection updates on its own schedule",
      "Single license covers all bundled products",
    ],
    whatsIncluded: [
      "15,000+ AI Agents, Bots & Automation Templates",
      "1,000+ Courses — All-In-One Learning Bundle",
      "Ultimate Ebooks Pack",
      "10K+ Reels Pack",
      "Digital Products Mega Collection",
    ],
    fileFormat: "Mixed (JSON, PDF, MP4, Notion, Canva)",
    fileSize: "~48 GB total",
    license: "Personal & Commercial",
    version: "2026.1",
    status: "active",
    featured: true,
    bestseller: true,
    newArrival: false,
    rating: 4.9,
    reviewCount: 0,
    salesCount: 0,
    createdAt: "2026-08-01",
    updatedAt: "2026-08-23",
  },
  {
    id: "prod_ebooks_pack",
    slug: "ultimate-ebooks-pack",
    name: "Ultimate Ebooks Pack",
    shortDescription:
      "24 premium ebooks on marketing, entrepreneurship, and online business — instant download, lifetime access.",
    description:
      "A curated shelf of 24 ebooks covering affiliate marketing, copywriting, traffic, content, and building an online brand. Built for creators and operators who want a working reference library instead of another cluttered download folder.",
    price: 27,
    compareAtPrice: 79,
    currency: "USD",
    category: "Ebooks",
    tags: ["ebooks", "marketing", "business", "copywriting"],
    productType: "ebook",
    image: "/products/ebooks-pack.png",
    gallery: ["/products/ebooks-pack.png"],
    accent: "crimson",
    features: [
      "24 premium ebooks across marketing, business, and mindset",
      "Instant download after purchase",
      "Lifetime access to the current edition",
      "Readable on any device",
    ],
    whatsIncluded: [
      "Affiliate Marketing for Newbies",
      "Chatbot Marketing Mastery",
      "Content Hacks",
      "Copywriting Expertise",
      "Digital Empire",
      "Email Marketing Influence",
      "Getting Traffic From Google",
      "How to Start an Online Coaching Business",
      "+16 additional titles",
    ],
    fileFormat: "PDF",
    fileSize: "1.2 GB",
    license: "Personal",
    version: "1.4",
    status: "active",
    featured: true,
    bestseller: true,
    newArrival: false,
    rating: 4.7,
    reviewCount: 0,
    salesCount: 0,
    createdAt: "2026-07-10",
    updatedAt: "2026-08-20",
    meta: { ebookCount: 24, formats: ["PDF"] },
  },
  {
    id: "prod_courses_bundle",
    slug: "1000-courses-all-in-one-learning-bundle",
    name: "1000+ Courses — All-In-One Learning Bundle",
    shortDescription:
      "A lifetime-access course library spanning business, marketing, and self-improvement — learn anywhere, anytime.",
    description:
      "1,000+ courses organized into ready-made collections — funnels, entrepreneurship, self-improvement, and more — for anyone building a skill set instead of collecting certificates. One-time payment, no recurring subscription.",
    price: 39,
    compareAtPrice: 129,
    currency: "USD",
    category: "Courses",
    tags: ["courses", "learning", "business", "self-improvement"],
    productType: "course",
    image: "/products/courses-bundle.png",
    gallery: ["/products/courses-bundle.png"],
    accent: "violet",
    features: [
      "1,000+ courses across 7 curated collections",
      "Lifetime access, one-time payment",
      "Regular library updates",
      "Learn on any device, at any pace",
    ],
    whatsIncluded: [
      "Courses & Funnels Bundle — 150+ courses",
      "Digital Course Collection — 200+ courses",
      "Entrepreneur Course Collection — 150+ courses",
      "How To Make Money Online Courses — 200+ courses",
      "Readymade Site Courses — 100+ courses",
      "Self Help Mindset Collection — 100+ courses",
      "Self Improvement Collection — 100+ courses",
    ],
    fileFormat: "Video (MP4) + PDF workbooks",
    fileSize: "~22 GB",
    license: "Personal",
    version: "3.0",
    status: "active",
    featured: true,
    bestseller: false,
    newArrival: false,
    rating: 4.6,
    reviewCount: 0,
    salesCount: 0,
    createdAt: "2026-06-18",
    updatedAt: "2026-08-15",
    meta: { courseCount: 1000, categories: 9 },
  },
  {
    id: "prod_digital_products",
    slug: "digital-products-mega-collection",
    name: "Digital Products Mega Collection",
    shortDescription:
      "Canva templates, Notion systems, prompt packs, and starter kits — the toolkit for creators who sell digital goods.",
    description:
      "A working set of PLR-friendly templates and tools — Canva kits, a Notion system, ChatGPT prompt packs, Shopify and website themes, and a starter bundle — for creators building or reselling their own digital products.",
    price: 32,
    compareAtPrice: 89,
    currency: "USD",
    category: "Digital Products",
    tags: ["templates", "canva", "notion", "prompts", "plr"],
    productType: "template",
    image: "/products/digital-products.png",
    gallery: ["/products/digital-products.png"],
    accent: "emerald",
    features: [
      "18 individual tools and template packs",
      "Instant access after purchase",
      "Lifetime updates as packs are refreshed",
      "PLR-eligible templates for resale where noted",
    ],
    whatsIncluded: [
      "Canva Sale Template",
      "1-Notion System",
      "500 Business Ideas",
      "AI ChatGPT Prompts",
      "AI Ebooks",
      "Canva Crash Course",
      "Canva Link-in-Bio Template",
      "Course Creator Collection",
      "Shopify Theme",
      "Ultimate Digital Product Starter Bundle",
      "+8 additional tools",
    ],
    fileFormat: "Canva, Notion, PDF, Shopify theme files",
    fileSize: "3.4 GB",
    license: "Personal & Commercial",
    version: "1.2",
    status: "active",
    featured: true,
    bestseller: false,
    newArrival: true,
    rating: 4.5,
    reviewCount: 0,
    salesCount: 0,
    createdAt: "2026-08-05",
    updatedAt: "2026-08-22",
  },
  {
    id: "prod_n8n_automation",
    slug: "15000-ai-agents-n8n-automation",
    name: "15,000+ AI Agents, Bots & Automation Templates",
    shortDescription:
      "15,000+ ready-to-import n8n workflows for AI agents, CRM automation, e-commerce, and social media.",
    description:
      "Plug. Import. Automate. Repeat. A mega pack of 15,000+ n8n workflow files covering AI & ChatGPT integrations, CRM and lead automation, e-commerce, social media, and file management — built to skip weeks of workflow setup for anyone running on n8n.",
    price: 59,
    compareAtPrice: 199,
    currency: "USD",
    category: "AI & Automation",
    subcategory: "n8n Workflows",
    tags: ["n8n", "automation", "ai-agents", "no-code", "workflows"],
    productType: "n8n_workflow",
    image: "/products/n8n-automation.png",
    gallery: ["/products/n8n-automation.png"],
    accent: "violet",
    features: [
      "15,000+ tested, ready-to-import JSON workflow files",
      "100% editable — customize any workflow for your use case",
      "One-time access, no subscriptions or recurring fees",
      "Covers AI & ChatGPT, CRM, e-commerce, social media, and reporting",
    ],
    whatsIncluded: [
      "AI & ChatGPT integration workflows",
      "Google Drive, Gmail, Sheets automations",
      "Social media auto-post and engagement flows",
      "Email & CRM lead automation (HubSpot, Notion, Airtable)",
      "E-commerce automation (Shopify, WooCommerce, Stripe, PayPal)",
      "Data & reporting pipelines",
      "AI bot flows and chat automations",
    ],
    fileFormat: "JSON (n8n workflow files)",
    fileSize: "890 MB",
    license: "Personal & Commercial",
    version: "2026.2",
    status: "active",
    featured: true,
    bestseller: true,
    newArrival: false,
    rating: 4.8,
    reviewCount: 0,
    salesCount: 0,
    createdAt: "2026-07-28",
    updatedAt: "2026-08-23",
    meta: {
      n8nVersion: "1.6x-compatible",
      workflowCount: 15000,
      difficulty: "Beginner–Intermediate",
      requiredCredentials: "Varies by workflow",
      note: "Designed for users familiar with n8n or willing to learn.",
    },
  },
  {
    id: "prod_reels_pack",
    slug: "10k-reels-pack",
    name: "10K+ Reels Pack",
    shortDescription:
      "10,000+ premium HD reels and raw clips in 15+ categories, ready for Instagram, TikTok, and YouTube Shorts.",
    description:
      "A vertical-format content library — 10,000+ HD reels and raw clips across 15+ categories — for creators and social teams who need a steady supply of ready-to-post or ready-to-edit footage.",
    price: 24,
    compareAtPrice: 69,
    currency: "USD",
    category: "Content & Social Media",
    tags: ["reels", "content", "social-media", "video"],
    productType: "reels_pack",
    image: "/products/reels-pack.png",
    gallery: ["/products/reels-pack.png"],
    accent: "emerald",
    features: [
      "10,000+ reels and raw clips across 15+ categories",
      "HD quality, 9:16 vertical format",
      "Instant download",
      "Personal & commercial use license",
    ],
    whatsIncluded: [
      "Premium edited reels",
      "Raw HD clips for custom editing",
      "15+ category packs (lifestyle, business, motivation, and more)",
      "PDF guide with extra ready-made reel ideas",
    ],
    fileFormat: "MP4 (9:16)",
    fileSize: "14 GB",
    license: "Personal & Commercial",
    version: "1.0",
    status: "active",
    featured: true,
    bestseller: false,
    newArrival: true,
    rating: 4.6,
    reviewCount: 0,
    salesCount: 0,
    createdAt: "2026-08-12",
    updatedAt: "2026-08-23",
  },
];

export function getProductBySlug(slug: string) {
  return products.find((p) => p.slug === slug);
}

export function getFeaturedProducts() {
  return products.filter((p) => p.featured);
}

export function getBestsellers() {
  return products.filter((p) => p.bestseller);
}

export function getRelatedProducts(slug: string, limit = 3) {
  const current = getProductBySlug(slug);
  if (!current) return [];
  return products
    .filter((p) => p.slug !== slug && p.category === current.category)
    .concat(products.filter((p) => p.slug !== slug && p.category !== current.category))
    .slice(0, limit);
}

export const categories = [
  "AI & Automation",
  "n8n Workflows",
  "Courses",
  "Ebooks",
  "Digital Products",
  "Content & Social Media",
  "Digital Product Bundles",
];

export const accentHex: Record<Product["accent"], string> = {
  violet: "var(--v-violet)",
  gold: "var(--v-gold)",
  emerald: "var(--v-emerald)",
  crimson: "var(--v-crimson)",
  steel: "var(--v-steel)",
};
