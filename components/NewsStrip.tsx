"use client";

import { useState } from "react";
import Image from "next/image";
import { Newspaper, X } from "lucide-react";
import type { NewsPost } from "@/lib/supabase/types";

function formatShort(iso: string) {
  return new Date(iso).toLocaleDateString("it-IT", { day: "2-digit", month: "short" });
}
function formatLong(iso: string) {
  return new Date(iso).toLocaleDateString("it-IT", { day: "2-digit", month: "long", year: "numeric" });
}

export default function NewsStrip({ news }: { news: NewsPost[] }) {
  const [active, setActive] = useState<NewsPost | null>(null);

  if (news.length === 0) return null;

  return (
    <div className="mt-5">
      <div className="mb-2 flex items-center gap-1.5 text-[11px] uppercase tracking-widest text-gold">
        <Newspaper size={13} />
        News
      </div>
      <div className="scrollbar-none -mx-5 flex gap-3 overflow-x-auto px-5 pb-1">
        {news.map((post) => (
          <button
            key={post.id}
            onClick={() => setActive(post)}
            className="flex w-56 shrink-0 items-center gap-2.5 rounded-xl border border-line/60 bg-surface/80 px-3 py-2 text-left backdrop-blur transition active:scale-[0.98]"
          >
            {post.image_url ? (
              <Image
                src={post.image_url}
                alt={post.title}
                width={36}
                height={36}
                className="h-9 w-9 shrink-0 rounded-lg object-cover"
              />
            ) : (
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-surface-raised">
                <Newspaper size={14} className="text-gold" />
              </div>
            )}
            <div className="min-w-0">
              <p className="truncate text-xs font-medium">{post.title}</p>
              <p className="truncate text-[10px] text-muted">{formatShort(post.created_at)}</p>
            </div>
          </button>
        ))}
      </div>

      {active && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/70"
          onClick={() => setActive(null)}
        >
          <div
            className="w-full max-w-md animate-rise rounded-t-3xl border-t border-line bg-surface pb-10"
            onClick={(e) => e.stopPropagation()}
          >
            {active.image_url && (
              <div className="relative h-44 w-full">
                <Image src={active.image_url} alt={active.title} fill className="rounded-t-3xl object-cover" />
              </div>
            )}
            <div className="p-6">
              <div className="mb-3 flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs text-muted">{formatLong(active.created_at)}</p>
                  <h3 className="mt-1 font-display text-xl font-bold leading-tight">{active.title}</h3>
                </div>
                <button onClick={() => setActive(null)} className="shrink-0 text-muted hover:text-white" aria-label="Chiudi">
                  <X size={20} />
                </button>
              </div>
              <p className="whitespace-pre-line text-sm leading-relaxed text-muted">{active.content}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
