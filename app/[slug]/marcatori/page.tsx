import { redirect } from "next/navigation";

// Marcatori is now part of the merged Classifiche page — this route just
// forwards old links/bookmarks there instead of 404ing.
export default function MarcatoriRedirect({ params }: { params: { slug: string } }) {
  redirect(`/${params.slug}/classifiche#marcatori`);
}
