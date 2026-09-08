import { redirect } from "next/navigation";

// Marcatori is now part of the merged Classifiche page — this route just
// forwards old links/bookmarks there instead of 404ing.
export default function MarcatoriRedirect() {
  redirect("/classifiche#marcatori");
}
