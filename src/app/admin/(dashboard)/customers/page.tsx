"use client";

import { useState, useEffect } from "react";
import { Users, Loader2, RefreshCw, ShieldCheck, ShieldOff } from "lucide-react";
import { auth, isFirebaseConfigured } from "@/lib/firebase/client";

interface Customer {
  uid: string;
  name: string;
  email: string;
  role: string;
  disabled: boolean;
  orders: number;
  totalSpent: number;
  joined: string;
}

export default function AdminCustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    fetchCustomers();
  }, []);

  async function fetchCustomers() {
    setLoading(true);
    try {
      let headers: Record<string, string> = {};
      if (isFirebaseConfigured && auth?.currentUser) {
        const token = await auth.currentUser.getIdToken();
        headers = { Authorization: `Bearer ${token}` };
      }

      const res = await fetch("/api/admin/customers", { headers });
      if (res.ok) {
        const data = await res.json();
        setCustomers(data.customers || []);
      }
    } catch (err) {
      console.error("Failed to fetch customers:", err);
    } finally {
      setLoading(false);
    }
  }

  async function handleToggleDisabled(uid: string, disabled: boolean) {
    try {
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (isFirebaseConfigured && auth?.currentUser) {
        const token = await auth.currentUser.getIdToken();
        headers.Authorization = `Bearer ${token}`;
      }

      const res = await fetch("/api/admin/customers", {
        method: "PATCH",
        headers,
        body: JSON.stringify({ uid, disabled: !disabled }),
      });

      if (res.ok) {
        setCustomers((prev) =>
          prev.map((c) => (c.uid === uid ? { ...c, disabled: !disabled } : c))
        );
        setMessage(`Account ${!disabled ? "suspended" : "reactivated"}.`);
        setTimeout(() => setMessage(null), 3000);
      }
    } catch {
      setMessage("Failed to update account.");
    }
  }

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-ink">Customers</h1>
          <p className="text-xs text-steel mt-0.5">
            {customers.length} registered accounts from Firestore &amp; Firebase Auth.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={fetchCustomers}
            className="v-btn v-btn-ghost text-xs py-1.5 px-3"
          >
            <RefreshCw size={13} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {message && (
        <div className="p-3.5 rounded-xl bg-emerald/10 border border-emerald/20 text-emerald text-xs font-semibold">
          {message}
        </div>
      )}

      <div className="bg-white rounded-2xl border border-black/5 overflow-hidden shadow-2xs">
        {loading ? (
          <div className="py-12 flex justify-center">
            <Loader2 size={24} className="animate-spin text-violet" />
          </div>
        ) : customers.length === 0 ? (
          <div className="py-12 text-center text-xs text-steel space-y-2">
            <Users size={24} className="mx-auto text-steel/40" />
            <p>No customers yet.</p>
            <p className="text-[11px]">Accounts will appear here when users register.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-ivory-2 text-steel font-semibold border-b border-black/5">
                <tr>
                  <th className="px-5 py-3.5">Customer</th>
                  <th className="px-5 py-3.5">Joined</th>
                  <th className="px-5 py-3.5">Orders</th>
                  <th className="px-5 py-3.5">Total Spent</th>
                  <th className="px-5 py-3.5">Role</th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/5">
                {customers.map((c) => (
                  <tr key={c.uid} className={`hover:bg-ivory-2/40 transition-colors ${c.disabled ? "opacity-50" : ""}`}>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-full bg-violet/10 text-violet flex items-center justify-center text-[11px] font-bold shrink-0">
                          {c.name[0]?.toUpperCase() || "?"}
                        </div>
                        <div>
                          <p className="font-semibold text-ink">{c.name}</p>
                          <p className="text-[10px] text-steel">{c.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-steel">{c.joined}</td>
                    <td className="px-5 py-3.5 font-medium text-ink">{c.orders}</td>
                    <td className="px-5 py-3.5 font-bold text-ink">${c.totalSpent.toFixed(2)}</td>
                    <td className="px-5 py-3.5">
                      <span className="inline-flex items-center rounded-full bg-violet/10 text-violet px-2.5 py-0.5 text-[11px] font-semibold capitalize">
                        {c.role}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <button
                        type="button"
                        onClick={() => handleToggleDisabled(c.uid, c.disabled)}
                        title={c.disabled ? "Reactivate account" : "Suspend account"}
                        className={`text-xs font-semibold flex items-center gap-1 ml-auto ${
                          c.disabled
                            ? "text-emerald hover:underline"
                            : "text-crimson hover:underline"
                        }`}
                      >
                        {c.disabled ? (
                          <>
                            <ShieldCheck size={12} /> Reactivate
                          </>
                        ) : (
                          <>
                            <ShieldOff size={12} /> Suspend
                          </>
                        )}
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
