import { redirectLegacy } from "@/lib/legacy";

export default async function LegacySquadre() {
  await redirectLegacy("/squadre");
}
