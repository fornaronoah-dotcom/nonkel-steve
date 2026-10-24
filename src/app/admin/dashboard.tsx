"use client";

import { useMemo, useState, useTransition } from "react";
import { updateStatus, updateNotes, deleteSubmission } from "@/app/actions/admin";
import { STATUSES, STATUS_LABELS } from "@/lib/status";

interface Submission {
  id: string;
  naam: string;
  email: string;
  telefoon: string | null;
  bericht: string | null;
  page: string;
  purpose: string;
  status: string;
  notes: string | null;
  createdAt: Date;
}

const PAGE_LABELS: Record<string, string> = {
  homepage: "Homepage",
  menu: "Menu",
  contact: "Contactpagina",
};

const PURPOSE_LABELS: Record<string, string> = {
  contact: "Contact",
  service: "Service",
};

const STATUS_STYLES: Record<string, string> = {
  nieuw: "bg-gold/30 text-coal",
  beantwoord: "bg-bronze/15 text-bronze",
  afgehandeld: "bg-emerald-100 text-emerald-800",
};

const label = (map: Record<string, string>, v: string) => map[v] ?? v.charAt(0).toUpperCase() + v.slice(1);

function fmtDate(d: Date) {
  return new Date(d).toLocaleString("nl-BE", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/* ---------- CSV ---------- */

function csvCell(v: string | null | undefined) {
  const s = v == null ? "" : String(v);
  return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

function downloadCSV(rows: Submission[]) {
  const headers = ["Datum", "Naam", "Email", "Telefoon", "Pagina", "Purpose", "Status", "Bericht", "Notities"];
  const lines = [headers.join(",")];
  for (const s of rows) {
    lines.push(
      [fmtDate(s.createdAt), s.naam, s.email, s.telefoon, s.page, s.purpose, s.status, s.bericht, s.notes]
        .map(csvCell)
        .join(","),
    );
  }
  // BOM zodat Excel é/ë correct toont.
  const blob = new Blob(["﻿" + lines.join("\r\n")], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "nonkel-steve-inzendingen.csv";
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

/* ---------- Rij ---------- */

function SubmissionRow({ s, open, onToggle }: { s: Submission; open: boolean; onToggle: () => void }) {
  const [isPending, startTransition] = useTransition();
  const [notes, setNotes] = useState(s.notes ?? "");
  const [saved, setSaved] = useState(false);

  const changeStatus = (status: string) => startTransition(async () => void (await updateStatus(s.id, status)));

  const saveNotes = () =>
    startTransition(async () => {
      await updateNotes(s.id, notes);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    });

  const remove = () => {
    if (!window.confirm("Weet je zeker dat je deze inzending wilt verwijderen?")) return;
    startTransition(async () => void (await deleteSubmission(s.id)));
  };

  return (
    <div className="rounded-2xl bg-white shadow-sm ring-1 ring-coal/5">
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={open}
        className="grid w-full grid-cols-[1fr_auto] items-center gap-x-4 gap-y-1 p-4 text-left md:grid-cols-[150px_1fr_1fr_120px_110px_20px]"
      >
        <span className="text-sm text-ink/60 md:order-none">{fmtDate(s.createdAt)}</span>
        <span className="font-semibold text-coal">{s.naam}</span>
        <span className="hidden truncate text-ink/70 md:block">{s.email}</span>
        <span className="text-sm text-ink/70">
          {label(PAGE_LABELS, s.page)} · {label(PURPOSE_LABELS, s.purpose)}
        </span>
        <span className={`justify-self-start rounded-full px-2.5 py-1 text-xs font-bold ${STATUS_STYLES[s.status] ?? "bg-gray-100"}`}>
          {STATUS_LABELS[s.status] ?? s.status}
        </span>
        <span className="hidden text-xl text-ink/50 md:block" aria-hidden="true">
          {open ? "−" : "+"}
        </span>
      </button>

      {open && (
        <div className="space-y-5 border-t border-coal/10 p-4">
          <dl className="grid gap-3 text-sm sm:grid-cols-3">
            <div>
              <dt className="font-semibold text-ink/60">E-mail</dt>
              <dd className="break-all">{s.email}</dd>
            </div>
            {s.telefoon && (
              <div>
                <dt className="font-semibold text-ink/60">Telefoon</dt>
                <dd>{s.telefoon}</dd>
              </div>
            )}
            <div>
              <dt className="font-semibold text-ink/60">Via</dt>
              <dd>
                {label(PAGE_LABELS, s.page)} · {label(PURPOSE_LABELS, s.purpose)}
              </dd>
            </div>
          </dl>

          {s.bericht && (
            <div>
              <p className="text-sm font-semibold text-ink/60">Bericht</p>
              <p className="mt-1 whitespace-pre-wrap">{s.bericht}</p>
            </div>
          )}

          <div>
            <p className="text-sm font-semibold text-ink/60">Status</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {STATUSES.map((st) => (
                <button
                  key={st}
                  type="button"
                  disabled={isPending}
                  onClick={() => changeStatus(st)}
                  className={`rounded-full px-3 py-1.5 text-sm font-semibold ring-1 ring-coal/15 ${s.status === st ? "bg-coal text-white" : "bg-white text-coal hover:bg-sand"}`}
                >
                  {STATUS_LABELS[st]}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label htmlFor={`notes-${s.id}`} className="text-sm font-semibold text-ink/60">
              Interne notities
            </label>
            <textarea
              id={`notes-${s.id}`}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              placeholder="Opmerkingen voor jezelf…"
              className="mt-1 w-full rounded-xl border-2 border-coal/15 px-3 py-2 outline-none focus:border-bronze"
            />
            <div className="mt-2 flex items-center gap-3">
              <button type="button" disabled={isPending} onClick={saveNotes} className="rounded-full bg-coal px-4 py-2 text-sm font-semibold text-white">
                Opslaan
              </button>
              {saved && <span className="text-sm text-emerald-700">Opgeslagen ✓</span>}
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-coal/10 pt-4">
            <a href={`mailto:${s.email}`} className="rounded-full bg-gold px-4 py-2 text-sm font-bold text-coal">
              Beantwoorden per mail →
            </a>
            <button type="button" disabled={isPending} onClick={remove} className="text-sm font-semibold text-ketchup hover:underline">
              Verwijderen
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

/* ---------- Dashboard ---------- */

function FilterGroup({
  title,
  value,
  onChange,
  options,
}: {
  title: string;
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string; count: number }[];
}) {
  return (
    <div>
      <p className="text-xs font-bold uppercase tracking-wider text-ink/50">{title}</p>
      <div className="mt-2 flex flex-wrap gap-2">
        {options.map((o) => (
          <button
            key={o.value}
            type="button"
            onClick={() => onChange(o.value)}
            className={`rounded-full px-3 py-1.5 text-sm font-semibold ring-1 ring-coal/15 ${value === o.value ? "bg-coal text-white" : "bg-white text-coal hover:bg-sand"}`}
          >
            {o.label} <span className="opacity-60">{o.count}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

function countBy(rows: Submission[], key: "page" | "purpose" | "status") {
  const counts = new Map<string, number>();
  for (const r of rows) counts.set(r[key], (counts.get(r[key]) ?? 0) + 1);
  return counts;
}

export function AdminDashboard({ submissions, dbError }: { submissions: Submission[]; dbError: boolean }) {
  const [filterPage, setFilterPage] = useState("all");
  const [filterPurpose, setFilterPurpose] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [openId, setOpenId] = useState<string | null>(null);

  const filters = useMemo(() => {
    const build = (key: "page" | "purpose" | "status", labels: Record<string, string>, extra: string[] = []) => {
      const counts = countBy(submissions, key);
      const values = [...new Set([...extra, ...counts.keys()])];
      return [
        { value: "all", label: "Alle", count: submissions.length },
        ...values.map((v) => ({ value: v, label: label(labels, v), count: counts.get(v) ?? 0 })),
      ];
    };
    return {
      page: build("page", PAGE_LABELS, Object.keys(PAGE_LABELS)),
      purpose: build("purpose", PURPOSE_LABELS, Object.keys(PURPOSE_LABELS)),
      status: build("status", STATUS_LABELS, [...STATUSES]),
    };
  }, [submissions]);

  const filtered = submissions.filter(
    (s) =>
      (filterPage === "all" || s.page === filterPage) &&
      (filterPurpose === "all" || s.purpose === filterPurpose) &&
      (filterStatus === "all" || s.status === filterStatus),
  );

  const nieuw = submissions.filter((s) => s.status === "nieuw").length;

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-sm font-bold uppercase tracking-wider text-bronze">Bie Nonkel Steve · Admin</p>
          <h1 className="font-display mt-1 text-4xl text-coal">Berichten</h1>
          <p className="mt-1 text-ink/60">
            {filtered.length} van {submissions.length} · {nieuw} nieuw
          </p>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            disabled={filtered.length === 0}
            onClick={() => downloadCSV(filtered)}
            className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-coal ring-1 ring-coal/15 disabled:opacity-40"
          >
            Exporteer CSV
          </button>
        </div>
      </header>

      {dbError && (
        <div className="mt-6 rounded-2xl bg-ketchup/10 p-4 text-ketchup">
          Database-verbinding mislukt. Controleer <code>DATABASE_URL</code> en draai <code>npx prisma db push</code>.
        </div>
      )}

      <div className="mt-8 grid gap-5 rounded-2xl bg-white p-5 shadow-sm ring-1 ring-coal/5 md:grid-cols-3">
        <FilterGroup title="Pagina" value={filterPage} onChange={setFilterPage} options={filters.page} />
        <FilterGroup title="Purpose" value={filterPurpose} onChange={setFilterPurpose} options={filters.purpose} />
        <FilterGroup title="Status" value={filterStatus} onChange={setFilterStatus} options={filters.status} />
      </div>

      <div className="mt-6 space-y-3">
        {filtered.length === 0 ? (
          <p className="rounded-2xl bg-white p-10 text-center text-ink/60">
            {dbError ? "Database niet verbonden." : "Geen inzendingen gevonden."}
          </p>
        ) : (
          filtered.map((s) => (
            <SubmissionRow key={s.id} s={s} open={openId === s.id} onToggle={() => setOpenId(openId === s.id ? null : s.id)} />
          ))
        )}
      </div>
    </div>
  );
}
