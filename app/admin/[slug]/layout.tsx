import { getChampionshipOrNotFound } from "@/lib/championship";
import AdminChampionshipShell from "@/components/admin/AdminChampionshipShell";

// Resolves the championship from the URL (server-side, so a mistyped or
// deleted slug 404s immediately) and hands it to the client-side nav shell,
// which also puts it in context for every nested "use client" admin page
// (teams, players, matches, venues, news, settings) via useChampionship().
export default async function AdminChampionshipLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { slug: string };
}) {
  const championship = await getChampionshipOrNotFound(params.slug);

  return <AdminChampionshipShell championship={championship}>{children}</AdminChampionshipShell>;
}
