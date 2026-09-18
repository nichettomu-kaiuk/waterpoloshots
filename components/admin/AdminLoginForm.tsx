"use client";

import { useState } from "react";
import { Lock } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

// Just the interactive part of the login page (form state + submit) — split
// out so app/admin/login/page.tsx can be a Server Component and render the
// Hero (which needs to run server-side to fetch a championship's branding)
// above it.
export default function AdminLoginForm() {
  const supabase = createClient();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) {
      setError("Credenziali non valide. Riprova.");
      return;
    }
    // Hard navigation (not router.push + router.refresh): a client-side
    // soft navigation right here can reach the /admin middleware check
    // before the just-set auth cookie is visible to it, which bounced back
    // to this very login page — a full page load always sees the
    // up-to-date cookie.
    window.location.href = "/admin";
  }

  return (
    <div className="mx-auto w-full max-w-sm px-6">
      <div className="mx-auto mb-6 flex h-12 w-12 items-center justify-center rounded-full bg-primary/15 text-primary">
        <Lock size={22} />
      </div>
      <h1 className="mb-1 text-center font-display text-2xl font-bold">Accesso Admin</h1>
      <p className="mb-8 text-center text-sm text-muted">Gestisci il torneo con le tue credenziali.</p>

      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <label className="mb-1 block text-xs text-muted">Email</label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-xl border border-line bg-surface px-3 py-2.5 text-sm outline-none focus:border-primary"
            placeholder="admin@torneo.it"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs text-muted">Password</label>
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-xl border border-line bg-surface px-3 py-2.5 text-sm outline-none focus:border-primary"
            placeholder="••••••••"
          />
        </div>
        {error && <p className="text-xs text-primary">{error}</p>}
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-xl bg-primary py-2.5 text-sm font-semibold tracking-wide text-white transition active:scale-[0.99] disabled:opacity-60"
        >
          {loading ? "Accesso in corso..." : "Accedi"}
        </button>
      </form>
    </div>
  );
}
