import Link from "next/link";
import { Scale, Check, X, Shield, Sparkles, BookOpen, Layers } from "lucide-react";

export const metadata = {
  title: "License Agreement & Usage Rights",
  description:
    "Review VALLARIO product licenses, commercial rights, PLR guidelines, and usage terms for n8n automations, video packs, and courses.",
};

const licenseMatrix = [
  {
    activity: "Use for personal learning & self-study",
    personal: true,
    commercial: true,
    plr: true,
  },
  {
    activity: "Deploy in internal business & operations",
    personal: false,
    commercial: true,
    plr: true,
  },
  {
    activity: "Use to build client projects & workflows",
    personal: false,
    commercial: true,
    plr: true,
  },
  {
    activity: "Post edited reels to TikTok, Instagram & Shorts",
    personal: false,
    commercial: true,
    plr: true,
  },
  {
    activity: "Modify, rebrand & resell templates (where noted)",
    personal: false,
    commercial: false,
    plr: true,
  },
  {
    activity: "Resell raw, unmodified source files as a competing bundle",
    personal: false,
    commercial: false,
    plr: false,
  },
  {
    activity: "Upload raw files to public torrents or file-sharing sites",
    personal: false,
    commercial: false,
    plr: false,
  },
];

const catalogLicenses = [
  {
    name: "15,000+ AI Agents & n8n Workflows",
    license: "Personal & Commercial",
    badgeColor: "bg-violet/10 text-violet border-violet/20",
    icon: Sparkles,
    permitted: [
      "Import workflows into personal and client n8n instances",
      "Customize nodes, prompts, webhooks, and logic for agency clients",
      "Deploy unlimited automation pipelines for your own businesses",
    ],
    prohibited: [
      "Reselling or redistributing raw JSON files as standalone automation packs",
      "Publishing raw workflow JSONs on public GitHub repositories",
    ],
  },
  {
    name: "10K+ Reels Pack",
    license: "Personal & Commercial",
    badgeColor: "bg-emerald/10 text-emerald border-emerald/20",
    icon: Layers,
    permitted: [
      "Post video clips to Instagram Reels, TikTok, YouTube Shorts, and Facebook",
      "Edit, add captions, color grade, and overlay music or branding",
      "Use footage for commercial client social media management accounts",
    ],
    prohibited: [
      "Reselling raw MP4 video archives as a stock footage or reels pack",
      "Claiming exclusive copyright over the unedited stock footage",
    ],
  },
  {
    name: "Digital Products Mega Collection",
    license: "Personal & Commercial (PLR)",
    badgeColor: "bg-gold/10 text-gold border-gold/20",
    icon: Layers,
    permitted: [
      "Edit Canva templates, Notion systems, and website themes",
      "Rebrand and distribute derivative products to clients or end users",
      "Incorporate prompt packs into your own client workflows and courses",
    ],
    prohibited: [
      "Reselling VALLARIO branding, logos, or original sales pages verbatim",
      "Distributing raw editable links publicly without modification",
    ],
  },
  {
    name: "1,000+ Courses & Ultimate Ebooks Pack",
    license: "Personal Use",
    badgeColor: "bg-crimson/10 text-crimson border-crimson/20",
    icon: BookOpen,
    permitted: [
      "Personal reading, self-improvement, and individual team skill training",
      "Offline reading and personal reference on any device",
    ],
    prohibited: [
      "Reselling, rebroadcasting, sublicensing, or distributing course videos and ebooks",
      "Uploading videos to public video platforms (YouTube, Vimeo) or membership sites",
    ],
  },
  {
    name: "VALLARIO Digital Product Mega Bundle",
    license: "Personal & Commercial (All-in-One)",
    badgeColor: "bg-gold/10 text-gold border-gold/20",
    icon: Shield,
    permitted: [
      "Combines the full license rights of every individual collection included in the bundle",
      "Commercial rights apply to all automations, reels, and PLR tools",
      "Personal rights apply to educational courses and ebooks",
    ],
    prohibited: [
      "Wholesale mirroring or re-hosting of the 48GB library archive",
    ],
  },
];

export default function LicenseAgreementPage() {
  return (
    <article className="v-card p-6 md:p-10 bg-white shadow-sm border border-black/5 text-ink space-y-8">
      {/* Header */}
      <div className="border-b border-black/10 pb-6">
        <div className="flex items-center gap-2 text-gold font-display font-semibold text-xs tracking-wider uppercase mb-1">
          <Scale size={15} /> Licensing Terms &amp; Rights
        </div>
        <h1 className="font-display text-3xl font-bold tracking-tight text-ink">
          License Agreement
        </h1>
        <p className="text-xs text-steel mt-2">
          Last Updated: August 29, 2026 • Commercial &amp; Personal Rights Matrix
        </p>
      </div>

      {/* Summary Box */}
      <div className="bg-ivory-2 rounded-2xl p-5 border border-black/5 space-y-2">
        <h3 className="font-display font-semibold text-sm text-ink">
          Licensing Summary
        </h3>
        <p className="text-xs text-ink/75 leading-relaxed">
          Every product in the VALLARIO catalog carries a specific license tier clearly displayed on its product page. Purchasing a product grants you a non-exclusive license to use the assets according to its designated tier.
        </p>
      </div>

      {/* License Comparison Matrix */}
      <section className="space-y-4">
        <h2 className="font-display text-lg font-bold text-ink">
          1. License Comparison Matrix
        </h2>
        <div className="overflow-x-auto rounded-xl border border-black/10">
          <table className="w-full text-xs text-left">
            <thead className="bg-ivory-2 border-b border-black/10 text-ink font-display font-semibold">
              <tr>
                <th className="p-3.5">Activity / Use Case</th>
                <th className="p-3.5 text-center">Personal</th>
                <th className="p-3.5 text-center">Commercial</th>
                <th className="p-3.5 text-center">PLR / Resale</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/5">
              {licenseMatrix.map((row, i) => (
                <tr key={i} className="hover:bg-ivory-2/40 transition-colors">
                  <td className="p-3.5 text-ink/80 font-medium">{row.activity}</td>
                  <td className="p-3.5 text-center">
                    {row.personal ? (
                      <span className="inline-flex p-1 rounded-full bg-emerald/10 text-emerald">
                        <Check size={14} />
                      </span>
                    ) : (
                      <span className="inline-flex p-1 rounded-full bg-crimson/10 text-crimson">
                        <X size={14} />
                      </span>
                    )}
                  </td>
                  <td className="p-3.5 text-center">
                    {row.commercial ? (
                      <span className="inline-flex p-1 rounded-full bg-emerald/10 text-emerald">
                        <Check size={14} />
                      </span>
                    ) : (
                      <span className="inline-flex p-1 rounded-full bg-crimson/10 text-crimson">
                        <X size={14} />
                      </span>
                    )}
                  </td>
                  <td className="p-3.5 text-center">
                    {row.plr ? (
                      <span className="inline-flex p-1 rounded-full bg-emerald/10 text-emerald">
                        <Check size={14} />
                      </span>
                    ) : (
                      <span className="inline-flex p-1 rounded-full bg-crimson/10 text-crimson">
                        <X size={14} />
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Product-by-Product License Rules */}
      <section className="space-y-4">
        <h2 className="font-display text-lg font-bold text-ink">
          2. Product-Specific Licensing Terms
        </h2>
        <div className="space-y-4">
          {catalogLicenses.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={idx}
                className="p-5 rounded-2xl bg-white border border-black/10 shadow-xs space-y-3"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <div className="p-2 rounded-lg bg-ivory-2 text-violet">
                      <Icon size={16} />
                    </div>
                    <h3 className="font-display font-bold text-sm text-ink">
                      {item.name}
                    </h3>
                  </div>
                  <span
                    className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full border ${item.badgeColor}`}
                  >
                    {item.license}
                  </span>
                </div>

                <div className="grid md:grid-cols-2 gap-4 text-xs pt-2 border-t border-black/5">
                  <div className="space-y-1.5">
                    <p className="font-semibold text-emerald font-display flex items-center gap-1">
                      <Check size={13} /> Allowed
                    </p>
                    <ul className="space-y-1 text-ink/75 list-disc list-inside">
                      {item.permitted.map((p, i) => (
                        <li key={i}>{p}</li>
                      ))}
                    </ul>
                  </div>

                  <div className="space-y-1.5">
                    <p className="font-semibold text-crimson font-display flex items-center gap-1">
                      <X size={13} /> Prohibited
                    </p>
                    <ul className="space-y-1 text-ink/75 list-disc list-inside">
                      {item.prohibited.map((p, i) => (
                        <li key={i}>{p}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Single Seat vs Multi Seat */}
      <section className="space-y-3">
        <h2 className="font-display text-lg font-bold text-ink">
          3. Single-User License &amp; Seat Rules
        </h2>
        <p className="text-sm text-ink/75 leading-relaxed">
          Each standard purchase is a <strong>single-seat license</strong> granted to the registered account holder. You may install workflows or download assets onto multiple personal devices (e.g. your laptop, desktop, or private server), provided they are used exclusively by you or your direct operating team for your client deliverables.
        </p>
        <p className="text-sm text-ink/75 leading-relaxed">
          Sharing account credentials or distributing raw download archives to independent third parties is a material violation of this agreement.
        </p>
      </section>

      {/* Termination */}
      <section className="space-y-3">
        <h2 className="font-display text-lg font-bold text-ink">
          4. License Termination
        </h2>
        <p className="text-sm text-ink/75 leading-relaxed">
          Any unauthorized distribution, unauthorized resale of raw assets, or infringement of VALLARIO intellectual property will result in immediate and automatic termination of your license, revocation of download entitlements, and may subject the violator to civil and criminal liability.
        </p>
      </section>

      {/* Support Box */}
      <div className="p-4 rounded-xl bg-ivory-2 border border-black/5 text-xs text-ink/75 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <span>Need a custom agency multi-seat license or enterprise terms?</span>
        <Link href="/support" className="v-btn v-btn-primary text-xs py-2 shrink-0">
          Contact Enterprise Support
        </Link>
      </div>
    </article>
  );
}
