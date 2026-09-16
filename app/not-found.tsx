import Link from "next/link";

// Shown for any unmatched route, including a /<slug> that doesn't match any
// existing (or already-deleted) campionato — app/[slug]/layout.tsx calls
// notFound() in that case. Deliberately theme-agnostic (no tournament to
// style itself around): relies only on the default tokens in globals.css.
export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-6 text-center">
      <p className="text-xs uppercase tracking-widest text-gold">404</p>
      <h1 className="mt-2 font-display text-2xl font-bold">Pagina non trovata</h1>
      <p className="mt-2 max-w-xs text-sm text-muted">
        Questo campionato non esiste o è stato eliminato.
      </p>
      <Link
        href="/"
        className="mt-6 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-white transition hover:brightness-110"
      >
        Vedi tutti i campionati
      </Link>
    </main>
  );
}
