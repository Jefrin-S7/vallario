import { Database, CloudOff } from "lucide-react";

// Shows the real connection state, driven by the `connected` flag every
// /api/admin/* GET route now returns. Previously this always rendered
// "Live Firestore" regardless of whether the fetch actually succeeded —
// so a broken, unconfigured admin panel looked identical to a working one,
// just with empty tables. Don't revert to a hardcoded "always live" badge.
export default function ProductionBadge({
  connected,
  projectId,
  label = "Live Firestore",
}: {
  connected: boolean;
  projectId?: string;
  label?: string;
}) {
  if (!connected) {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full border border-crimson/30 bg-crimson/10 text-crimson px-3 py-1 text-xs font-semibold shadow-xs">
        <CloudOff size={13} />
        <span>Not connected — see DEPLOYMENT.md</span>
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald/30 bg-emerald/10 text-emerald px-3 py-1 text-xs font-semibold shadow-xs">
      <span className="relative flex h-2 w-2">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald opacity-75"></span>
        <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald"></span>
      </span>
      <Database size={13} />
      <span>{label}</span>
      {projectId && (
        <span className="font-mono text-[10px] text-emerald/80 border-l border-emerald/20 pl-1.5 ml-0.5">
          {projectId}
        </span>
      )}
    </span>
  );
}
