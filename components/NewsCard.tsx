import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import type { NewsPost } from "@/lib/supabase/types";

function excerpt(text: string, maxLength = 120) {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength).trimEnd() + "…";
}

export default function NewsCard({ post }: { post: NewsPost }) {
  return (
    <article className="animate-rise overflow-hidden rounded-2xl border border-line bg-surface">
      {post.image_url && (
        <div className="relative h-40 w-full">
          <Image src={post.image_url} alt={post.title} fill className="object-cover" />
        </div>
      )}
      <div className="p-4">
        <p className="mb-1 text-[11px] text-muted">
          {new Date(post.created_at).toLocaleDateString("it-IT", {
            day: "2-digit",
            month: "long",
            year: "numeric",
          })}
        </p>
        <h3 className="mb-1.5 font-display text-base font-bold leading-snug">{post.title}</h3>
        <p className="mb-3 text-sm text-muted">{excerpt(post.content)}</p>
        <Link
          href={`/news/${post.id}`}
          className="inline-flex items-center gap-1 text-xs font-semibold text-primary"
        >
          Leggi tutto <ArrowRight size={13} />
        </Link>
      </div>
    </article>
  );
}
