import { AlertTriangle } from "lucide-react";

// Visible error banner for the Admin panel: any failed read/write/upload is
// shown here instead of failing silently.
export default function AdminError({ message }: { message: string | null }) {
  if (!message) return null;
  return (
    <div
      role="alert"
      className="mb-4 flex max-w-xl items-start gap-2 rounded-xl border border-primary/40 bg-primary/10 px-3 py-2.5 text-xs text-primary"
    >
      <AlertTriangle size={14} className="mt-0.5 shrink-0" />
      <span>{message}</span>
    </div>
  );
}
