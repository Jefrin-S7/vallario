const styles: Record<string, string> = {
  paid: "text-emerald bg-emerald/10",
  pending: "text-gold bg-gold/10",
  failed: "text-crimson bg-crimson/10",
  refunded: "text-steel bg-black/5",
  cancelled: "text-steel bg-black/5",
};

export default function StatusPill({ status }: { status: string }) {
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold capitalize ${styles[status] ?? ""}`}>
      {status}
    </span>
  );
}
