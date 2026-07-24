import type { Metadata } from "next";
import { Oswald, Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import BottomNav from "@/components/BottomNav";
import AdminAccessButton from "@/components/AdminAccessButton";
import { getSettings } from "@/lib/queries";

const display = Oswald({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  variable: "--font-display",
});
const body = Inter({ subsets: ["latin"], variable: "--font-body" });
const mono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-mono" });

export const metadata: Metadata = {
  title: "Torneo di Pallanuoto",
  description: "Calendario, classifiche e risultati live del torneo.",
};

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
        <AdminAccessButton />
        <BottomNav />
      </body>
    </html>
  );
}
