import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Newspaper } from "lucide-react";
import type { NewsPost } from "@/lib/supabase/types";

function excerpt(text: string, maxLength = 140) {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength).trimEnd() + "…";
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("it-IT", { day: "2-digit", month: "long", year: "numeric" });
}

// "horizontal": compact full-width row with a small image — used on the home
// page where cards stack one above another and text needs the extra room.
// "vertical" (default): image on top, full card — used in the News archive
// grid where cards sit side by side.
export default function NewsCard({
  post,
  variant = "vertical",
}: {
  post: NewsPost;
  variant?: "vertical" | "horizontal";
}) {
  if (variant === "horizontal") {
    return (
      <Link
        href={`/news/${post.id}`}
        className="flex w-full animate-rise items-center gap-3 rounded-2xl border border-line bg-surface p-3 transition active:scale-[0.99]"
      >
        {post.image_url ? (
          <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl">
            <Image src={post.image_url} alt={post.title} fill className="object-cover" />
          </div>
        ) : (
          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl bg-surface-raised">
            <Newspaper size={20} className="text-gold" />
          </div>
        )}
        <div className="min-w-0 flex-1">
          <p className="mb-0.5 text-[11px] text-muted">{formatDate(post.created_at)}</p>
          <h3 className="truncate font-display text-sm font-bold leading-snug">{post.title}</h3>
          <p className="mt-0.5 line-clamp-2 text-xs text-muted">{excerpt(post.content, 160)}</p>
        </div>
        <ArrowRight size={16} className="shrink-0 self-center text-primary" />
      </Link>
    );
  }

  return (
    <article className="animate-rise overflow-hidden rounded-2xl border border-line bg-surface">
      {post.image_url && (
        <div className="relative h-28 w-full">
          <Image src={post.image_url} alt={post.title} fill className="object-cover" />
        </div>
      )}
      <div className="p-4">
        <p className="mb-1 text-[11px] text-muted">{formatDate(post.created_at)}</p>
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
