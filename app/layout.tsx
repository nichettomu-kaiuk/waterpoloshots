import type { Metadata } from "next";
import { Oswald, Inter, JetBrains_Mono, Space_Grotesk } from "next/font/google";
import "./globals.css";

const display = Oswald({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  variable: "--font-display",
});
const body = Inter({ subsets: ["latin"], variable: "--font-body" });
const mono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-mono" });
// Display face used only by the "Magazine" theme, which remaps
// --font-display to --font-magazine in globals.css.
const magazine = Space_Grotesk({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  variable: "--font-magazine",
});

// This root layout is intentionally minimal: it only registers fonts and
// renders <html>/<body>. It wraps BOTH the campionati selector (app/page.tsx
// — the site's first page, listing every tournament) and every tournament's
// own pages (app/[slug]/...). Per-tournament concerns — branding, theme,
// bottom nav, admin shortcut — live in app/[slug]/layout.tsx instead, since
// they only make sense once a campionato has been chosen. See
// PROJECT_STATUS.md, "Multi-campionato".
export const metadata: Metadata = {
  title: "Campionati",
  description: "Scegli il campionato da consultare: calendario, classifiche e risultati live.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="it" className={`${display.variable} ${body.variable} ${mono.variable} ${magazine.variable}`}>
      <body className="font-body min-h-screen antialiased">{children}</body>
    </html>
  );
}
