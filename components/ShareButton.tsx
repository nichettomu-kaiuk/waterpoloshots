"use client";

import { useState } from "react";
import {
  Share2,
  X,
  Link as LinkIcon,
  Check,
  MessageCircle,
  Facebook,
  Twitter,
  Send,
  Mail,
} from "lucide-react";

interface ShareButtonProps {
  title: string;
  text?: string;
  path: string; // relative path, e.g. "/news/123"
  className?: string;
  iconOnly?: boolean;
}

// Opens a bottom-sheet with direct share links (WhatsApp, Facebook, X,
// Telegram, Email) plus a "copy link" fallback — used instead of relying
// only on navigator.share, which many desktop browsers don't support at all
// and silently falls back to clipboard-only behavior.
export default function ShareButton({ title, text, path, className, iconOnly }: ShareButtonProps) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  function getUrl() {
    if (typeof window === "undefined") return path;
    return `${window.location.origin}${path}`;
  }

  const shareText = text ?? title;

  function openWindow(url: string) {
    window.open(url, "_blank", "noopener,noreferrer,width=600,height=500");
  }

  const options = [
    {
      name: "WhatsApp",
      icon: MessageCircle,
      color: "#25D366",
      action: () =>
        openWindow(`https://wa.me/?text=${encodeURIComponent(`${shareText}\n${getUrl()}`)}`),
    },
    {
      name: "Facebook",
      icon: Facebook,
      color: "#1877F2",
      action: () =>
        openWindow(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(getUrl())}`),
    },
    {
      name: "X",
      icon: Twitter,
      color: "#000000",
      action: () =>
        openWindow(
          `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(getUrl())}`
        ),
    },
    {
      name: "Telegram",
      icon: Send,
      color: "#26A5E4",
      action: () =>
        openWindow(
          `https://t.me/share/url?url=${encodeURIComponent(getUrl())}&text=${encodeURIComponent(shareText)}`
        ),
    },
    {
      name: "Email",
      icon: Mail,
      color: "#6b6b73",
      action: () => {
        window.location.href = `mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(`${shareText}\n${getUrl()}`)}`;
      },
    },
  ];

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(getUrl());
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      // clipboard unavailable, ignore silently
    }
  }

  return (
    <>
      <button
        onClick={(e) => {
          e.stopPropagation();
          setOpen(true);
        }}
        className={
          className ??
          "flex items-center gap-1 rounded-full border border-line px-2 py-1 text-[11px] text-muted transition hover:border-gold hover:text-gold"
        }
        aria-label="Condividi"
      >
        <Share2 size={13} />
        {!iconOnly && "Condividi"}
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/70"
          onClick={(e) => {
            e.stopPropagation();
            setOpen(false);
          }}
        >
          <div
            className="w-full max-w-md animate-rise rounded-t-3xl border-t border-line bg-surface p-6 pb-8"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-5 flex items-center justify-between">
              <p className="font-display text-base font-bold">Condividi</p>
              <button
                onClick={() => setOpen(false)}
                className="text-muted hover:text-white"
                aria-label="Chiudi"
              >
                <X size={20} />
              </button>
            </div>

            <div className="grid grid-cols-4 gap-4">
              {options.map(({ name, icon: Icon, color, action }) => (
                <button
                  key={name}
                  onClick={() => {
                    action();
                    setOpen(false);
                  }}
                  className="flex flex-col items-center gap-2"
                >
                  <span
                    className="flex h-12 w-12 items-center justify-center rounded-full"
                    style={{ backgroundColor: color }}
                  >
                    <Icon size={22} className="text-white" />
                  </span>
                  <span className="text-[11px] text-muted">{name}</span>
                </button>
              ))}
            </div>

            <button
              onClick={handleCopy}
              className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl border border-line py-2.5 text-sm text-muted transition hover:border-gold hover:text-white"
            >
              {copied ? <Check size={15} className="text-gold" /> : <LinkIcon size={15} />}
              {copied ? "Link copiato!" : "Copia link"}
            </button>
          </div>
        </div>
      )}
    </>
  );
}
