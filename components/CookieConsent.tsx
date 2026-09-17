"use client";

import { useEffect, useState } from "react";
import { Cookie, ShieldCheck, BarChart3 } from "lucide-react";

const STORAGE_KEY = "cookie-consent";

type Consent = {
  necessary: true;
  analytics: boolean;
  timestamp: string;
};

function readConsent(): Consent | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as Consent;
  } catch {
    return null;
  }
}

function saveConsent(analytics: boolean) {
  const consent: Consent = { necessary: true, analytics, timestamp: new Date().toISOString() };
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(consent));
  } catch {
    // localStorage non disponibile (es. modalità privata): il banner si
    // ripresenterà al prossimo caricamento, ma non blocca l'uso del sito.
  }
}

// Banner di consenso cookie, mostrato una sola volta per visitatore (finché
// non cancella i dati del browser): la scelta è salvata in localStorage e non
// si ripresenta più sulle pagine successive. Montato sia nella Home
// selettore (app/(site)/layout.tsx) sia nel sito di ogni campionato
// (app/[slug]/layout.tsx) — non nel pannello Admin, che non è pubblico.
export default function CookieConsent() {
  const [view, setView] = useState<"hidden" | "banner" | "manage">("hidden");
  const [analyticsChoice, setAnalyticsChoice] = useState(false);

  useEffect(() => {
    if (!readConsent()) setView("banner");
  }, []);

  function acceptAll() {
    saveConsent(true);
    setView("hidden");
  }

  function rejectAll() {
    saveConsent(false);
    setView("hidden");
  }

  function savePreferences() {
    saveConsent(analyticsChoice);
    setView("hidden");
  }

  if (view === "hidden") return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-ink/70 p-0 backdrop-blur-sm sm:items-center sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-label="Gestione cookie"
    >
      <div className="w-full max-w-lg rounded-t-3xl border border-line bg-surface p-5 shadow-2xl sm:rounded-3xl sm:p-6">
        <div className="mb-3 flex items-center gap-2.5">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/15 text-primary">
            <Cookie size={20} />
          </div>
          <h2 className="font-display text-lg font-bold">
            {view === "banner" ? "Utilizziamo i cookie" : "Le tue preferenze sui cookie"}
          </h2>
        </div>

        {view === "banner" ? (
          <>
            <p className="mb-5 text-sm text-muted">
              Usiamo cookie tecnici necessari al funzionamento del sito (es. l&apos;accesso
              all&apos;area Admin) e, solo con il tuo consenso, cookie statistici per capire come
              viene usato il sito. Puoi accettarli tutti, rifiutarli oppure scegliere quali
              attivare.
            </p>
            <div className="flex flex-col gap-2 sm:flex-row-reverse">
              <button
                type="button"
                onClick={acceptAll}
                className="flex-1 rounded-xl bg-primary py-2.5 text-sm font-semibold text-white"
              >
                Accetta tutti
              </button>
              <button
                type="button"
                onClick={rejectAll}
                className="flex-1 rounded-xl border border-line py-2.5 text-sm font-medium text-muted hover:text-white"
              >
                Rifiuta
              </button>
              <button
                type="button"
                onClick={() => setView("manage")}
                className="flex-1 rounded-xl border border-line py-2.5 text-sm font-medium text-muted hover:text-white"
              >
                Gestisci cookie
              </button>
            </div>
          </>
        ) : (
          <>
            <div className="mb-5 space-y-3">
              <div className="flex items-start gap-3 rounded-xl border border-line bg-surface-raised p-3">
                <ShieldCheck size={18} className="mt-0.5 shrink-0 text-gold" />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-semibold">Cookie necessari</p>
                    <span className="shrink-0 rounded-full bg-surface px-2 py-0.5 text-[10px] uppercase tracking-wide text-muted">
                      Sempre attivi
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-muted">
                    Indispensabili per funzioni essenziali del sito, come l&apos;accesso all&apos;area
                    Admin. Non possono essere disattivati.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 rounded-xl border border-line bg-surface-raised p-3">
                <BarChart3 size={18} className="mt-0.5 shrink-0 text-gold" />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-semibold">Cookie statistici</p>
                    <button
                      type="button"
                      role="switch"
                      aria-checked={analyticsChoice}
                      aria-label="Attiva cookie statistici"
                      onClick={() => setAnalyticsChoice((v) => !v)}
                      className={`relative h-6 w-11 shrink-0 rounded-full transition ${
                        analyticsChoice ? "bg-primary" : "bg-line"
                      }`}
                    >
                      <span
                        className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition-all ${
                          analyticsChoice ? "left-[22px]" : "left-0.5"
                        }`}
                      />
                    </button>
                  </div>
                  <p className="mt-1 text-xs text-muted">
                    Ci aiuterebbero a capire in forma aggregata come viene usato il sito. Al
                    momento non sono attivi da parte nostra: puoi comunque salvare qui la tua
                    preferenza in vista di un loro eventuale utilizzo futuro.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-2 sm:flex-row-reverse">
              <button
                type="button"
                onClick={savePreferences}
                className="flex-1 rounded-xl bg-primary py-2.5 text-sm font-semibold text-white"
              >
                Salva preferenze
              </button>
              <button
                type="button"
                onClick={() => setView("banner")}
                className="flex-1 rounded-xl border border-line py-2.5 text-sm font-medium text-muted hover:text-white"
              >
                Indietro
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
