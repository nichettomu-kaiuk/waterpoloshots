"use client";

import { useState } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import { X, Mail } from "lucide-react";
import type { Settings } from "@/lib/supabase/types";

const DEFAULT_INFO_TEXT =
  "(c) 2026 Nicola De Santis - Waterpolo Shots. Tutti i diritti sono riservati.";

// Testo informativo mostrato in fondo a ogni pagina pubblica (reso dentro il
// flex flex-col min-h-screen di app/[slug]/layout.tsx, come ultimo elemento
// con mt-auto: resta ancorato in fondo anche sulle pagine corte, senza
// bisogno di scroll). Al posto del vecchio pulsante fisso con l'icona "i" in
// alto a destra (rimosso su richiesta esplicita), cliccando questo testo si
// apre la stessa finestra Credits di prima. Il pulsante di accesso
// all'area Admin che viveva accanto al vecchio pulsante "i" è stato invece
// spostato dentro l'header/hero (vedi components/Hero.tsx).
export default function TopRightControls({ settings }: { settings: Settings | null }) {
  const [infoOpen, setInfoOpen] = useState(false);
  const infoText = settings?.info_text?.trim() || DEFAULT_INFO_TEXT;

  return (
    <>
      <button
        onClick={() => setInfoOpen(true)}
        className="mt-auto w-full px-5 pb-3 pt-6 text-center text-[11px] leading-relaxed text-muted transition hover:text-gold hover:underline"
      >
        {infoText}
      </button>

      {infoOpen &&
        typeof document !== "undefined" &&
        createPortal(
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
            onClick={() => setInfoOpen(false)}
          >
            <div
              className="w-full max-w-md animate-rise rounded-3xl border border-line bg-surface p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="mb-4 flex items-center justify-between">
                <p className="font-display text-base font-bold">Credits</p>
                <button
                  onClick={() => setInfoOpen(false)}
                  className="text-muted hover:text-white"
                  aria-label="Chiudi"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="flex items-center gap-4">
                {settings?.info_image_url && (
                  <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl">
                    <Image src={settings.info_image_url} alt="Credits" fill className="object-cover" />
                  </div>
                )}
                <p className="whitespace-pre-line text-sm leading-relaxed text-muted">{infoText}</p>
              </div>

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
