"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Plus, Trash2, Upload, Pencil, X, AlertTriangle } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import type { NewsPost } from "@/lib/supabase/types";

const emptyForm = { title: "", content: "" };

export default function AdminNewsPage() {
  const supabase = createClient();
  const [posts, setPosts] = useState<NewsPost[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Every Supabase call below surfaces its error instead of failing
  // silently — if the `news_posts` table doesn't exist yet (schema.sql not
  // applied) or RLS blocks the write, you'll see exactly why here instead
  // of a post that "looks" published but never actually saved.
  async function load() {
    setLoading(true);
    const { data, error } = await supabase
      .from("news_posts")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) {
      setError(`Impossibile caricare le news: ${error.message}`);
    } else {
      setError(null);
      setPosts(data ?? []);
    }
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  function startEdit(post: NewsPost) {
    setEditingId(post.id);
    setForm({ title: post.title, content: post.content });
    setImageFile(null);
    setError(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function cancelEdit() {
    setEditingId(null);
    setForm(emptyForm);
    setImageFile(null);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.title.trim() || !form.content.trim()) return;
    setSaving(true);
    setError(null);

    let image_url: string | null | undefined = undefined;
    if (imageFile) {
      const path = `news/${Date.now()}-${imageFile.name}`;
      const { error: uploadError } = await supabase.storage.from("branding").upload(path, imageFile);
      if (uploadError) {
        setError(`Caricamento immagine fallito: ${uploadError.message}`);
        setSaving(false);
        return;
      }
      image_url = supabase.storage.from("branding").getPublicUrl(path).data.publicUrl;
    }

    if (editingId) {
      const { error: updateError } = await supabase
        .from("news_posts")
        .update({
          title: form.title.trim(),
          content: form.content.trim(),
          ...(image_url !== undefined ? { image_url } : {}),
        })
        .eq("id", editingId);
      if (updateError) {
        setError(`Salvataggio fallito: ${updateError.message}`);
        setSaving(false);
        return;
      }
    } else {
      const { error: insertError } = await supabase.from("news_posts").insert({
        title: form.title.trim(),
        content: form.content.trim(),
        image_url: image_url ?? null,
      });
      if (insertError) {
        setError(
          insertError.message.includes("does not exist") || insertError.code === "42P01"
            ? "La tabella \"news_posts\" non esiste ancora sul tuo progetto Supabase. Esegui la sezione news_posts di supabase/schema.sql nell'SQL Editor, poi riprova."
            : `Pubblicazione fallita: ${insertError.message}`
        );
        setSaving(false);
        return;
      }
    }

    cancelEdit();
    setSaving(false);
    load();
  }

  async function handleDelete(id: string) {
    if (!confirm("Eliminare questo post?")) return;
    const { error: deleteError } = await supabase.from("news_posts").delete().eq("id", id);
    if (deleteError) {
      setError(`Eliminazione fallita: ${deleteError.message}`);
      return;
    }
    if (editingId === id) cancelEdit();
    load();
  }

  return (
    <div>
      <h2 className="mb-4 font-display text-lg font-bold">News</h2>

      {error && (
        <div className="mb-4 flex items-start gap-2 rounded-xl border border-primary/40 bg-primary/10 px-3 py-2.5 text-xs text-primary">
          <AlertTriangle size={14} className="mt-0.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="mb-6 max-w-xl space-y-2 rounded-2xl border border-line bg-surface p-4">
        {editingId && (
          <div className="mb-1 flex items-center justify-between text-xs text-gold">
            <span>Modifica post</span>
            <button type="button" onClick={cancelEdit} className="flex items-center gap-1 text-muted hover:text-white">
              <X size={13} /> Annulla
            </button>
          </div>
        )}
        <input
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
          placeholder="Titolo"
          className="w-full rounded-xl border border-line bg-surface-raised px-3 py-2 text-sm outline-none focus:border-primary"
        />
        <textarea
          value={form.content}
          onChange={(e) => setForm({ ...form, content: e.target.value })}
          placeholder="Testo del post..."
          rows={4}
          className="w-full resize-none rounded-xl border border-line bg-surface-raised px-3 py-2 text-sm outline-none focus:border-primary"
        />
        <label className="flex cursor-pointer items-center gap-2 rounded-xl border border-dashed border-line px-3 py-2 text-xs text-muted">
          <Upload size={14} />
          {imageFile ? imageFile.name : "Carica immagine (opzionale)"}
          <input type="file" accept="image/*" className="hidden" onChange={(e) => setImageFile(e.target.files?.[0] ?? null)} />
        </label>
        <button
          type="submit"
          disabled={saving}
          className="flex w-full items-center justify-center gap-1.5 rounded-xl bg-primary py-2 text-sm font-semibold text-white disabled:opacity-60"
        >
          <Plus size={15} /> {saving ? "Salvataggio..." : editingId ? "Salva modifiche" : "Pubblica post"}
        </button>
      </form>

      {loading ? (
        <p className="text-sm text-muted">Caricamento...</p>
      ) : posts.length === 0 ? (
        <p className="text-sm text-muted">Nessun post pubblicato ancora.</p>
      ) : (
        <div className="grid grid-cols-1 gap-2 lg:grid-cols-2 xl:grid-cols-3">
          {posts.map((p) => (
            <div key={p.id} className="rounded-xl border border-line bg-surface p-3">
              <div className="flex gap-3">
                {p.image_url ? (
                  <Image src={p.image_url} alt={p.title} width={56} height={56} className="h-14 w-14 shrink-0 rounded-lg object-cover" />
                ) : (
                  <div className="h-14 w-14 shrink-0 rounded-lg bg-surface-raised" />
                )}
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{p.title}</p>
                  <p className="line-clamp-2 text-[11px] text-muted">{p.content}</p>
                  <p className="mt-1 text-[10px] text-muted">
                    {new Date(p.created_at).toLocaleDateString("it-IT", { day: "2-digit", month: "short", year: "numeric" })}
                  </p>
                </div>
              </div>
              <div className="mt-3 flex gap-2">
                <button
                  onClick={() => startEdit(p)}
                  className="flex flex-1 items-center justify-center gap-1 rounded-full border border-line py-1.5 text-[11px] text-muted hover:border-primary hover:text-white"
                >
                  <Pencil size={12} /> Modifica
                </button>
                <button
                  onClick={() => handleDelete(p.id)}
                  className="flex flex-1 items-center justify-center gap-1 rounded-full border border-line py-1.5 text-[11px] text-muted hover:border-primary hover:text-primary"
                >
                  <Trash2 size={12} /> Elimina
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
