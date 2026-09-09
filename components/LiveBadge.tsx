export default function LiveBadge({ label = "LIVE NOW" }: { label?: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/15 px-2.5 py-1 text-[11px] font-display font-semibold uppercase tracking-widest text-primary">
      <span className="relative flex h-2 w-2">
        <span className="absolute inline-flex h-full w-full animate-pulseDot rounded-full bg-primary" />
      </span>
      {label}
    </span>
  );
}
