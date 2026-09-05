"use client";

import { useEffect } from "react";
import { AlertTriangle } from "lucide-react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // In production, forward this to your error-monitoring provider
    // (Sentry, etc.) keyed on error.digest so it's traceable back to the
    // server log line that produced it.
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-6 text-center">
      <div className="max-w-md">
        <div className="w-14 h-14 rounded-full bg-crimson/10 text-crimson flex items-center justify-center mx-auto mb-6">
          <AlertTriangle size={24} />
        </div>
        <h1 className="font-display text-xl font-bold">Something went wrong.</h1>
        <p className="text-steel mt-2">
          We hit an unexpected error loading this page. It&rsquo;s been logged — try again in a moment.
        </p>
        <button onClick={reset} className="v-btn v-btn-primary mt-8">
          Try again
        </button>
      </div>
    </div>
  );
}
