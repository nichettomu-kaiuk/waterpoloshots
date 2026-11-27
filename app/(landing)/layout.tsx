import type { Metadata } from "next";
import "../globals.css";
import RootHtml from "@/components/RootHtml";

export const metadata: Metadata = {
  title: "Campionati",
  description: "Calendario, classifiche e risultati live dei campionati.",
};

// Root layout for "/" (tournament chooser) and the old single-tournament
// URLs, which only redirect.
export default function LandingLayout({ children }: { children: React.ReactNode }) {
  return <RootHtml>{children}</RootHtml>;
}
