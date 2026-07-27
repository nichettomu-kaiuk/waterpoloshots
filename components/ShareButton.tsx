"use client";

import { useState } from "react";
import { createPortal } from "react-dom";
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
// only on navigator.share, which many desktop browsers don't support at all.
//
// IMPORTANT: each option is a real <a href> (not a window.open() call from a
// button's onClick). window.open() with width/height "window features" is
// meant for desktop popups; on mobile browsers it often fails to open a new
// tab at all and instead just tries (and fails) to resize the current one —
// which is exactly the "the sheet shifts but nothing happens" bug. Plain
// anchor tags let the browser/OS handle the share intent natively on every
// platform (e.g. iOS/Android hand wa.me and mailto: links straight to the
// WhatsApp and Mail apps when installed).
export default function ShareButton({ title, text, path, className, iconOnly }: ShareButtonProps) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  function getUrl() {
    if (typeof window === "undefined") return path;
    return `${window.location.origin}${path}`;
  }

  const url = getUrl();
  const shareText = text ?? title;
  const encodedUrl = encodeURIComponent(url);
  const encodedText = encodeURIComponent(shareText);
  const encodedTextWithUrl = encodeURIComponent(`${shareText}\n${url}`);

  const options = [
    {
      name: "WhatsApp",
      icon: MessageCircle,
      color: "#25D366",
      href: `https://wa.me/?text=${encodedTextWithUrl}`,
      external: true,
    },
    {
      name: "Facebook",
      icon: Facebook,
      color: "#1877F2",
      href: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
      external: true,
    },
    {
      name: "X",
      icon: Twitter,
      color: "#000000",
      href: `https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedUrl}`,
      external: true,
    },
    {
      name: "Telegram",
      icon: Send,
      color: "#26A5E4",
      href: `https://t.me/share/url?url=${encodedUrl}&text=${encodedText}`,
      external: true,
    },
    {
      name: "Email",
      icon: Mail,
      color: "#6b6b73",
      href: `mailto:?subject=${encodeURIComponent(title)}&body=${encodedTextWithUrl}`,
      external: false,
    },
  ];

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(url);
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

      {open &&
        createPortal(
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
                {options.map(({ name, icon: Icon, color, href, external }) => (
                  <a
                    key={name}
                    href={href}
                    target={external ? "_blank" : undefined}
                    rel={external ? "noopener noreferrer" : undefined}
                    onClick={() => setOpen(false)}
                    className="flex flex-col items-center gap-2"
                  >
                    <span
                      className="flex h-12 w-12 items-center justify-center rounded-full"
                      style={{ backgroundColor: color }}
                    >
                      <Icon size={22} className="text-white" />
                    </span>
                    <span className="text-[11px] text-muted">{name}</span>
                  </a>
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
          </div>,
          document.body
        )}
    </>
  );
}
