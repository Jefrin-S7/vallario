import { FlaskConical } from "lucide-react";

// Marks a page (or section) as showing illustrative/seed data rather than
// live Firestore data — distinct from ProductionBadge, which reflects
// whether the Firebase Admin connection itself is working. A page can be
// fully connected and still show this if the specific numbers on it (e.g.
// the analytics charts) are placeholders pending real aggregation.
export default function DemoBadge({ label }: { label?: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-gold/30 bg-gold/10 text-gold px-3 py-1.5 text-xs font-semibold">
      <FlaskConical size={13} />
      {label || "Demo data — not connected to Firestore"}
    </span>
  );
}
