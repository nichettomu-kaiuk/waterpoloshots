import { redirectLegacy } from "@/lib/legacy";

export default async function LegacyGiocatori() {
  await redirectLegacy("/giocatori");
}
