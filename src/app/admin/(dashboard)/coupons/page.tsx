"use client";

import { useState, useEffect, useCallback } from "react";
import { Plus, Loader2, CheckCircle, Trash2, Tag } from "lucide-react";
import { auth, isFirebaseConfigured } from "@/lib/firebase/client";

interface Coupon {
  code: string;
  type: "percentage" | "fixed";
  value: number;
  usageLimit: number;
  timesUsed: number;
  status: string;
  expiresAt: string;
}

export default function AdminCouponsPage() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    code: "",
    type: "percentage",
    value: "",
    usageLimit: "100",
    expiresAt: "2026-12-31",
  });

  const getHeaders = useCallback(async () => {
    const headers: Record<string, string> = {};
    if (isFirebaseConfigured && auth?.currentUser) {
      const token = await auth.currentUser.getIdToken();
      headers.Authorization = `Bearer ${token}`;
    }
    return headers;
  }, []);

  const fetchCoupons = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/coupons", { headers: await getHeaders() });
      if (res.ok) {
        const data = await res.json();
        setCoupons(data.coupons || []);
      }
    } catch (err) {
      console.error("Failed to fetch coupons:", err);
    } finally {
      setLoading(false);
    }
  }, [getHeaders]);

  useEffect(() => {
    // One-time fetch on mount, gated behind a real staff/session check
    // server-side — not a synchronization loop.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchCoupons();
  }, [fetchCoupons]);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    try {
      const headers = { ...(await getHeaders()), "Content-Type": "application/json" };
      const res = await fetch("/api/admin/coupons", {
        method: "POST",
        headers,
        body: JSON.stringify(form),
      });
      if (res.ok) {
        setMessage("Coupon created successfully!");
        setShowForm(false);
        setForm({ code: "", type: "percentage", value: "", usageLimit: "100", expiresAt: "2026-12-31" });
        fetchCoupons();
        setTimeout(() => setMessage(null), 3000);
      }
    } catch {
      setMessage("Failed to create coupon.");
    }
  }

  async function handleDelete(code: string) {
    if (!confirm(`Delete coupon ${code}?`)) return;
    try {
      const headers = await getHeaders();
      const res = await fetch(`/api/admin/coupons?code=${encodeURIComponent(code)}`, {
        method: "DELETE",
        headers,
      });
      if (res.ok) {
        setCoupons((prev) => prev.filter((c) => c.code !== code));
        setMessage(`Coupon ${code} deleted.`);
        setTimeout(() => setMessage(null), 3000);
      }
    } catch {
      setMessage("Failed to delete coupon.");
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-ink">Discount Coupons</h1>
          <p className="text-xs text-steel mt-0.5">Codes validated server-side at checkout via Firestore.</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setShowForm(!showForm)}
            className="v-btn v-btn-primary text-xs py-1.5 px-3.5"
          >
            <Plus size={14} />
            <span>New Coupon</span>
          </button>
        </div>
      </div>

      {message && (
        <div className="p-3.5 rounded-xl bg-emerald/10 border border-emerald/20 text-emerald text-xs font-semibold flex items-center gap-2">
          <CheckCircle size={15} />
          <span>{message}</span>
        </div>
      )}

      {/* Create Form */}
      {showForm && (
        <form
          onSubmit={handleCreate}
          className="bg-white rounded-2xl border border-black/5 p-6 shadow-2xs space-y-4"
        >
          <h2 className="font-display font-bold text-sm text-ink">Create New Coupon</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            <div>
              <label className="text-xs font-semibold text-steel block mb-1">Code</label>
              <input
                required
                value={form.code}
                onChange={(e) => setForm((f) => ({ ...f, code: e.target.value.toUpperCase() }))}
                placeholder="SAVE20"
                className="w-full border border-black/10 rounded-lg px-3 py-2 text-xs font-mono outline-none focus:border-violet"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-steel block mb-1">Type</label>
              <select
                value={form.type}
                onChange={(e) => setForm((f) => ({ ...f, type: e.target.value }))}
                className="w-full border border-black/10 rounded-lg px-3 py-2 text-xs outline-none focus:border-violet"
              >
                <option value="percentage">Percentage (%)</option>
                <option value="fixed">Fixed (USD)</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-steel block mb-1">Value</label>
              <input
                required
                type="number"
                value={form.value}
                onChange={(e) => setForm((f) => ({ ...f, value: e.target.value }))}
                placeholder={form.type === "percentage" ? "20" : "10"}
                className="w-full border border-black/10 rounded-lg px-3 py-2 text-xs outline-none focus:border-violet"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-steel block mb-1">Usage Limit</label>
              <input
                type="number"
                value={form.usageLimit}
                onChange={(e) => setForm((f) => ({ ...f, usageLimit: e.target.value }))}
                className="w-full border border-black/10 rounded-lg px-3 py-2 text-xs outline-none focus:border-violet"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-steel block mb-1">Expires At</label>
              <input
                type="date"
                value={form.expiresAt}
                onChange={(e) => setForm((f) => ({ ...f, expiresAt: e.target.value }))}
                className="w-full border border-black/10 rounded-lg px-3 py-2 text-xs outline-none focus:border-violet"
              />
            </div>
          </div>
          <div className="flex gap-3">
            <button type="submit" className="v-btn v-btn-primary text-xs py-1.5 px-4">
              Create Coupon
            </button>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="v-btn v-btn-ghost text-xs py-1.5 px-4"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      <div className="bg-white rounded-2xl border border-black/5 overflow-hidden shadow-2xs">
        {loading ? (
          <div className="py-12 flex justify-center">
            <Loader2 size={24} className="animate-spin text-violet" />
          </div>
        ) : coupons.length === 0 ? (
          <div className="py-12 text-center text-xs text-steel space-y-2">
            <Tag size={24} className="mx-auto text-steel/40" />
            <p>No coupons yet. Create your first discount code above.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-ivory-2 text-steel font-semibold border-b border-black/5">
                <tr>
                  <th className="px-5 py-3.5">Code</th>
                  <th className="px-5 py-3.5">Type</th>
                  <th className="px-5 py-3.5">Value</th>
                  <th className="px-5 py-3.5">Usage</th>
                  <th className="px-5 py-3.5">Expires</th>
                  <th className="px-5 py-3.5">Status</th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/5">
                {coupons.map((c) => (
                  <tr key={c.code} className="hover:bg-ivory-2/40 transition-colors">
                    <td className="px-5 py-3.5 font-mono font-bold text-violet">{c.code}</td>
                    <td className="px-5 py-3.5 capitalize text-steel">{c.type}</td>
                    <td className="px-5 py-3.5 font-semibold text-ink">
                      {c.type === "percentage" ? `${c.value}%` : `$${c.value}`}
                    </td>
                    <td className="px-5 py-3.5 text-steel">
                      {c.timesUsed} / {c.usageLimit}
                    </td>
                    <td className="px-5 py-3.5 text-steel">{c.expiresAt}</td>
                    <td className="px-5 py-3.5">
                      <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${
                        c.status === "active" ? "bg-emerald/10 text-emerald" : "bg-black/5 text-steel"
                      }`}>
                        {c.status}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <button
                        type="button"
                        onClick={() => handleDelete(c.code)}
                        className="text-crimson hover:underline flex items-center gap-1 ml-auto text-xs font-semibold"
                      >
                        <Trash2 size={12} /> Delete
                      </button>
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
