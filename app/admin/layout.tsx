import type { Metadata } from "next";
import { Oswald, Inter, JetBrains_Mono } from "next/font/google";
import "../globals.css";

// Root layout for the whole /admin section (its own <html>/<body>, separate
// from app/(site)/layout.tsx and app/[slug]/layout.tsx — see the comment in
// the latter for why). The Admin panel always uses the Classico look,
// regardless of any championship's chosen theme, for readability of the
// management tool — so unlike app/[slug]/layout.tsx it never applies a
// theme class or brand color overrides here.
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

export const metadata: Metadata = {
  title: "Admin",
  description: "Pannello di amministrazione.",
};

export default function AdminRootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="it" className={`${display.variable} ${body.variable} ${mono.variable}`}>
      <body className="font-body min-h-screen antialiased">
        <div className="min-h-screen px-4 py-6">{children}</div>
      </body>
    </html>
  );
}
