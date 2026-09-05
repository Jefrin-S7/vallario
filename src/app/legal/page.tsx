import Link from "next/link";
import {
  FileText,
  ShieldCheck,
  RotateCcw,
  Scale,
  ArrowRight,
  CheckCircle2,
  Cpu,
  Layers,
  Sparkles,
  Lock,
} from "lucide-react";

export const metadata = {
  title: "Legal Hub & Compliance Overview",
  description:
    "Overview of VALLARIO legal documentation, terms of service, privacy policy, refund policy, and licensing agreements.",
};

const legalCards = [
  {
    title: "Terms of Service",
    href: "/legal/terms",
    icon: FileText,
    accent: "text-violet bg-violet/10 border-violet/20",
    badge: "Core Agreement",
    summary:
      "General terms governing customer accounts, store transactions, digital goods delivery, server-side security, and acceptable use.",
    highlights: [
      "Instant digital delivery & account entitlements",
      "One-time payments with no hidden subscriptions",
      "Strict server-side payment & download verification",
    ],
  },
  {
    title: "Privacy Policy",
    href: "/legal/privacy",
    icon: ShieldCheck,
    accent: "text-emerald bg-emerald/10 border-emerald/20",
    badge: "GDPR & CCPA Compliant",
    summary:
      "Details how your personal information, Firebase authentication data, and purchase records are handled, secured, and never sold.",
    highlights: [
      "Zero storage of raw payment card numbers or banking PINs",
      "Secure Firebase Auth with token encryption",
      "Full compliance with data access & deletion rights",
    ],
  },
  {
    title: "Refund Policy",
    href: "/legal/refunds",
    icon: RotateCcw,
    accent: "text-crimson bg-crimson/10 border-crimson/20",
    badge: "Digital Goods Standard",
    summary:
      "Transparent policy on downloadable digital products, technical failure resolution, duplicate payment reversals, and eligibility criteria.",
    highlights: [
      "Standard digital goods policy (non-tangible assets)",
      "14-day resolution window for technical or duplicate issues",
      "Direct support ticket escalation via dashboard",
    ],
  },
  {
    title: "License Agreement",
    href: "/legal/license",
    icon: Scale,
    accent: "text-gold bg-gold/10 border-gold/20",
    badge: "Usage Rights",
    summary:
      "Detailed breakdown of Personal, Commercial, and PLR (Private Label Rights) usage rights across each product in the VALLARIO catalog.",
    highlights: [
      "Client project & commercial automation usage",
      "Social media video posting for Reels & content",
      "Clear matrix on allowed vs. prohibited distribution",
    ],
  },
];

const catalogNotices = [
  {
    title: "AI & n8n Automation Workflows",
    icon: Cpu,
    details:
      "Workflows provided in JSON format for n8n 1.6x+. Users are responsible for their own third-party API credentials (e.g. OpenAI, Anthropic, Google) and self-hosted or cloud n8n instances.",
  },
  {
    title: "Video Reels & Content Packs",
    icon: Sparkles,
    details:
      "Delivered in 9:16 HD MP4 format with Personal & Commercial rights for social media publishing (Instagram, TikTok, YouTube Shorts). Raw file reselling is strictly prohibited.",
  },
  {
    title: "Canva, Notion & PLR Templates",
    icon: Layers,
    details:
      "Templates marked with PLR may be customized, rebranded, and provided as derivative deliverables to end-clients or sold under your own branding as specified.",
  },
];

export default function LegalHubPage() {
  return (
    <div className="space-y-8">
      {/* Intro Card */}
      <div className="v-card p-6 md:p-8 bg-white shadow-sm border border-black/5">
        <div className="flex items-center gap-2 text-violet font-display font-semibold text-xs tracking-wider uppercase mb-2">
          <Lock size={14} /> Trust &amp; Transparency
        </div>
        <h2 className="font-display text-2xl font-bold text-ink mb-3">
          Welcome to the VALLARIO Legal Center
        </h2>
        <p className="text-sm text-ink/70 leading-relaxed max-w-3xl">
          At VALLARIO, we build and curate premium digital assets, automation systems, courses, and creator tools. We believe in clear, fair, and transparent agreements. Below you will find comprehensive documentation explaining your rights, our operational security, data privacy, refund standards, and commercial licensing guidelines.
        </p>
      </div>

      {/* Main Grid of Legal Docs */}
      <div className="grid md:grid-cols-2 gap-6">
        {legalCards.map((doc) => {
          const Icon = doc.icon;
          return (
            <div
              key={doc.href}
              className="v-card p-6 bg-white hover:border-black/15 transition-all flex flex-col justify-between shadow-sm border border-black/5"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-4">
                  <div className={`p-3 rounded-xl border ${doc.accent}`}>
                    <Icon size={22} />
                  </div>
                  <span className="text-[11px] font-semibold tracking-wide uppercase px-2.5 py-1 rounded-full bg-ivory-2 text-steel border border-black/5">
                    {doc.badge}
                  </span>
                </div>

                <h3 className="font-display text-xl font-bold text-ink mb-2">
                  {doc.title}
                </h3>
                <p className="text-xs text-ink/70 leading-relaxed mb-4">
                  {doc.summary}
                </p>

                <div className="space-y-2 mb-6 pt-2 border-t border-black/5">
                  {doc.highlights.map((h, i) => (
                    <div
                      key={i}
                      className="flex items-start gap-2 text-xs text-ink/80"
                    >
                      <CheckCircle2
                        size={14}
                        className="text-emerald shrink-0 mt-0.5"
                      />
                      <span>{h}</span>
                    </div>
                  ))}
                </div>
              </div>

              <Link
                href={doc.href}
                className="v-btn v-btn-ghost w-full justify-between text-xs py-2.5 font-semibold group"
              >
                <span>Read Full Document</span>
                <ArrowRight
                  size={14}
                  className="transition-transform group-hover:translate-x-1"
                />
              </Link>
            </div>
          );
        })}
      </div>

      {/* Product-Specific Notices */}
      <div className="v-card p-6 md:p-8 bg-white shadow-sm border border-black/5">
        <h3 className="font-display text-lg font-bold text-ink mb-2">
          Product-Specific Legal Notices
        </h3>
        <p className="text-xs text-steel mb-6">
          Important terms regarding technical requirements, file formats, and software dependencies.
        </p>

        <div className="grid md:grid-cols-3 gap-5">
          {catalogNotices.map((notice, idx) => {
            const Icon = notice.icon;
            return (
              <div
                key={idx}
                className="p-4 rounded-xl bg-ivory-2 border border-black/5 space-y-2"
              >
                <div className="flex items-center gap-2 font-display font-semibold text-xs text-ink">
                  <div className="p-1.5 rounded-lg bg-white text-violet shadow-xs">
                    <Icon size={16} />
                  </div>
                  <span>{notice.title}</span>
                </div>
                <p className="text-xs text-ink/70 leading-relaxed">
                  {notice.details}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
