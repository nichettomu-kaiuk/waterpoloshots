import { redirectLegacyEntity } from "@/lib/legacy";

export default async function LegacyGiocatore({ params }: { params: { id: string } }) {
  await redirectLegacyEntity("giocatore", params.id);
}
