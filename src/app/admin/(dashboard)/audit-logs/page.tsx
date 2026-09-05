"use client";

import { useState, useEffect } from "react";
import { Lock, Loader2, RefreshCw, ShieldCheck } from "lucide-react";
import { auth, isFirebaseConfigured } from "@/lib/firebase/client";

interface AuditLog {
  id: string;
  action: string;
  actor: string;
  target: string;
  createdAt: string;
}

export default function AdminAuditLogsPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLogs();
  }, []);

  async function fetchLogs() {
    setLoading(true);
    try {
      let headers: Record<string, string> = {};
      if (isFirebaseConfigured && auth?.currentUser) {
        const token = await auth.currentUser.getIdToken();
        headers = { Authorization: `Bearer ${token}` };
      }

      const res = await fetch("/api/admin/audit-logs", { headers });
      if (res.ok) {
        const data = await res.json();
        setLogs(data.logs || []);
      }
    } catch (err) {
      console.error("Failed to load audit logs:", err);
    } finally {
      setLoading(false);
    }
  }

  function formatAction(action: string) {
    return action.replace(/_/g, " ");
  }

  function formatDate(iso: string) {
    try {
      return new Date(iso).toLocaleString("en-US", {
        dateStyle: "medium",
        timeStyle: "short",
      });
    } catch {
      return iso;
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-ink">Audit Logs</h1>
          <p className="text-xs text-steel mt-0.5 flex items-center gap-1">
            <Lock size={12} /> Read-only. Written exclusively by server code via Admin SDK.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button type="button" onClick={fetchLogs} className="v-btn v-btn-ghost text-xs py-1.5 px-3">
            <RefreshCw size={13} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-black/5 overflow-hidden shadow-2xs">
        {loading ? (
          <div className="py-12 flex justify-center">
            <Loader2 size={24} className="animate-spin text-violet" />
          </div>
        ) : logs.length === 0 ? (
          <div className="py-12 text-center text-xs text-steel space-y-2">
            <ShieldCheck size={24} className="mx-auto text-steel/40" />
            <p>No audit entries yet.</p>
            <p className="text-[11px]">Actions like order updates, role changes, and product edits will appear here.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-ivory-2 text-steel font-semibold border-b border-black/5">
                <tr>
                  <th className="px-5 py-3.5">Action</th>
                  <th className="px-5 py-3.5">Actor</th>
                  <th className="px-5 py-3.5">Target</th>
                  <th className="px-5 py-3.5">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/5">
                {logs.map((l) => (
                  <tr key={l.id} className="hover:bg-ivory-2/40 transition-colors">
                    <td className="px-5 py-3.5">
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-violet/10 text-violet px-2.5 py-0.5 text-[11px] font-mono font-semibold capitalize">
                        {formatAction(l.action)}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 font-mono text-steel">{l.actor}</td>
                    <td className="px-5 py-3.5 text-steel">{l.target}</td>
                    <td className="px-5 py-3.5 text-[11px] text-steel whitespace-nowrap">{formatDate(l.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <p className="text-xs text-steel">
        Last 100 entries from Firestore <code className="font-mono">auditLogs</code> collection.
        Entries are append-only and protected by Firestore security rules.
      </p>
    </div>
  );
}
