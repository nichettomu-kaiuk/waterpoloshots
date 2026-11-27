import { redirectLegacy } from "@/lib/legacy";

export default async function LegacyCalendario() {
  await redirectLegacy("/calendario");
}
