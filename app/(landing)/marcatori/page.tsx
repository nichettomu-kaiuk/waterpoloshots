import { redirectLegacy } from "@/lib/legacy";

export default async function LegacyMarcatori() {
  await redirectLegacy("/classifiche#marcatori");
}
