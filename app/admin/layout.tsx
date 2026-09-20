import type { Metadata } from "next";
import { Oswald, Inter, JetBrains_Mono, Space_Grotesk } from "next/font/google";
import "../globals.css";

// Root layout for the whole /admin section (its own <html>/<body>, separate
// from app/(site)/layout.tsx and app/[slug]/layout.tsx — see the comment in
// the latter for why). This shared shell covers pages that have no single
// championship to theme (the /admin campionati list, /admin/login), so it
// never applies a theme class or brand color overrides itself — it just
// registers every font next/font/google may need. app/admin/[slug]/layout.tsx
// is the one that actually applies the championship's theme class and brand
// colors, on a wrapper inside AdminChampionshipShell (once the slug — and so
// the championship's settings — is known), covering the whole per-campionato
// admin section (Dashboard/Impostazioni/News/Squadre/Giocatori/Partite/Piscine).
//
// Forced fully dynamic (never cached): applies to every page under /admin,
// since a Next.js dynamic/cache setting on a layout covers its whole
// subtree. This is what keeps Admin always showing fresh data after the
// public site's queries (lib/queries.ts) moved to a cookie-free client to
// make ISR possible there — without this, /admin/[slug]/... could otherwise
// get cached the same way and show stale data right after an edit.
export const dynamic = "force-dynamic";
const display = Oswald({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  variable: "--font-display",
});
const body = Inter({ subsets: ["latin"], variable: "--font-body" });
const mono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-mono" });
// Registrato qui (non solo in app/[slug]/layout.tsx) perché il tema
// "Magazine" può ora essere applicato anche nella sezione Admin (vedi sopra):
// senza questa variabile CSS disponibile su <html>, .theme-magazine
// (globals.css) rimapperebbe --font-display su un --font-magazine mai
// definito, perdendo il font del tema invece di usare il fallback Oswald.
const magazine = Space_Grotesk({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  variable: "--font-magazine",
});

export const metadata: Metadata = {
  title: "Admin",
  description: "Pannello di amministrazione.",
};

export default function AdminRootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="it" className={`${display.variable} ${body.variable} ${mono.variable} ${magazine.variable}`}>
      <body className="font-body min-h-screen antialiased">
        <div className="min-h-screen px-4 py-6">{children}</div>
      </body>
    </html>
  );
}
