import { redirectLegacy } from "@/lib/legacy";

export default async function LegacyNews() {
  await redirectLegacy("/news");
}
