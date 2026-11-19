import type { Metadata } from "next";
import { Oswald, Inter, JetBrains_Mono } from "next/font/google";
import "../globals.css";

// Root layout for the top-level selector page (app/(site)/page.tsx) — the
// very first thing a visitor sees, before picking a championship. It's a
// separate Next.js "root layout" (its own <html>/<body>) from
// app/[slug]/layout.tsx and app/admin/layout.tsx: see those files for why —
// each section of the site needs its own <html> classes (per-championship
// theme vs. always-classic admin vs. this neutral selector), which Next.js
// only allows via independent top-level route groups.
const display = Oswald({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  variable: "--font-display",
});
const body = Inter({ subsets: ["latin"], variable: "--font-body" });
const mono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-mono" });

export const metadata: Metadata = {
  title: "Scegli il campionato",
  description: "Calendario, classifiche e risultati live dei campionati di pallanuoto.",
};

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="it" className={`${display.variable} ${body.variable} ${mono.variable}`}>
      <body className="font-body min-h-screen antialiased">{children}</body>
    </html>
  );
}
