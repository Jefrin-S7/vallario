"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  FileText,
  ShieldCheck,
  RotateCcw,
  Scale,
  BookOpen,
  ChevronRight,
} from "lucide-react";

const legalLinks = [
  {
    title: "Legal Hub",
    href: "/legal",
    icon: BookOpen,
    description: "Overview & legal center",
  },
  {
    title: "Terms of Service",
    href: "/legal/terms",
    icon: FileText,
    description: "Rules, rights & account terms",
  },
  {
    title: "Privacy Policy",
    href: "/legal/privacy",
    icon: ShieldCheck,
    description: "Data protection & cookies",
  },
  {
    title: "Refund Policy",
    href: "/legal/refunds",
    icon: RotateCcw,
    description: "Digital goods return policy",
  },
  {
    title: "License Agreement",
    href: "/legal/license",
    icon: Scale,
    description: "Personal, commercial & PLR rights",
  },
];

export default function LegalNav() {
  const pathname = usePathname();

  return (
    <nav className="space-y-1.5" aria-label="Legal Navigation">
      {legalLinks.map((item) => {
        const Icon = item.icon;
        const isActive =
          item.href === "/legal"
            ? pathname === "/legal"
            : pathname.startsWith(item.href);

        return (
          <Link
            key={item.href}
            href={item.href}
            className={`group flex items-center justify-between p-3.5 rounded-xl transition-all ${
              isActive
                ? "bg-violet text-white shadow-md shadow-violet/20 font-medium"
                : "bg-white/80 hover:bg-white text-ink/80 hover:text-ink border border-black/5 hover:border-black/10"
            }`}
          >
            <div className="flex items-center gap-3 min-w-0">
              <div
                className={`p-2 rounded-lg transition-colors ${
                  isActive
                    ? "bg-white/20 text-white"
                    : "bg-ivory-2 text-violet group-hover:bg-violet/10"
                }`}
              >
                <Icon size={18} />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold truncate leading-tight">
                  {item.title}
                </p>
                <p
                  className={`text-xs truncate ${
                    isActive ? "text-white/80" : "text-steel"
                  }`}
                >
                  {item.description}
                </p>
              </div>
            </div>
            <ChevronRight
              size={16}
              className={`shrink-0 transition-transform ${
                isActive
                  ? "text-white translate-x-0.5"
                  : "text-steel/50 group-hover:text-steel group-hover:translate-x-0.5"
              }`}
            />
          </Link>
        );
      })}
    </nav>
  );
}
