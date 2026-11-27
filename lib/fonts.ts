import { Oswald, Inter, JetBrains_Mono } from "next/font/google";

// Font loaders must live in module scope; shared by every root layout.
export const display = Oswald({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  variable: "--font-display",
});
export const body = Inter({ subsets: ["latin"], variable: "--font-body" });
export const mono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-mono" });
