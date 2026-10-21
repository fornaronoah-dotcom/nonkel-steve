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

- `src/app/(site)/` — publieke pagina's: `/` (keyword *frituur Bredene*), `/menu` (*friet bestellen Bredene*), `/contact` (*Bie Nonkel Steve contact*), privacy- en cookiebeleid
- `src/app/admin/` — inzendingen, filterbaar op pagina, purpose en status (wachtwoord: `ADMIN_PASSWORD`)
- `src/lib/site.ts` — NAP, openingsuren, bestel-URL (Unipage)
- `src/lib/menu.ts` — menu en prijzen
- `src/components/logo.tsx`, `src/app/icon.tsx`, `src/app/apple-icon.tsx` — tijdelijk logo/favicon, vervangen zodra het logo binnen is

## Livegang

1. Vercel-project + Postgres (Neon via Marketplace), env vars uit `.env.example` zetten, `npx prisma db push` tegen de productie-DB
2. Resend: domein toevoegen, SPF/DKIM-records in Combell, `RESEND_FROM_EMAIL` aanpassen
3. Google Search Console: TXT-record in Combell, `/sitemap.xml` indienen
4. GA4-property aanmaken → `NEXT_PUBLIC_GA_MEASUREMENT_ID`
5. `NEXT_PUBLIC_SITE_URL` op het definitieve domein zetten
