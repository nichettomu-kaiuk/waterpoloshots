import { redirectLegacyEntity } from "@/lib/legacy";

export default async function LegacyNewsPost({ params }: { params: { id: string } }) {
  await redirectLegacyEntity("news", params.id);
}
