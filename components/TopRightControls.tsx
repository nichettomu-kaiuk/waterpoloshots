"use client";

import { useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Info, Lock, X, Mail } from "lucide-react";
import type { Settings } from "@/lib/supabase/types";

const DEFAULT_INFO_TEXT =
  "(c) 2026 Nicola De Santis - Waterpolo Shots. Tutti i diritti sono riservati.";

// Two small fixed corner icons shared across the whole app: an "i" info
// popup (always visible) and the Admin shortcut (hidden while already
// inside /admin, which has its own nav). Kept as one component so their
// spacing is managed together instead of two independently-positioned
// fixed elements guessing at each other's width.
export default function TopRightControls({ settings }: { settings: Settings | null }) {
  const pathname = usePathname();
  const [infoOpen, setInfoOpen] = useState(false);
  const isAdminSection = pathname.startsWith("/admin");

  const infoText = settings?.info_text?.trim() || DEFAULT_INFO_TEXT;

  return (
    <>
      <div className="fixed right-3 top-3 z-40 flex items-center gap-2">
        <button
          onClick={() => setInfoOpen(true)}
          aria-label="Informazioni"
          className="flex h-9 w-9 items-center justify-center rounded-full border border-line bg-ink/70 text-muted backdrop-blur transition hover:border-gold hover:text-gold"
        >
          <Info size={18} />
        </button>

        {!isAdminSection && (
          <Link
            href="/admin"
            aria-label="Pannello Admin"
            className="flex h-9 w-9 items-center justify-center rounded-full border border-line bg-ink/70 text-muted backdrop-blur transition hover:border-gold hover:text-gold"
          >
            <Lock size={18} />
          </Link>
        )}
      </div>

      {infoOpen &&
        typeof document !== "undefined" &&
        createPortal(
          <div
            className="fixed inset-0 z-50 flex items-end justify-center bg-black/70"
            onClick={() => setInfoOpen(false)}
          >
            <div
              className="w-full max-w-md animate-rise rounded-t-3xl border-t border-line bg-surface p-6 pb-8"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="mb-4 flex items-center justify-between">
                <p className="font-display text-base font-bold">Informazioni</p>
                <button
                  onClick={() => setInfoOpen(false)}
                  className="text-muted hover:text-white"
                  aria-label="Chiudi"
                >
                  <X size={20} />
                </button>
              </div>

              {settings?.info_image_url && (
                <div className="relative mb-4 h-32 w-full overflow-hidden rounded-xl">
                  <Image src={settings.info_image_url} alt="Informazioni" fill className="object-cover" />
                </div>
              )}

              <p className="whitespace-pre-line text-sm leading-relaxed text-muted">{infoText}</p>

              {settings?.info_email && (
                <a
                  href={`mailto:${settings.info_email}`}
                  className="mt-4 flex items-center justify-center gap-2 rounded-xl border border-line py-2.5 text-sm font-medium text-primary transition hover:border-primary"
                >
                  <Mail size={15} /> {settings.info_email}
                </a>
              )}
            </div>
          </div>,
          document.body
        )}
    </>
  );
}
