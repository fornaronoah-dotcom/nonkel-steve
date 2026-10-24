# Bie Nonkel Steve — website

Next.js 16 · Tailwind v4 · Prisma 7 (PostgreSQL) · Resend · Vercel

## Lokaal

```bash
cp .env.example .env   # vul in
npm install
npx prisma db push
npm run dev
```

## Structuur

- `src/app/(site)/` — publieke pagina's: `/` (keyword *frituur Bredene*), `/menu` (*friet bestellen Bredene*, tevens de bestelpagina), `/contact` (*Bie Nonkel Steve contact*), `/afrekenen`, `/bestelling/[token]`, privacy, cookies, voorwaarden
- `src/app/admin/` — bestellingen, menubeheer, instellingen (pauzeren, leverzones, printer) en contactberichten (wachtwoord: `ADMIN_PASSWORD`)
- `src/lib/site.ts` — NAP en openingsuren (ook de basis voor de tijdslots)
- Menu, bestellingen, leverzones en instellingen staan in de database; startinhoud via `npx prisma db seed` (`prisma/seed-data.ts`)

## Online bestellen

1. Klant kiest op `/menu`, rekent af op `/afrekenen` (afhalen/leveren, tijdslot), betaalt via **Mollie**
2. Mollie-webhook (`/api/mollie/webhook`) zet de bestelling op betaald → bevestigingsmail (Resend) → printwachtrij
3. **Star CloudPRNT**-printer pollt `/api/cloudprnt/<PRINTER_KEY>` en print de bon (platte tekst, `src/lib/receipt.ts`)
4. Opvolging in `/admin/bestellingen` (status, opnieuw printen, annuleren + terugbetalen)

Lokaal zonder `MOLLIE_API_KEY` wordt de betaling gesimuleerd (enkel buiten productie).
- `src/components/logo.tsx`, `src/app/icon.tsx`, `src/app/apple-icon.tsx` — tijdelijk logo/favicon, vervangen zodra het logo binnen is

## Livegang

1. Vercel-project + Postgres (Neon via Marketplace), env vars uit `.env.example` zetten, `npx prisma db push` en `npx prisma db seed` tegen de productie-DB
2. Mollie-account (live key) koppelen; leverzones en bedragen nakijken in `/admin/instellingen`
3. Star CloudPRNT-printer instellen met de URL uit `/admin/instellingen`
4. Resend: domein toevoegen, SPF/DKIM-records in Combell, `RESEND_FROM_EMAIL` aanpassen
5. Google Search Console: TXT-record in Combell, `/sitemap.xml` indienen
6. GA4-property aanmaken → `NEXT_PUBLIC_GA_MEASUREMENT_ID`
7. `NEXT_PUBLIC_SITE_URL` op het definitieve domein zetten
