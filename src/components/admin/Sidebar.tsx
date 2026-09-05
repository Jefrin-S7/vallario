"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  Wallet,
  Tag,
  Star,
  LifeBuoy,
  ScrollText,
  Settings,
  ArrowLeft,
  BarChart3,
} from "lucide-react";

const NAV = [
  { label: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { label: "Products", href: "/admin/products", icon: Package },
  { label: "Orders", href: "/admin/orders", icon: ShoppingCart },
  { label: "Customers", href: "/admin/customers", icon: Users },
  { label: "Finance", href: "/admin/finance", icon: Wallet },
  { label: "Analytics", href: "/admin/analytics", icon: BarChart3 },
  { label: "Coupons", href: "/admin/coupons", icon: Tag },
  { label: "Reviews", href: "/admin/reviews", icon: Star },
  { label: "Support", href: "/admin/support", icon: LifeBuoy },
  { label: "Audit Logs", href: "/admin/audit-logs", icon: ScrollText },
];

export default function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-[248px] shrink-0 bg-ink text-white/90 min-h-screen flex flex-col">
      <div className="px-5 py-6 flex items-center gap-2.5 border-b border-white/10">
        <div className="relative w-8 h-8 shrink-0">
          <Image src="/brand/vallario-logo.png" alt="VALLARIO" fill className="object-contain" />
        </div>
        <div>
          <p className="font-display font-bold text-sm tracking-wide">VALLARIO</p>
          <p className="text-[10px] uppercase tracking-[0.18em] text-white/40">ERP / Admin</p>
        </div>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-0.5">
        {NAV.map(({ label, href, icon: Icon }) => {
          const active = href === "/admin" ? pathname === "/admin" : pathname?.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                active ? "bg-violet text-white" : "text-white/60 hover:bg-white/5 hover:text-white"
              }`}
            >
              <Icon size={16} />
              {label}
            </Link>
          );
        })}
      </nav>

      <div className="px-3 py-4 border-t border-white/10 space-y-0.5">
        <Link
          href="/admin/settings"
          className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm text-white/60 hover:bg-white/5 hover:text-white transition-colors"
        >
          <Settings size={16} /> Settings
        </Link>
        <Link
          href="/"
          className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm text-white/60 hover:bg-white/5 hover:text-white transition-colors"
        >
          <ArrowLeft size={16} /> Back to store
        </Link>
      </div>
    </aside>
  );
}
