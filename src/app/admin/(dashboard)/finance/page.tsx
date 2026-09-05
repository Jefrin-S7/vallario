"use client";

import { useState, useEffect } from "react";
import { Loader2, RefreshCw, TrendingUp, TrendingDown } from "lucide-react";
import { auth, isFirebaseConfigured } from "@/lib/firebase/client";

interface Finance {
  grossRevenue: number;
  discounts: number;
  refunds: number;
  taxes: number;
  paymentFees: number;
  netRevenue: number;
  cashfreeRevenue: number;
  paypalRevenue: number;
  totalOrders: number;
}

export default function AdminFinancePage() {
  const [finance, setFinance] = useState<Finance | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFinance();
  }, []);

  async function fetchFinance() {
    setLoading(true);
    try {
      let headers: Record<string, string> = {};
      if (isFirebaseConfigured && auth?.currentUser) {
        const token = await auth.currentUser.getIdToken();
        headers = { Authorization: `Bearer ${token}` };
      }

      const res = await fetch("/api/admin/finance", { headers });
      if (res.ok) {
        const data = await res.json();
        setFinance(data.finance);
      }
    } catch (err) {
      console.error("Failed to load finance:", err);
    } finally {
      setLoading(false);
    }
  }

  const f = finance ?? {
    grossRevenue: 0,
    discounts: 0,
    refunds: 0,
    taxes: 0,
    paymentFees: 0,
    netRevenue: 0,
    cashfreeRevenue: 0,
    paypalRevenue: 0,
    totalOrders: 0,
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-ink">Finance &amp; Revenue</h1>
          <p className="text-xs text-steel mt-0.5">Live P&amp;L from Cashfree &amp; PayPal order records.</p>
        </div>
        <div className="flex items-center gap-3">
          <button type="button" onClick={fetchFinance} className="v-btn v-btn-ghost text-xs py-1.5 px-3">
            <RefreshCw size={13} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {loading ? (
        <div className="py-12 flex justify-center">
          <Loader2 size={24} className="animate-spin text-violet" />
        </div>
      ) : (
        <>
          {/* Revenue Summary Cards */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard label="Gross Revenue" value={f.grossRevenue} accent="violet" up />
            <StatCard label="Net Revenue" value={f.netRevenue} accent="emerald" up />
            <StatCard label="Refunds" value={f.refunds} accent="crimson" up={false} />
            <StatCard label="Payment Fees (~2.9%)" value={f.paymentFees} accent="gold" up={false} />
          </div>

          {/* Reconciliation Table */}
          <div className="bg-white rounded-2xl border border-black/5 p-6 shadow-2xs">
            <h2 className="font-display font-bold text-sm text-ink mb-4">Revenue Reconciliation</h2>
            <table className="w-full text-sm text-left">
              <tbody className="divide-y divide-black/5">
                {[
                  ["Gross Revenue", f.grossRevenue, "text-ink", true],
                  ["Discounts Applied", -f.discounts, "text-crimson", false],
                  ["Refunds Issued", -f.refunds, "text-crimson", false],
                  ["Taxes Collected", f.taxes, "text-ink", true],
                  ["Payment Processing Fees", -f.paymentFees, "text-crimson", false],
                  ["NET REVENUE", f.netRevenue, "text-emerald font-bold text-base", true],
                ].map(([label, value, cls], idx) => (
                  <tr key={idx}>
                    <td className={`py-3 text-xs font-medium text-steel`}>{label as string}</td>
                    <td className={`py-3 text-right font-semibold text-sm ${cls as string}`}>
                      {(value as number) < 0 ? "-" : ""}${Math.abs(value as number).toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Gateway Breakdown */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="bg-white rounded-2xl border border-black/5 p-6 shadow-2xs">
              <h2 className="font-display font-bold text-sm text-ink mb-3">Cashfree Revenue</h2>
              <p className="font-display text-3xl font-bold text-violet">${f.cashfreeRevenue.toFixed(2)}</p>
              <p className="text-xs text-steel mt-1">
                {f.grossRevenue > 0 ? ((f.cashfreeRevenue / f.grossRevenue) * 100).toFixed(1) : "0"}% of total revenue
              </p>
            </div>
            <div className="bg-white rounded-2xl border border-black/5 p-6 shadow-2xs">
              <h2 className="font-display font-bold text-sm text-ink mb-3">PayPal Revenue</h2>
              <p className="font-display text-3xl font-bold text-gold">${f.paypalRevenue.toFixed(2)}</p>
              <p className="text-xs text-steel mt-1">
                {f.grossRevenue > 0 ? ((f.paypalRevenue / f.grossRevenue) * 100).toFixed(1) : "0"}% of total revenue
              </p>
            </div>
          </div>

          <p className="text-xs text-steel">
            Figures computed from live <code className="font-mono">orders</code> collection in Firestore.
            Tax rate &amp; fee percentages configurable in{" "}
            <a href="/admin/settings" className="text-violet hover:underline">Settings</a>.
          </p>
        </>
      )}
    </div>
  );
}

function StatCard({
  label,
  value,
  accent,
  up,
}: {
  label: string;
  value: number;
  accent: string;
  up: boolean;
}) {
  return (
    <div className="bg-white rounded-2xl border border-black/5 p-5 shadow-2xs">
      <div className="flex items-center justify-between mb-3">
        <p className="text-xs font-semibold text-steel">{label}</p>
        {up ? (
          <TrendingUp size={15} className={`text-${accent}`} />
        ) : (
          <TrendingDown size={15} className="text-crimson" />
        )}
      </div>
      <p className={`font-display text-2xl font-bold text-${accent}`}>${value.toFixed(2)}</p>
    </div>
  );
}
