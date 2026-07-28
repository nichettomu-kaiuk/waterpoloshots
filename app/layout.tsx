import type { Metadata } from "next";
import { Oswald, Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import BottomNav from "@/components/BottomNav";
import TopRightControls from "@/components/TopRightControls";
import { getSettings } from "@/lib/queries";

const display = Oswald({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  variable: "--font-display",
});
const body = Inter({ subsets: ["latin"], variable: "--font-body" });
const mono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-mono" });

// Dynamic so the browser tab title and favicon follow whatever is set in
// Admin → Impostazioni (tournament title + logo), falling back to
// "Serie B - Girone 3" and no custom icon when nothing is configured yet.
export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSettings();
  const title = settings?.tournament_title || "Serie B - Girone 3";

  return {
    title,
    description: "Calendario, classifiche e risultati live del torneo.",
    icons: settings?.logo_url ? { icon: settings.logo_url } : undefined,
  };
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const settings = await getSettings();

  const brandVars: React.CSSProperties = {
    ["--color-primary" as any]: settings?.primary_color ?? "#e10f21",
    ["--color-primary-dim" as any]: settings?.primary_color
      ? `${settings.primary_color}b0`
      : "#8c0a16",
    ["--color-gold" as any]: settings?.secondary_color ?? "#d4af37",
  };

  return (
    <html lang="it" className={`${display.variable} ${body.variable} ${mono.variable}`}>
      <body className="font-body min-h-screen antialiased" style={brandVars}>
        <div className="flex min-h-screen flex-col pb-24">{children}</div>
        <TopRightControls settings={settings} />
        <BottomNav />
      </body>
    </html>
  );
}
