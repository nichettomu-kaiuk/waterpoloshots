import { redirectLegacyEntity } from "@/lib/legacy";

export default async function LegacySquadra({ params }: { params: { id: string } }) {
  await redirectLegacyEntity("squadra", params.id);
}
