"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  TrendingUp,
  ShoppingCart,
  Users,
  Package,
  RefreshCcw,
  Sparkles,
  Loader2,
  CheckCircle2,
  type LucideIcon,
} from "lucide-react";
import { products } from "@/lib/data/products";
import StatusPill from "@/components/admin/StatusPill";
import { auth, isFirebaseConfigured } from "@/lib/firebase/client";

interface OrderItem {
  id: string;
  customerName: string;
  customerEmail: string;
  total: number;
  provider: "cashfree" | "paypal";
  status: string;
  createdAt: string;
}

interface OverviewStats {
  grossRevenue: number;
  ordersCount: number;
  paidOrdersCount: number;
  cashfreeRevenue: number;
  paypalRevenue: number;
  customersCount: number;
  productsCount: number;
  refundsCount: number;
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<OverviewStats>({
    grossRevenue: 429,
    ordersCount: 5,
    paidOrdersCount: 2,
    cashfreeRevenue: 142,
    paypalRevenue: 287,
    customersCount: 4,
    productsCount: 6,
    refundsCount: 0,
  });

  const [recentOrders, setRecentOrders] = useState<OrderItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [seeding, setSeeding] = useState(false);
  const [seedMessage, setSeedMessage] = useState<string | null>(null);

  useEffect(() => {
    async function loadOverview() {
      try {
        let headers: Record<string, string> = {};
        if (isFirebaseConfigured && auth?.currentUser) {
          const token = await auth.currentUser.getIdToken();
          headers = { Authorization: `Bearer ${token}` };
        }

        const res = await fetch("/api/admin/overview", { headers });
        if (res.ok) {
          const data = await res.json();
          if (data.stats) setStats(data.stats);
          if (data.recentOrders && data.recentOrders.length > 0) {
            setRecentOrders(data.recentOrders);
          }
        }
      } catch (err) {
        console.error("Failed to load overview data:", err);
      } finally {
        setLoading(false);
      }
    }

    loadOverview();
  }, []);

  const handleSeedCatalog = async () => {
    setSeeding(true);
    setSeedMessage(null);
    try {
      let headers: Record<string, string> = {};
      if (isFirebaseConfigured && auth?.currentUser) {
        const token = await auth.currentUser.getIdToken();
        headers = { Authorization: `Bearer ${token}` };
      }

      const res = await fetch("/api/admin/seed", { method: "POST", headers });
      const data = await res.json();
      if (res.ok) {
        setSeedMessage("Catalog successfully synced to Firestore!");
        setStats((prev) => ({ ...prev, productsCount: data.count || products.length }));
      } else {
        setSeedMessage(data.message || "Could not seed catalog.");
      }
    } catch {
      setSeedMessage("Failed to seed catalog.");
    } finally {
      setSeeding(false);
    }
  };

  const topProducts = [...products].sort((a, b) => b.rating - a.rating).slice(0, 5);

  return (
    <div className="space-y-8">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-ink">Dashboard &amp; Overview</h1>
          <p className="text-xs text-steel mt-0.5">Live store performance and real-time telemetry.</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleSeedCatalog}
            disabled={seeding}
            className="v-btn v-btn-ghost text-xs py-1.5 px-3 border border-violet/30 text-violet hover:bg-violet/5"
            title="Sync all products into Firestore"
          >
            {seeding ? (
              <Loader2 size={13} className="animate-spin" />
            ) : (
              <Sparkles size={13} />
            )}
            <span>Sync Catalog to Firestore</span>
          </button>
        </div>
      </div>

      {seedMessage && (
        <div className="p-3.5 rounded-xl bg-emerald/10 border border-emerald/20 text-emerald text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 size={15} />
          <span>{seedMessage}</span>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat
          icon={TrendingUp}
          label="Gross Revenue"
          value={`$${stats.grossRevenue.toFixed(2)}`}
          accent="violet"
        />
        <Stat
          icon={ShoppingCart}
          label="Total Orders"
          value={String(stats.ordersCount)}
          accent="gold"
        />
        <Stat
          icon={Users}
          label="Registered Customers"
          value={String(stats.customersCount)}
          accent="emerald"
        />
        <Stat
          icon={Package}
          label="Live Catalog Products"
          value={String(stats.productsCount)}
          accent="crimson"
        />
      </div>

      {/* Main Grid: Orders & Products */}
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 bg-white rounded-2xl border border-black/5 p-6 shadow-2xs">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display font-bold text-base text-ink">Recent Orders</h2>
            <Link href="/admin/orders" className="text-xs text-violet font-semibold hover:underline">
              View all orders
            </Link>
          </div>

          {loading ? (
            <div className="py-8 flex justify-center text-steel">
              <Loader2 size={20} className="animate-spin text-violet" />
            </div>
          ) : recentOrders.length === 0 ? (
            <div className="py-10 text-center text-xs text-steel">
              <ShoppingCart size={24} className="mx-auto mb-2 text-steel/50" />
              <p>No orders yet in Firestore.</p>
              <p className="mt-1 text-[11px]">Orders placed on checkout will appear here live.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="text-steel font-semibold border-b border-black/5 pb-2">
                  <tr>
                    <th className="pb-2 font-medium">Order ID</th>
                    <th className="pb-2 font-medium">Customer</th>
                    <th className="pb-2 font-medium">Total</th>
                    <th className="pb-2 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-black/5">
                  {recentOrders.map((o) => (
                    <tr key={o.id} className="hover:bg-ivory-2/40">
                      <td className="py-3 font-mono font-medium">{o.id}</td>
                      <td className="py-3 text-ink">{o.customerName}</td>
                      <td className="py-3 font-semibold text-ink">${o.total}</td>
                      <td className="py-3">
                        <StatusPill status={o.status} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="bg-white rounded-2xl border border-black/5 p-6 shadow-2xs">
          <h2 className="font-display font-bold text-base text-ink mb-4">Top Rated Products</h2>
          <ul className="space-y-3">
            {topProducts.map((p) => (
              <li key={p.id} className="flex items-center justify-between gap-3 text-xs">
                <span className="line-clamp-1 flex-1 font-medium text-ink">{p.name}</span>
                <span className="text-steel shrink-0 font-semibold">
                  {p.rating.toFixed(1)}★ ({p.salesCount} sold)
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Revenue Breakdown */}
      <div className="grid gap-6 sm:grid-cols-3">
        <FinanceMini
          label="Gross Revenue"
          value={stats.grossRevenue}
          icon={TrendingUp}
          accent="violet"
        />
        <FinanceMini
          label="Cashfree Settlement"
          value={stats.cashfreeRevenue}
          icon={RefreshCcw}
          accent="emerald"
        />
        <FinanceMini
          label="PayPal Settlement"
          value={stats.paypalRevenue}
          icon={TrendingUp}
          accent="gold"
        />
      </div>
    </div>
  );
}

function Stat({
  icon: Icon,
  label,
  value,
  accent,
}: {
  icon: LucideIcon;
  label: string;
  value: string;
  accent: string;
}) {
  return (
    <div className="bg-white rounded-2xl border border-black/5 p-5 shadow-2xs">
      <div
        className="w-9 h-9 rounded-xl flex items-center justify-center shadow-xs"
        style={{
          background: `color-mix(in srgb, var(--v-${accent}) 14%, white)`,
          color: `var(--v-${accent})`,
        }}
      >
        <Icon size={16} />
      </div>
      <p className="font-display text-2xl font-bold mt-3 text-ink">{value}</p>
      <p className="text-xs text-steel mt-0.5">{label}</p>
    </div>
  );
}

function FinanceMini({
  label,
  value,
  icon: Icon,
  accent,
}: {
  label: string;
  value: number;
  icon: LucideIcon;
  accent: string;
}) {
  return (
    <div className="bg-white rounded-2xl border border-black/5 p-5 flex items-center gap-4 shadow-2xs">
      <div
        className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-xs"
        style={{
          background: `color-mix(in srgb, var(--v-${accent}) 14%, white)`,
          color: `var(--v-${accent})`,
        }}
      >
        <Icon size={17} />
      </div>
      <div>
        <p className="font-display text-xl font-bold text-ink">${value.toFixed(2)}</p>
        <p className="text-xs text-steel">{label}</p>
      </div>
    </div>
  );
}
