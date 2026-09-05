import React from "react";
import Link from "next/link";
import { Mail, HelpCircle, Shield, ArrowLeft } from "lucide-react";
import LegalNav from "./LegalNav";

export const metadata = {
  title: {
    template: "%s — VALLARIO Legal",
    default: "Legal Center — VALLARIO",
  },
  description:
    "Review legal terms, privacy policies, refund terms, and licensing agreements for VALLARIO digital products and automation tools.",
};

export default function LegalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="bg-ivory-2 min-h-screen">
      {/* Header Banner */}
      <div className="bg-ink text-white border-b border-white/10">
        <div className="v-container py-12">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-xs text-white/50 mb-3">
                <Link href="/" className="hover:text-white transition-colors flex items-center gap-1">
                  <ArrowLeft size={12} /> Home
                </Link>
                <span>/</span>
                <Link href="/legal" className="text-white/80 hover:text-white">
                  Legal Center
                </Link>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-violet/20 border border-violet/30 text-violet-2 flex items-center justify-center">
                  <Shield size={20} />
                </div>
                <div>
                  <h1 className="font-display text-2xl md:text-3xl font-bold tracking-tight">
                    Legal &amp; Compliance Center
                  </h1>
                  <p className="text-sm text-white/60 mt-0.5">
                    Clear, transparent policies for our digital products, templates, and automation workflows.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs bg-white/10 text-white/80 border border-white/10">
                <span className="w-2 h-2 rounded-full bg-emerald"></span>
                Effective August 2026
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Layout */}
      <div className="v-container py-10">
        <div className="grid lg:grid-cols-[280px_1fr] gap-8 items-start">
          {/* Sidebar */}
          <aside className="space-y-6 lg:sticky lg:top-24">
            <div>
              <p className="text-xs font-semibold text-steel uppercase tracking-wider mb-3 px-1">
                Legal Documents
              </p>
              <LegalNav />
            </div>

            {/* Support & Contact Card */}
            <div className="v-card p-5 bg-white shadow-sm border border-black/5">
              <div className="flex items-center gap-2.5 text-ink font-display font-semibold text-sm mb-2">
                <HelpCircle size={17} className="text-violet" />
                <span>Have questions?</span>
              </div>
              <p className="text-xs text-steel leading-relaxed mb-4">
                Need clarification regarding our commercial licenses, custom terms, or refund eligibility?
              </p>
              <div className="space-y-2">
                <Link
                  href="/support"
                  className="v-btn v-btn-ghost w-full justify-center text-xs py-2"
                >
                  Contact Support
                </Link>
                <a
                  href="mailto:support@vallario.com"
                  className="flex items-center justify-center gap-1.5 text-xs text-steel hover:text-violet transition-colors py-1.5"
                >
                  <Mail size={13} /> support@vallario.com
                </a>
              </div>
            </div>
          </aside>

          {/* Document Content */}
          <main className="min-w-0">{children}</main>
        </div>
      </div>
    </div>
  );
}
