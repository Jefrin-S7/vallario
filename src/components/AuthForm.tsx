"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  sendEmailVerification,
} from "firebase/auth";
import { auth, isFirebaseConfigured } from "@/lib/firebase/client";
import { Loader2, Info } from "lucide-react";
import { FirebaseError } from "firebase/app";

function authErrorMessage(err: unknown, fallback: string): string {
  if (err instanceof FirebaseError) {
    switch (err.code) {
      case "auth/email-already-in-use":
        return "An account with this email already exists.";
      case "auth/invalid-credential":
      case "auth/wrong-password":
      case "auth/user-not-found":
        return "Incorrect email or password.";
      case "auth/weak-password":
        return "Choose a password with at least 6 characters.";
      case "auth/popup-closed-by-user":
        return "Sign-in was cancelled.";
      default:
        return err.message;
    }
  }
  return fallback;
}

// Registers the new Firebase Auth user's Firestore profile server-side, with
// a role the client can never choose itself. This replaces what would
// otherwise be a Cloud Functions `onUserCreate` trigger — done here instead
// so the whole project runs on Firebase's free Spark plan (Cloud Functions
// require the paid Blaze plan).
async function provisionUserProfile(idToken: string) {
  try {
    await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${idToken}` },
    });
  } catch {
    // Non-fatal: the dashboard/admin surfaces treat a missing profile doc as
    // "not yet provisioned" rather than crashing. Worth a retry/backoff in a
    // real deployment, but auth itself has already succeeded.
  }
}

export default function AuthForm({ mode }: { mode: "login" | "register" }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirect") || "/dashboard";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!isFirebaseConfigured || !auth) {
      // Demo mode: no Firebase project connected yet.
      router.push(redirectTo);
      return;
    }

    setLoading(true);
    try {
      if (mode === "register") {
        const cred = await createUserWithEmailAndPassword(auth, email, password);
        await sendEmailVerification(cred.user);
        await provisionUserProfile(await cred.user.getIdToken());
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
      router.push(redirectTo);
    } catch (err) {
      setError(authErrorMessage(err, "Something went wrong. Please try again."));
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogle() {
    if (!isFirebaseConfigured || !auth) {
      router.push(redirectTo);
      return;
    }
    setError(null);
    setLoading(true);
    try {
      const cred = await signInWithPopup(auth, new GoogleAuthProvider());
      await provisionUserProfile(await cred.user.getIdToken());
      router.push(redirectTo);
    } catch (err) {
      setError(authErrorMessage(err, "Google sign-in failed."));
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mt-6 space-y-4">
      {!isFirebaseConfigured && (
        <div className="flex gap-2 rounded-xl border border-violet/20 bg-violet/5 p-3 text-xs text-ink/70">
          <Info size={14} className="mt-0.5 shrink-0 text-violet" />
          <span>
            Demo mode — no Firebase project connected. This form will route straight to the
            dashboard without creating a real account. Add your config to{" "}
            <code className="font-mono">.env.local</code> to enable real auth.
          </span>
        </div>
      )}
      {mode === "register" && (
        <Field label="Full name">
          <input
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="v-input"
            placeholder="Jane Doe"
          />
        </Field>
      )}
      <Field label="Email">
        <input
          required
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="v-input"
          placeholder="you@example.com"
        />
      </Field>
      <Field label="Password">
        <input
          required
          minLength={8}
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="v-input"
          placeholder="At least 8 characters"
        />
      </Field>

      {error && <p className="text-xs text-crimson">{error}</p>}

      <button type="submit" disabled={loading} className="v-btn-primary w-full justify-center">
        {loading && <Loader2 size={16} className="animate-spin" />}
        {mode === "register" ? "Create account" : "Sign in"}
      </button>

      <div className="flex items-center gap-3 text-xs text-steel">
        <span className="flex-1 h-px bg-black/10" /> or <span className="flex-1 h-px bg-black/10" />
      </div>

      <button
        type="button"
        onClick={handleGoogle}
        disabled={loading}
        className="w-full rounded-full border border-black/10 py-2.5 text-sm font-semibold hover:bg-ivory-2 transition-colors"
      >
        Continue with Google
      </button>

      {mode === "login" && (
        <p className="text-center text-xs text-steel">
          <a href="#" className="hover:text-violet">
            Forgot password?
          </a>
        </p>
      )}
    </form>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block text-sm">
      <span className="text-xs font-medium text-steel">{label}</span>
      <div className="mt-1">{children}</div>
    </label>
  );
}
