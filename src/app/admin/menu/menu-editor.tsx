"use client";

import { useState, useTransition } from "react";
import { ArrowDown, ArrowUp, Eye, EyeOff, Pencil, Plus, Trash2 } from "lucide-react";
import {
  deleteProduct,
  moveCategory,
  moveProduct,
  saveCategory,
  saveProduct,
  toggleProduct,
} from "@/app/actions/shop";
import { euro } from "@/lib/money";

interface Product {
  id: string;
  name: string;
  description: string | null;
  price: number;
  active: boolean;
  available: boolean;
}

interface Category {
  id: string;
  name: string;
  intro: string;
  active: boolean;
  products: Product[];
}

type Result = { success: boolean; error?: string };

const field = "w-full rounded-lg border-2 border-coal/15 bg-white px-3 py-2 outline-none focus:border-bronze";
const iconBtn = "grid size-8 place-items-center rounded-full text-ink/60 hover:bg-sand hover:text-coal disabled:opacity-30";

function useAction() {
  const [pending, start] = useTransition();
  const [error, setError] = useState("");
  const run = (fn: () => Promise<Result>, onOk?: () => void) =>
    start(async () => {
      setError("");
      const r = await fn();
      if (r.success) onOk?.();
      else setError(r.error ?? "Mislukt");
    });
  return { pending, error, run };
}

function ProductForm({
  categoryId,
  product,
  onDone,
}: {
  categoryId: string;
  product?: Product;
  onDone: () => void;
}) {
  const { pending, error, run } = useAction();
  return (
    <form
      className="grid gap-2 rounded-xl bg-sand/60 p-3 sm:grid-cols-[1fr_7rem]"
      onSubmit={(e) => {
        e.preventDefault();
        const f = new FormData(e.currentTarget);
        run(
          () =>
            saveProduct({
              id: product?.id,
              categoryId,
              name: String(f.get("name")),
              description: String(f.get("description")),
              price: String(f.get("price")),
            }),
          onDone,
        );
      }}
    >
      <input name="name" defaultValue={product?.name} placeholder="Naam" required className={field} autoFocus />
      <input
        name="price"
        defaultValue={product ? (product.price / 100).toFixed(2).replace(".", ",") : ""}
        placeholder="Prijs"
        inputMode="decimal"
        required
        className={field}
        aria-label="Prijs in euro"
      />
      <input
        name="description"
        defaultValue={product?.description ?? ""}
        placeholder="Omschrijving (optioneel)"
        className={`${field} sm:col-span-2`}
      />
      {error && <p className="text-sm font-semibold text-ketchup sm:col-span-2">{error}</p>}
      <div className="flex gap-2 sm:col-span-2">
        <button type="submit" disabled={pending} className="rounded-full bg-coal px-4 py-1.5 text-sm font-bold text-gold">
          Opslaan
        </button>
        <button type="button" onClick={onDone} className="rounded-full px-4 py-1.5 text-sm font-semibold ring-1 ring-coal/20">
          Annuleren
        </button>
      </div>
    </form>
  );
}

function ProductRow({ p, categoryId, first, last }: { p: Product; categoryId: string; first: boolean; last: boolean }) {
  const [editing, setEditing] = useState(false);
  const { pending, error, run } = useAction();

  if (editing) return <ProductForm categoryId={categoryId} product={p} onDone={() => setEditing(false)} />;

  return (
    <li className={`flex flex-wrap items-center gap-x-3 gap-y-1 py-2 ${p.active ? "" : "opacity-50"}`}>
      <div className="flex flex-col">
        <button type="button" aria-label="Omhoog" disabled={first || pending} onClick={() => run(() => moveProduct(p.id, -1))} className={iconBtn}>
          <ArrowUp className="size-3.5" />
        </button>
        <button type="button" aria-label="Omlaag" disabled={last || pending} onClick={() => run(() => moveProduct(p.id, 1))} className={iconBtn}>
          <ArrowDown className="size-3.5" />
        </button>
      </div>
      <div className="min-w-0 flex-1">
        <p className="font-semibold text-coal">
          {p.name} {!p.active && <span className="text-xs font-normal">(verborgen)</span>}
        </p>
        {p.description && <p className="truncate text-sm text-ink/60">{p.description}</p>}
      </div>
      <span className="w-16 text-right font-semibold tabular-nums">{euro(p.price)}</span>
      <label className="flex cursor-pointer items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={p.available}
          disabled={pending}
          onChange={(e) => run(() => toggleProduct(p.id, "available", e.target.checked))}
          className="peer sr-only"
        />
        <span className="relative h-6 w-11 rounded-full bg-ketchup/70 transition peer-checked:bg-emerald-500 peer-focus-visible:ring-2 peer-focus-visible:ring-gold after:absolute after:left-0.5 after:top-0.5 after:size-5 after:rounded-full after:bg-white after:transition peer-checked:after:translate-x-5" />
        <span className="w-20">{p.available ? "Beschikbaar" : "Uitverkocht"}</span>
      </label>
      <div className="flex">
        <button
          type="button"
          aria-label={p.active ? "Verbergen op de site" : "Tonen op de site"}
          title={p.active ? "Verbergen op de site" : "Tonen op de site"}
          disabled={pending}
          onClick={() => run(() => toggleProduct(p.id, "active", !p.active))}
          className={iconBtn}
        >
          {p.active ? <Eye className="size-4" /> : <EyeOff className="size-4" />}
        </button>
        <button type="button" aria-label="Bewerken" title="Bewerken" onClick={() => setEditing(true)} className={iconBtn}>
          <Pencil className="size-4" />
        </button>
        <button
          type="button"
          aria-label="Verwijderen"
          title="Verwijderen"
          disabled={pending}
          onClick={() => window.confirm(`${p.name} definitief verwijderen?`) && run(() => deleteProduct(p.id))}
          className={`${iconBtn} hover:!text-ketchup`}
        >
          <Trash2 className="size-4" />
        </button>
      </div>
      {error && <p className="w-full text-sm font-semibold text-ketchup">{error}</p>}
    </li>
  );
}

function CategoryCard({ c, first, last }: { c: Category; first: boolean; last: boolean }) {
  const [adding, setAdding] = useState(false);
  const [editing, setEditing] = useState(false);
  const { pending, error, run } = useAction();

  return (
    <section id={`cat-${c.id}`} className={`rounded-2xl bg-white p-5 shadow-sm ring-1 ring-coal/5 ${c.active ? "" : "opacity-60"}`}>
      <header className="flex flex-wrap items-center gap-3">
        {editing ? (
          <form
            className="flex flex-1 flex-wrap gap-2"
            onSubmit={(e) => {
              e.preventDefault();
              const f = new FormData(e.currentTarget);
              run(() => saveCategory({ id: c.id, name: String(f.get("name")), intro: String(f.get("intro")) }), () => setEditing(false));
            }}
          >
            <input name="name" defaultValue={c.name} required className={`${field} max-w-xs`} />
            <input name="intro" defaultValue={c.intro} placeholder="Korte intro" className={`${field} min-w-60 flex-1`} />
            <button type="submit" className="rounded-full bg-coal px-4 py-1.5 text-sm font-bold text-gold">
              Opslaan
            </button>
          </form>
        ) : (
          <div className="flex-1">
            <h2 className="font-display text-2xl text-coal">
              {c.name} <span className="font-sans text-sm font-normal text-ink/50">({c.products.length})</span>
            </h2>
            {c.intro && <p className="text-sm text-ink/60">{c.intro}</p>}
          </div>
        )}
        <div className="flex items-center">
          <button type="button" aria-label="Categorie omhoog" disabled={first || pending} onClick={() => run(() => moveCategory(c.id, -1))} className={iconBtn}>
            <ArrowUp className="size-4" />
          </button>
          <button type="button" aria-label="Categorie omlaag" disabled={last || pending} onClick={() => run(() => moveCategory(c.id, 1))} className={iconBtn}>
            <ArrowDown className="size-4" />
          </button>
          <button
            type="button"
            aria-label={c.active ? "Categorie verbergen" : "Categorie tonen"}
            disabled={pending}
            onClick={() => run(() => saveCategory({ id: c.id, name: c.name, intro: c.intro, active: !c.active }))}
            className={iconBtn}
          >
            {c.active ? <Eye className="size-4" /> : <EyeOff className="size-4" />}
          </button>
          <button type="button" aria-label="Categorie bewerken" onClick={() => setEditing((v) => !v)} className={iconBtn}>
            <Pencil className="size-4" />
          </button>
        </div>
      </header>
      {error && <p className="mt-2 text-sm font-semibold text-ketchup">{error}</p>}

      <ul className="mt-3 divide-y divide-coal/10">
        {c.products.map((p, i) => (
          <ProductRow key={p.id} p={p} categoryId={c.id} first={i === 0} last={i === c.products.length - 1} />
        ))}
      </ul>

      <div className="mt-3">
        {adding ? (
          <ProductForm categoryId={c.id} onDone={() => setAdding(false)} />
        ) : (
          <button
            type="button"
            onClick={() => setAdding(true)}
            className="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-semibold text-bronze ring-1 ring-gold hover:bg-gold/20"
          >
            <Plus className="size-4" /> Product toevoegen
          </button>
        )}
      </div>
    </section>
  );
}

export function MenuEditor({ categories }: { categories: Category[] }) {
  const [query, setQuery] = useState("");
  const { pending, error, run } = useAction();
  const q = query.trim().toLowerCase();
  const shown = q
    ? categories
        .map((c) => ({ ...c, products: c.products.filter((p) => p.name.toLowerCase().includes(q)) }))
        .filter((c) => c.products.length)
    : categories;
  const soldOut = categories.flatMap((c) => c.products).filter((p) => !p.available);

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-4xl text-coal">Menu</h1>
          <p className="mt-1 text-ink/60">
            Wijzigingen staan meteen online. {soldOut.length > 0 && `${soldOut.length} product(en) uitverkocht.`}
          </p>
        </div>
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Zoek product…"
          className={`${field} max-w-xs`}
        />
      </header>

      <nav className="mt-6 flex flex-wrap gap-2" aria-label="Categorieën">
        {categories.map((c) => (
          <a key={c.id} href={`#cat-${c.id}`} className="rounded-full bg-white px-3 py-1.5 text-sm font-semibold ring-1 ring-coal/15 hover:bg-sand">
            {c.name}
          </a>
        ))}
      </nav>

      <div className="mt-6 space-y-5">
        {shown.map((c, i) => (
          <CategoryCard key={c.id} c={c} first={i === 0} last={i === shown.length - 1} />
        ))}
      </div>

      <form
        className="mt-8 flex flex-wrap gap-2 rounded-2xl bg-white p-5 shadow-sm"
        onSubmit={(e) => {
          e.preventDefault();
          const form = e.currentTarget;
          const f = new FormData(form);
          run(() => saveCategory({ name: String(f.get("name")), intro: "" }), () => form.reset());
        }}
      >
        <input name="name" placeholder="Nieuwe categorie, bv. Desserts" required className={`${field} max-w-xs`} />
        <button type="submit" disabled={pending} className="rounded-full bg-coal px-4 py-2 text-sm font-bold text-gold">
          Categorie toevoegen
        </button>
        {error && <p className="w-full text-sm font-semibold text-ketchup">{error}</p>}
      </form>
    </div>
  );
}
