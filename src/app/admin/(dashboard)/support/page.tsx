"use client";

import { useState, useEffect, useCallback } from "react";
import { Loader2, RefreshCw, HeadphonesIcon, CheckCheck } from "lucide-react";
import { auth, isFirebaseConfigured } from "@/lib/firebase/client";

interface Ticket {
  id: string;
  subject?: string;
  title?: string;
  customer?: string;
  userEmail?: string;
  status: string;
  createdAt?: string;
}

const statusStyle: Record<string, string> = {
  open: "text-crimson bg-crimson/10",
  in_progress: "text-gold bg-gold/10",
  waiting_for_customer: "text-violet bg-violet/10",
  resolved: "text-emerald bg-emerald/10",
  closed: "text-steel bg-black/5",
};

export default function AdminSupportPage() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<string | null>(null);

  const getHeaders = useCallback(async () => {
    const headers: Record<string, string> = {};
    if (isFirebaseConfigured && auth?.currentUser) {
      const token = await auth.currentUser.getIdToken();
      headers.Authorization = `Bearer ${token}`;
    }
    return headers;
  }, []);

  const fetchTickets = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/support", { headers: await getHeaders() });
      if (res.ok) {
        const data = await res.json();
        setTickets(data.tickets || []);
      }
    } catch (err) {
      console.error("Failed to fetch tickets:", err);
    } finally {
      setLoading(false);
    }
  }, [getHeaders]);

  useEffect(() => {
    // One-time fetch on mount, gated behind a real staff/session check
    // server-side — not a synchronization loop.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchTickets();
  }, [fetchTickets]);

  async function handleUpdateStatus(id: string, status: string) {
    try {
      const headers = { ...(await getHeaders()), "Content-Type": "application/json" };
      const res = await fetch("/api/admin/support", {
        method: "PATCH",
        headers,
        body: JSON.stringify({ id, status }),
      });
      if (res.ok) {
        setTickets((prev) => prev.map((t) => (t.id === id ? { ...t, status } : t)));
        setMessage(`Ticket ${id} marked as ${status}.`);
        setTimeout(() => setMessage(null), 3000);
      }
    } catch {
      setMessage("Failed to update ticket.");
    }
  }

  const openCount = tickets.filter((t) => t.status === "open").length;
  const inProgressCount = tickets.filter((t) => t.status === "in_progress").length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-ink">Support Tickets</h1>
          <p className="text-xs text-steel mt-0.5">
            {openCount} open · {inProgressCount} in progress · from Firestore <code className="font-mono">supportTickets</code>
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button type="button" onClick={fetchTickets} className="v-btn v-btn-ghost text-xs py-1.5 px-3">
            <RefreshCw size={13} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {message && (
        <div className="p-3 rounded-xl bg-emerald/10 border border-emerald/20 text-emerald text-xs font-semibold">
          {message}
        </div>
      )}

      <div className="bg-white rounded-2xl border border-black/5 overflow-hidden shadow-2xs">
        {loading ? (
          <div className="py-12 flex justify-center">
            <Loader2 size={24} className="animate-spin text-violet" />
          </div>
        ) : tickets.length === 0 ? (
          <div className="py-12 text-center text-xs text-steel space-y-2">
            <HeadphonesIcon size={24} className="mx-auto text-steel/40" />
            <p>No support tickets yet.</p>
            <p className="text-[11px]">Tickets submitted via the contact form will appear here.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-ivory-2 text-steel font-semibold border-b border-black/5">
                <tr>
                  <th className="px-5 py-3.5">Ticket ID</th>
                  <th className="px-5 py-3.5">Subject</th>
                  <th className="px-5 py-3.5">Customer</th>
                  <th className="px-5 py-3.5">Status</th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/5">
                {tickets.map((t) => (
                  <tr key={t.id} className="hover:bg-ivory-2/40 transition-colors">
                    <td className="px-5 py-3.5 font-mono text-[11px] font-semibold text-violet">{t.id}</td>
                    <td className="px-5 py-3.5 max-w-[260px]">
                      <p className="font-medium text-ink line-clamp-2 leading-snug">
                        {t.subject || t.title || "Support Request"}
                      </p>
                    </td>
                    <td className="px-5 py-3.5 text-steel">{t.customer || t.userEmail || "Anonymous"}</td>
                    <td className="px-5 py-3.5">
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-semibold capitalize ${
                          statusStyle[t.status] || "text-steel bg-black/5"
                        }`}
                      >
                        {t.status.replace(/_/g, " ")}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      {t.status !== "resolved" && t.status !== "closed" && (
                        <button
                          type="button"
                          onClick={() => handleUpdateStatus(t.id, "resolved")}
                          className="text-xs font-semibold text-emerald hover:underline flex items-center gap-1 ml-auto"
                        >
                          <CheckCheck size={13} /> Resolve
                        </button>
                      )}
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
