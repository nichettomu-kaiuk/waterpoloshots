import { Newspaper } from "lucide-react";
import { getNewsPosts } from "@/lib/queries";
import { getChampionshipOrNotFound } from "@/lib/championship";
import Hero from "@/components/Hero";
import NewsCard from "@/components/NewsCard";

export default async function NewsArchivePage({ params }: { params: { slug: string } }) {
  const championship = await getChampionshipOrNotFound(params.slug);
  const news = await getNewsPosts(championship.id, 100);

  return (
    <main className="mx-auto w-full max-w-md lg:max-w-5xl xl:max-w-6xl">
      <Hero championshipId={championship.id} />
      <div className="px-5 py-6 lg:px-8">
        <div className="mb-5 flex items-center gap-2">
          <Newspaper size={20} className="text-gold" />
          <h1 className="font-display text-2xl font-bold">Archivio News</h1>
        </div>

        {news.length === 0 ? (
          <p className="text-sm text-muted">Nessuna news pubblicata ancora.</p>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            {news.map((post) => (
              <NewsCard key={post.id} post={post} slug={params.slug} />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
