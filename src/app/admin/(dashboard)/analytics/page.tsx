import { demoOrders, demoFinance } from "@/lib/data/admin-demo";
import DemoBadge from "@/components/admin/DemoBadge";

const revenueByDay = [
  { day: "Mon", value: 58 },
  { day: "Tue", value: 72 },
  { day: "Wed", value: 41 },
  { day: "Thu", value: 96 },
  { day: "Fri", value: 88 },
  { day: "Sat", value: 120 },
  { day: "Sun", value: 105 },
];

export default function AdminAnalyticsPage() {
  const max = Math.max(...revenueByDay.map((d) => d.value));
  const providerSplit = [
    { label: "Cashfree", value: demoFinance.cashfreeRevenue, accent: "var(--v-violet)" },
    { label: "PayPal", value: demoFinance.paypalRevenue, accent: "var(--v-gold)" },
  ];
  const totalProvider = providerSplit.reduce((s, p) => s + p.value, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold">Analytics</h1>
          <p className="text-sm text-steel mt-1">Revenue trend, provider split, and funnel.</p>
        </div>
        <DemoBadge />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 bg-white rounded-2xl border border-black/5 p-6">
          <h2 className="font-display font-bold mb-6">Revenue — last 7 days</h2>
          <div className="flex items-end gap-3 h-40">
            {revenueByDay.map((d) => (
              <div key={d.day} className="flex-1 flex flex-col items-center gap-2">
                <div
                  className="w-full rounded-t-lg bg-violet"
                  style={{ height: `${(d.value / max) * 100}%`, minHeight: 4 }}
                  title={`$${d.value}`}
                />
                <span className="text-[11px] text-steel">{d.day}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-black/5 p-6">
          <h2 className="font-display font-bold mb-6">Payment providers</h2>
          <div className="space-y-4">
            {providerSplit.map((p) => (
              <div key={p.label}>
                <div className="flex justify-between text-sm mb-1.5">
                  <span>{p.label}</span>
                  <span className="text-steel">${p.value}</span>
                </div>
                <div className="h-2 rounded-full bg-ivory-2 overflow-hidden">
                  <div
                    className="h-full rounded-full"
                    style={{ width: `${(p.value / totalProvider) * 100}%`, background: p.accent }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-black/5 p-6">
        <h2 className="font-display font-bold mb-6">Conversion funnel</h2>
        <div className="grid grid-cols-4 gap-3 text-center">
          {[
            ["Visitors", "1,240"],
            ["Product views", "612"],
            ["Added to cart", "148"],
            ["Orders", String(demoOrders.length)],
          ].map(([label, value]) => (
            <div key={label} className="bg-ivory-2 rounded-xl py-5">
              <p className="font-display text-xl font-bold">{value}</p>
              <p className="text-xs text-steel mt-1">{label}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
