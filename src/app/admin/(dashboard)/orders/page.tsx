"use client";

import { useState, useEffect } from "react";
import { RefreshCcw, FileText, Loader2, CheckCircle, ShoppingCart } from "lucide-react";
import StatusPill from "@/components/admin/StatusPill";
import { auth, isFirebaseConfigured } from "@/lib/firebase/client";

interface Order {
  id: string;
  customerName: string;
  customerEmail: string;
  items: string[];
  provider: "cashfree" | "paypal";
  total: number;
  status: "pending" | "paid" | "failed" | "refunded" | "cancelled";
  createdAt: string;
}

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("all");
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  async function fetchOrders() {
    try {
      let headers: Record<string, string> = {};
      if (isFirebaseConfigured && auth?.currentUser) {
        const token = await auth.currentUser.getIdToken();
        headers = { Authorization: `Bearer ${token}` };
      }

      const res = await fetch("/api/admin/orders", { headers });
      if (res.ok) {
        const data = await res.json();
        setOrders(data.orders || []);
      }
    } catch (err) {
      console.error("Failed to fetch orders:", err);
    } finally {
      setLoading(false);
    }
  }

  async function handleUpdateStatus(orderId: string, newStatus: string) {
    setActionLoading(orderId);
    setMessage(null);
    try {
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (isFirebaseConfigured && auth?.currentUser) {
        const token = await auth.currentUser.getIdToken();
        headers.Authorization = `Bearer ${token}`;
      }

      const res = await fetch("/api/admin/orders", {
        method: "PATCH",
        headers,
        body: JSON.stringify({ orderId, status: newStatus }),
      });

      if (res.ok) {
        setOrders((prev) =>
          prev.map((o) => (o.id === orderId ? { ...o, status: newStatus as Order["status"] } : o))
        );
        setMessage(`Order ${orderId} updated to ${newStatus}.`);
        setTimeout(() => setMessage(null), 4000);
      }
    } catch {
      setMessage("Failed to update order status.");
    } finally {
      setActionLoading(null);
    }
  }

  const filteredOrders = orders.filter((o) => {
    if (filter === "all") return true;
    return o.status === filter;
  });

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-ink">Orders Management</h1>
          <p className="text-xs text-steel mt-0.5">
            Real-time transaction log from Cashfree &amp; PayPal gateways.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={fetchOrders}
            className="v-btn v-btn-ghost text-xs py-1.5 px-3"
            title="Refresh Orders"
          >
            <RefreshCcw size={13} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {message && (
        <div className="p-3.5 rounded-xl bg-emerald/10 border border-emerald/20 text-emerald text-xs font-semibold flex items-center gap-2">
          <CheckCircle size={15} />
          <span>{message}</span>
        </div>
      )}

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center gap-2">
        {["all", "paid", "pending", "refunded", "cancelled"].map((st) => (
          <button
            key={st}
            type="button"
            onClick={() => setFilter(st)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold capitalize transition-all cursor-pointer ${
              filter === st
                ? "bg-violet text-white shadow-xs"
                : "bg-white text-ink/70 hover:bg-ivory-2 border border-black/5"
            }`}
          >
            {st} ({st === "all" ? orders.length : orders.filter((o) => o.status === st).length})
          </button>
        ))}
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-2xl border border-black/5 overflow-hidden shadow-2xs">
        {loading ? (
          <div className="py-12 flex justify-center text-steel">
            <Loader2 size={24} className="animate-spin text-violet" />
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="py-12 text-center text-xs text-steel space-y-2">
            <ShoppingCart size={24} className="mx-auto text-steel/40" />
            <p>No orders found matching &ldquo;{filter}&rdquo; status.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-ivory-2 text-steel font-semibold border-b border-black/5">
                <tr>
                  <th className="px-5 py-3.5">Order ID</th>
                  <th className="px-5 py-3.5">Customer</th>
                  <th className="px-5 py-3.5">Items</th>
                  <th className="px-5 py-3.5">Provider</th>
                  <th className="px-5 py-3.5">Total</th>
                  <th className="px-5 py-3.5">Status</th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/5">
                {filteredOrders.map((o) => (
                  <tr key={o.id} className="hover:bg-ivory-2/40 transition-colors">
                    <td className="px-5 py-3.5 font-mono font-medium text-ink">{o.id}</td>
                    <td className="px-5 py-3.5">
                      <p className="font-semibold text-ink">{o.customerName}</p>
                      <p className="text-[11px] text-steel">{o.customerEmail}</p>
                    </td>
                    <td className="px-5 py-3.5 text-steel max-w-[200px]">
                      <span className="line-clamp-1">{o.items.join(", ")}</span>
                    </td>
                    <td className="px-5 py-3.5 capitalize font-medium text-ink">{o.provider}</td>
                    <td className="px-5 py-3.5 font-bold text-ink">${o.total}</td>
                    <td className="px-5 py-3.5">
                      <StatusPill status={o.status} />
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {o.status === "pending" && (
                          <button
                            type="button"
                            disabled={actionLoading === o.id}
                            onClick={() => handleUpdateStatus(o.id, "paid")}
                            className="text-xs font-semibold text-emerald hover:underline"
                          >
                            Mark Paid
                          </button>
                        )}
                        {o.status === "paid" && (
                          <button
                            type="button"
                            disabled={actionLoading === o.id}
                            onClick={() => handleUpdateStatus(o.id, "refunded")}
                            className="text-xs font-semibold text-crimson hover:underline flex items-center gap-1"
                          >
                            <RefreshCcw size={11} /> Refund
                          </button>
                        )}
                        <span className="text-steel/30">|</span>
                        <button
                          type="button"
                          onClick={() => alert(`Order details for ${o.id}`)}
                          className="text-xs text-steel hover:text-ink flex items-center gap-1"
                        >
                          <FileText size={12} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
