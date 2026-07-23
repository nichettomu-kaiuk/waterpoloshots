import Link from "next/link";
import Image from "next/image";
import { ArrowLeft } from "lucide-react";
import { getNewsPost } from "@/lib/queries";

export default async function NewsPostPage({ params }: { params: { id: string } }) {
  const post = await getNewsPost(params.id);

  if (!post) {
    return (
      <main className="mx-auto w-full max-w-md px-5 py-10 text-center text-sm text-muted lg:max-w-5xl lg:px-8 xl:max-w-6xl">
        Post non trovato.
        <div className="mt-4">
          <Link href="/news" className="text-primary">Torna all&apos;archivio News</Link>
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto w-full max-w-md pb-6 lg:max-w-3xl">
      {post.image_url && (
        <div className="relative h-56 w-full lg:mt-6 lg:h-72 lg:rounded-3xl lg:overflow-hidden">
          <Image src={post.image_url} alt={post.title} fill className="object-cover" priority />
        </div>
      )}

      <div className="px-5 py-6">
        <Link href="/news" className="mb-4 inline-flex items-center gap-1.5 text-xs text-muted hover:text-white">
          <ArrowLeft size={14} /> Archivio News
        </Link>

        <p className="text-xs text-muted">
          {new Date(post.created_at).toLocaleDateString("it-IT", {
            day: "2-digit",
            month: "long",
            year: "numeric",
          })}
        </p>
        <h1 className="mt-1 font-display text-2xl font-bold leading-tight">{post.title}</h1>
        <p className="mt-4 whitespace-pre-line text-sm leading-relaxed text-muted">{post.content}</p>
      </div>
    </main>
  );
}
