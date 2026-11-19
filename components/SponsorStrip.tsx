import Image from "next/image";
import Link from "next/link";

// Spazio sponsor della home. L'intero blocco sparisce quando l'elenco è
// vuoto, quindi in assenza di sponsor la pagina si richiude senza lasciare
// buchi. Per aggiungerne uno basta una riga qui: nessuna migrazione DB.
type Sponsor = { name: string; logo_url: string; href?: string };

const SPONSORS: Sponsor[] = [
  // { name: "Nome sponsor", logo_url: "https://.../logo.png", href: "https://..." },
];

export default function SponsorStrip() {
  if (SPONSORS.length === 0) return null;

  return (
    <section className="site-card my-4 rounded-2xl border border-line bg-surface p-4">
      <p className="mb-3 text-[11px] uppercase tracking-[0.14em] text-muted">Con il sostegno di</p>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {SPONSORS.map((s) => {
          const logo = (
            <Image
              src={s.logo_url}
              alt={s.name}
              width={160}
              height={64}
              className="h-16 w-full rounded-md bg-white object-contain p-2"
            />
          );
          return s.href ? (
            <Link key={s.name} href={s.href} target="_blank" rel="noopener noreferrer">
              {logo}
            </Link>
          ) : (
            <div key={s.name}>{logo}</div>
          );
        })}
      </div>
    </section>
  );
}
