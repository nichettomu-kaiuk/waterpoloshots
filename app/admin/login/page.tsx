"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Lock } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export default function AdminLoginPage() {
  const router = useRouter();
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
    router.push("/admin");
    router.refresh();
  }

  return (
    <main className="flex min-h-[80vh] flex-col justify-center px-6">
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
    </main>
  );
}
