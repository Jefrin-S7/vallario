"use client";

import { useState, useEffect, useCallback } from "react";
import { Save, Loader2, CheckCircle, AlertCircle, RefreshCw } from "lucide-react";
import { auth, isFirebaseConfigured } from "@/lib/firebase/client";

interface StoreSettings {
  storeName: string;
  supportEmail: string;
  currency: string;
  taxRate: number;
  enableCashfree: boolean;
  enablePaypal: boolean;
  maintenanceMode: boolean;
  allowGuestCheckout: boolean;
  signedUrlExpiryMinutes: number;
}

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<StoreSettings>({
    storeName: "VALLARIO",
    supportEmail: "support@vallario.com",
    currency: "USD",
    taxRate: 0,
    enableCashfree: true,
    enablePaypal: true,
    maintenanceMode: false,
    allowGuestCheckout: false,
    signedUrlExpiryMinutes: 15,
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ text: string; ok: boolean } | null>(null);
  const [environment, setEnvironment] = useState({
    firebaseAdmin: false,
    cashfree: false,
    paypal: false,
    objectStorage: false,
    email: false,
  });

  const getHeaders = useCallback(async (withContentType = false) => {
    const headers: Record<string, string> = {};
    if (isFirebaseConfigured && auth?.currentUser) {
      const token = await auth.currentUser.getIdToken();
      headers.Authorization = `Bearer ${token}`;
    }
    if (withContentType) headers["Content-Type"] = "application/json";
    return headers;
  }, []);

  const fetchSettings = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/settings", { headers: await getHeaders() });
      if (res.ok) {
        const data = await res.json();
        if (data.settings) setSettings(data.settings);
        if (data.environment) setEnvironment(data.environment);
      }
    } catch (err) {
      console.error("Failed to load settings:", err);
    } finally {
      setLoading(false);
    }
  }, [getHeaders]);

  useEffect(() => {
    // One-time fetch on mount, gated behind a real staff/session check
    // server-side — not a synchronization loop.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchSettings();
  }, [fetchSettings]);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setMessage(null);
    try {
      const res = await fetch("/api/admin/settings", {
        method: "POST",
        headers: await getHeaders(true),
        body: JSON.stringify(settings),
      });
      if (res.ok) {
        setMessage({ text: "Settings saved to Firestore successfully.", ok: true });
      } else {
        const data = await res.json();
        setMessage({ text: data.message || "Failed to save.", ok: false });
      }
    } catch {
      setMessage({ text: "Network error saving settings.", ok: false });
    } finally {
      setSaving(false);
      setTimeout(() => setMessage(null), 4000);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 size={24} className="animate-spin text-violet" />
      </div>
    );
  }

  return (
    <form onSubmit={handleSave} className="space-y-6 max-w-2xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-ink">Store Settings</h1>
          <p className="text-xs text-steel mt-0.5">Saved to Firestore <code className="font-mono">settings/store_config</code>.</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={fetchSettings}
            className="v-btn v-btn-ghost text-xs py-1.5 px-3"
          >
            <RefreshCw size={13} />
          </button>
        </div>
      </div>

      {message && (
        <div className={`p-3.5 rounded-xl border text-xs font-semibold flex items-center gap-2 ${
          message.ok
            ? "bg-emerald/10 border-emerald/20 text-emerald"
            : "bg-crimson/10 border-crimson/20 text-crimson"
        }`}>
          {message.ok ? <CheckCircle size={15} /> : <AlertCircle size={15} />}
          <span>{message.text}</span>
        </div>
      )}

      {/* Store Details */}
      <div className="bg-white rounded-2xl border border-black/5 p-6 space-y-4 shadow-2xs">
        <h2 className="font-display font-bold text-sm text-ink">Store Details</h2>
        <Field label="Store Name">
          <input
            value={settings.storeName}
            onChange={(e) => setSettings((s) => ({ ...s, storeName: e.target.value }))}
            className="field-input"
          />
        </Field>
        <Field label="Support Email">
          <input
            type="email"
            value={settings.supportEmail}
            onChange={(e) => setSettings((s) => ({ ...s, supportEmail: e.target.value }))}
            className="field-input"
          />
        </Field>
        <Field label="Currency">
          <select
            value={settings.currency}
            onChange={(e) => setSettings((s) => ({ ...s, currency: e.target.value }))}
            className="field-input"
          >
            <option value="USD">USD — US Dollar</option>
            <option value="INR">INR — Indian Rupee</option>
            <option value="EUR">EUR — Euro</option>
          </select>
        </Field>
        <Field label="Tax Rate (%)">
          <input
            type="number"
            min={0}
            max={100}
            step={0.5}
            value={settings.taxRate}
            onChange={(e) => setSettings((s) => ({ ...s, taxRate: Number(e.target.value) }))}
            className="field-input"
          />
        </Field>
        <Field label="Download Link Expiry (minutes)">
          <input
            type="number"
            min={5}
            max={120}
            value={settings.signedUrlExpiryMinutes}
            onChange={(e) => setSettings((s) => ({ ...s, signedUrlExpiryMinutes: Number(e.target.value) }))}
            className="field-input"
          />
        </Field>
      </div>

      {/* Payment Gateways */}
      <div className="bg-white rounded-2xl border border-black/5 p-6 space-y-4 shadow-2xs">
        <h2 className="font-display font-bold text-sm text-ink">Payment Gateways</h2>
        <Toggle
          label="Cashfree Payments"
          description="Accept cards, UPI, and net banking via Cashfree"
          enabled={settings.enableCashfree}
          onChange={(v) => setSettings((s) => ({ ...s, enableCashfree: v }))}
        />
        <Toggle
          label="PayPal"
          description="Accept international payments via PayPal"
          enabled={settings.enablePaypal}
          onChange={(v) => setSettings((s) => ({ ...s, enablePaypal: v }))}
        />
        <Toggle
          label="Guest Checkout"
          description="Allow purchases without creating an account"
          enabled={settings.allowGuestCheckout}
          onChange={(v) => setSettings((s) => ({ ...s, allowGuestCheckout: v }))}
        />
      </div>

      {/* Store Status */}
      <div className="bg-white rounded-2xl border border-black/5 p-6 space-y-4 shadow-2xs">
        <h2 className="font-display font-bold text-sm text-ink">Store Status</h2>
        <Toggle
          label="Maintenance Mode"
          description="Show a maintenance notice to all visitors"
          enabled={settings.maintenanceMode}
          onChange={(v) => setSettings((s) => ({ ...s, maintenanceMode: v }))}
          danger
        />

        <div className="pt-2 border-t border-black/5">
          <h3 className="text-xs font-semibold text-steel mb-3">Environment Status</h3>
          <div className="space-y-2">
            <StatusRow label="Firebase Admin (Firestore/Auth)" ok={environment.firebaseAdmin} note={environment.firebaseAdmin ? "Connected via service account" : "Set FIREBASE_PROJECT_ID / CLIENT_EMAIL / PRIVATE_KEY"} />
            <StatusRow label="Object storage (R2/S3)" ok={environment.objectStorage} note={environment.objectStorage ? "Connected" : "Set S3_ENDPOINT, S3_ACCESS_KEY_ID, S3_SECRET_ACCESS_KEY, S3_BUCKET_NAME"} />
            <StatusRow label="Firebase Auth (browser)" ok={isFirebaseConfigured} note={isFirebaseConfigured ? "Email/password + Google" : "Set NEXT_PUBLIC_FIREBASE_* in .env.local"} />
            <StatusRow label="Cashfree" ok={environment.cashfree} note={environment.cashfree ? "Configured" : "Set CASHFREE_CLIENT_ID, CLIENT_SECRET & WEBHOOK_SECRET"} />
            <StatusRow label="PayPal" ok={environment.paypal} note={environment.paypal ? "Configured" : "Set PAYPAL_CLIENT_ID, CLIENT_SECRET & WEBHOOK_ID"} />
            <StatusRow label="Email delivery" ok={environment.email} note={environment.email ? "Configured" : "Set EMAIL_PROVIDER_API_KEY — logs to console until then"} />
          </div>
        </div>
      </div>

      <button
        type="submit"
        disabled={saving}
        className="v-btn v-btn-primary py-2.5 px-6 text-sm"
      >
        {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
        <span>{saving ? "Saving to Firestore..." : "Save Settings"}</span>
      </button>
    </form>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs font-semibold text-steel">{label}</label>
      {children}
    </div>
  );
}

function Toggle({
  label,
  description,
  enabled,
  onChange,
  danger = false,
}: {
  label: string;
  description: string;
  enabled: boolean;
  onChange: (v: boolean) => void;
  danger?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-4 py-1">
      <div>
        <p className={`text-sm font-semibold ${danger && enabled ? "text-crimson" : "text-ink"}`}>{label}</p>
        <p className="text-xs text-steel">{description}</p>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={enabled}
        onClick={() => onChange(!enabled)}
        className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors ${
          enabled ? (danger ? "bg-crimson" : "bg-violet") : "bg-black/10"
        }`}
      >
        <span
          className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-sm transition-transform ${
            enabled ? "translate-x-5" : "translate-x-0"
          }`}
        />
      </button>
    </div>
  );
}

function StatusRow({ label, ok, note }: { label: string; ok: boolean; note?: string }) {
  return (
    <div className="flex items-center justify-between gap-4 text-xs">
      <span className="font-medium text-ink">{label}</span>
      <div className="flex items-center gap-1.5">
        <span className={`font-semibold ${ok ? "text-emerald" : "text-steel"}`}>
          {ok ? "● Connected" : "○ Not set"}
        </span>
        {note && <span className="text-[11px] text-steel">— {note}</span>}
      </div>
    </div>
  );
}
