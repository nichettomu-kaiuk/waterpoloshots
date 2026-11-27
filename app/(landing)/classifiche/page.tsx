import { redirectLegacy } from "@/lib/legacy";

export default async function LegacyClassifiche() {
  await redirectLegacy("/classifiche");
}
