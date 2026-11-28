// Shown instantly while a page of the tournament is being prepared, so
// navigating feels immediate (the header and bottom bar stay in place).
export default function Loading() {
  return (
    <main className="mx-auto w-full max-w-md px-5 py-6 lg:max-w-5xl lg:px-8 xl:max-w-6xl" aria-busy="true">
      <div className="mb-6 h-6 w-40 animate-pulse rounded-full bg-surface-raised" />
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-24 animate-pulse rounded-2xl border border-line bg-surface" />
        ))}
      </div>
    </main>
  );
}
