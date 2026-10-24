import { timingSafeEqual } from "node:crypto";
import { prisma } from "@/lib/prisma";
import { renderReceipt } from "@/lib/receipt";

/*
 * Star CloudPRNT: de bonprinter pollt deze URL zelf.
 *   POST   → "is er een job?"            → { jobReady, mediaTypes, jobToken }
 *   GET    → haal de job op (text/plain)  → de bon
 *   DELETE → bevestiging (code=200 OK)    → job afgerond
 * Configureer in de printer: https://<domein>/api/cloudprnt/<PRINTER_KEY>
 */

export const dynamic = "force-dynamic";

/** Een job die "bezig" blijft (printer viel weg) komt na 2 min terug in de wachtrij. */
const STALE_MS = 2 * 60_000;

function authorized(key: string) {
  const expected = process.env.PRINTER_KEY;
  if (!expected) return false;
  const a = Buffer.from(key);
  const b = Buffer.from(expected);
  return a.length === b.length && timingSafeEqual(a, b);
}

async function nextJob() {
  await prisma.order.updateMany({
    where: { printStatus: "bezig", printedAt: null, paidAt: { lt: new Date(Date.now() - STALE_MS) } },
    data: { printStatus: "wachtrij" },
  });
  return prisma.order.findFirst({
    where: { printStatus: { in: ["wachtrij", "bezig"] } },
    orderBy: { paidAt: "asc" },
    include: { items: true },
  });
}

type Params = { params: Promise<{ key: string }> };

export async function POST(request: Request, { params }: Params) {
  const { key } = await params;
  if (!authorized(key)) return new Response("Unauthorized", { status: 401 });

  const body = (await request.json().catch(() => ({}))) as { printerMAC?: string };
  await prisma.settings.update({
    where: { id: 1 },
    data: { printerLastSeen: new Date(), printerMac: body.printerMAC ?? undefined },
  });

  const job = await nextJob();
  return Response.json(
    job ? { jobReady: true, mediaTypes: ["text/plain"], jobToken: String(job.id) } : { jobReady: false },
  );
}

export async function GET(request: Request, { params }: Params) {
  const { key } = await params;
  if (!authorized(key)) return new Response("Unauthorized", { status: 401 });

  const url = new URL(request.url);
  const token = url.searchParams.get("token");
  const job = token
    ? await prisma.order.findUnique({ where: { id: Number(token) }, include: { items: true } })
    : await nextJob();
  if (!job) return new Response("No job", { status: 404 });

  await prisma.order.update({ where: { id: job.id }, data: { printStatus: "bezig" } });
  return new Response(renderReceipt(job), { headers: { "Content-Type": "text/plain; charset=us-ascii" } });
}

export async function DELETE(request: Request, { params }: Params) {
  const { key } = await params;
  if (!authorized(key)) return new Response("Unauthorized", { status: 401 });

  const url = new URL(request.url);
  const code = url.searchParams.get("code") ?? "";
  const token = url.searchParams.get("token");
  const job = token
    ? await prisma.order.findUnique({ where: { id: Number(token) } })
    : await prisma.order.findFirst({ where: { printStatus: "bezig" }, orderBy: { paidAt: "asc" } });
  if (!job) return new Response("OK");

  const ok = code.startsWith("2");
  await prisma.order.update({
    where: { id: job.id },
    data: ok ? { printStatus: "geprint", printedAt: new Date() } : { printStatus: "fout" },
  });
  return new Response("OK");
}
