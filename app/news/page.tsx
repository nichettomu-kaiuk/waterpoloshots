import { Newspaper } from "lucide-react";
import { getNewsPosts } from "@/lib/queries";
import NewsCard from "@/components/NewsCard";

export default async function NewsArchivePage() {
  const news = await getNewsPosts(100);

  return (
    <main className="mx-auto w-full max-w-md px-5 py-6 lg:max-w-5xl lg:px-8 xl:max-w-6xl">
      <div className="mb-5 flex items-center gap-2">
        <Newspaper size={20} className="text-gold" />
        <h1 className="font-display text-2xl font-bold">Archivio News</h1>
      </div>

      {news.length === 0 ? (
        <p className="text-sm text-muted">Nessuna news pubblicata ancora.</p>
      ) : (
        <div className="grid grid-cols-1 gap-3 lg:grid-cols-2 xl:grid-cols-3">
          {news.map((post) => (
            <NewsCard key={post.id} post={post} />
          ))}
        </div>
      )}
    </main>
  );
}
