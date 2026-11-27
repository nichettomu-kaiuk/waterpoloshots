import { redirect } from "next/navigation";

// Marcatori is part of the merged Classifiche page — this route just
// forwards old links/bookmarks there instead of 404ing.
export default function MarcatoriRedirect({ params }: { params: { tournament: string } }) {
  redirect(`/${params.tournament}/classifiche#marcatori`);
}
