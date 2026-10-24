"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { verifySession } from "@/lib/auth";
import { getMollie } from "@/lib/orders";
import { mollieAmount } from "@/lib/money";

type Result = { success: boolean; error?: string };

async function requireAdmin() {
  if (!(await verifySession())) throw new Error("Unauthorized");
}

/** Menu-wijzigingen meteen zichtbaar maken op de publieke pagina's. */
function revalidateMenu() {
  revalidatePath("/menu");
  revalidatePath("/");
  revalidatePath("/admin/menu");
}

/** "4,50" / "4.5" / "4" → 450 eurocent */
function parseEuro(v: unknown): number | null {
  const n = Number(String(v ?? "").replace(",", ".").trim());
  return Number.isFinite(n) && n >= 0 && n < 10_000 ? Math.round(n * 100) : null;
}

/* ---------- Bestellingen ---------- */

const ADMIN_STATUSES = ["betaald", "in_bereiding", "klaar", "afgerond", "geannuleerd"];

export async function setOrderStatus(id: number, status: string): Promise<Result> {
  await requireAdmin();
  if (!ADMIN_STATUSES.includes(status)) return { success: false, error: "Ongeldige status" };
  await prisma.order.update({ where: { id }, data: { status } });
  revalidatePath("/admin/bestellingen");
  return { success: true };
}

export async function reprintOrder(id: number): Promise<Result> {
  await requireAdmin();
  await prisma.order.update({ where: { id }, data: { printStatus: "wachtrij", printedAt: null } });
  revalidatePath("/admin/bestellingen");
  return { success: true };
}

/** Annuleert en betaalt het volledige bedrag terug via Mollie. */
export async function refundOrder(id: number): Promise<Result> {
  await requireAdmin();
  const order = await prisma.order.findUnique({ where: { id } });
  if (!order?.paidAt) return { success: false, error: "Deze bestelling is niet betaald." };
  if (order.status === "geannuleerd") return { success: false, error: "Al geannuleerd." };

  const mollie = getMollie();
  if (mollie && order.paymentId) {
    try {
      await mollie.paymentRefunds.create({
        paymentId: order.paymentId,
        amount: { currency: "EUR", value: mollieAmount(order.total) },
        description: `Terugbetaling bestelling #${order.id}`,
        idempotencyKey: `refund-${order.id}`,
      });
    } catch (error) {
      console.error("Terugbetaling mislukt:", error);
      return { success: false, error: "Terugbetaling via Mollie mislukt. Probeer opnieuw of doe het in het Mollie-dashboard." };
    }
  }
  await prisma.order.update({ where: { id }, data: { status: "geannuleerd" } });
  revalidatePath("/admin/bestellingen");
  return { success: true };
}

/* ---------- Menu ---------- */

export async function toggleProduct(id: string, field: "available" | "active", value: boolean): Promise<Result> {
  await requireAdmin();
  await prisma.product.update({ where: { id }, data: { [field]: value } });
  revalidateMenu();
  return { success: true };
}

export async function saveProduct(input: {
  id?: string;
  categoryId: string;
  name: string;
  description: string;
  price: string;
}): Promise<Result> {
  await requireAdmin();
  const name = input.name.trim().slice(0, 100);
  const description = input.description.trim().slice(0, 300) || null;
  const price = parseEuro(input.price);
  if (!name) return { success: false, error: "Naam is verplicht." };
  if (price === null) return { success: false, error: "Ongeldige prijs." };

  if (input.id) {
    await prisma.product.update({ where: { id: input.id }, data: { name, description, price } });
  } else {
    const last = await prisma.product.findFirst({ where: { categoryId: input.categoryId }, orderBy: { sort: "desc" } });
    await prisma.product.create({
      data: { categoryId: input.categoryId, name, description, price, sort: (last?.sort ?? -1) + 1 },
    });
  }
  revalidateMenu();
  return { success: true };
}

export async function deleteProduct(id: string): Promise<Result> {
  await requireAdmin();
  // Bestellingen behouden hun naam/prijs-snapshot; de koppeling wordt leeggemaakt.
  await prisma.product.delete({ where: { id } });
  revalidateMenu();
  return { success: true };
}

export async function moveProduct(id: string, direction: -1 | 1): Promise<Result> {
  await requireAdmin();
  const p = await prisma.product.findUnique({ where: { id } });
  if (!p) return { success: false };
  const siblings = await prisma.product.findMany({ where: { categoryId: p.categoryId }, orderBy: { sort: "asc" } });
  const i = siblings.findIndex((s) => s.id === id);
  const j = i + direction;
  if (j < 0 || j >= siblings.length) return { success: true };
  [siblings[i], siblings[j]] = [siblings[j], siblings[i]];
  await prisma.$transaction(siblings.map((s, idx) => prisma.product.update({ where: { id: s.id }, data: { sort: idx } })));
  revalidateMenu();
  return { success: true };
}

export async function saveCategory(input: { id?: string; name: string; intro: string; active?: boolean }): Promise<Result> {
  await requireAdmin();
  const name = input.name.trim().slice(0, 60);
  if (!name) return { success: false, error: "Naam is verplicht." };
  const intro = input.intro.trim().slice(0, 200);

  if (input.id) {
    await prisma.category.update({
      where: { id: input.id },
      data: { name, intro, ...(input.active === undefined ? {} : { active: input.active }) },
    });
  } else {
    const base =
      name
        .toLowerCase()
        .normalize("NFD")
        .replace(/[̀-ͯ]/g, "")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "") || "categorie";
    let slug = base;
    for (let n = 2; await prisma.category.findUnique({ where: { slug } }); n++) slug = `${base}-${n}`;
    const last = await prisma.category.findFirst({ orderBy: { sort: "desc" } });
    await prisma.category.create({ data: { name, intro, slug, sort: (last?.sort ?? -1) + 1 } });
  }
  revalidateMenu();
  return { success: true };
}

export async function moveCategory(id: string, direction: -1 | 1): Promise<Result> {
  await requireAdmin();
  const cats = await prisma.category.findMany({ orderBy: { sort: "asc" } });
  const i = cats.findIndex((c) => c.id === id);
  const j = i + direction;
  if (i < 0 || j < 0 || j >= cats.length) return { success: true };
  [cats[i], cats[j]] = [cats[j], cats[i]];
  await prisma.$transaction(cats.map((c, idx) => prisma.category.update({ where: { id: c.id }, data: { sort: idx } })));
  revalidateMenu();
  return { success: true };
}

/* ---------- Instellingen ---------- */

export async function saveSettings(input: {
  orderingEnabled: boolean;
  pauseMessage: string;
  pickupEnabled: boolean;
  deliveryEnabled: boolean;
  pickupLeadMin: number;
  deliveryLeadMin: number;
  slotMinutes: number;
}): Promise<Result> {
  await requireAdmin();
  const clamp = (n: number, min: number, max: number) => Math.min(max, Math.max(min, Math.round(Number(n) || 0)));
  await prisma.settings.update({
    where: { id: 1 },
    data: {
      orderingEnabled: !!input.orderingEnabled,
      pauseMessage: input.pauseMessage.trim().slice(0, 300) || "Online bestellen is momenteel gepauzeerd.",
      pickupEnabled: !!input.pickupEnabled,
      deliveryEnabled: !!input.deliveryEnabled,
      pickupLeadMin: clamp(input.pickupLeadMin, 5, 240),
      deliveryLeadMin: clamp(input.deliveryLeadMin, 10, 240),
      slotMinutes: [10, 15, 20, 30].includes(Number(input.slotMinutes)) ? Number(input.slotMinutes) : 15,
    },
  });
  revalidateMenu();
  revalidatePath("/admin/instellingen");
  return { success: true };
}

export async function saveZone(input: {
  id?: string;
  postcode: string;
  name: string;
  fee: string;
  minOrder: string;
  active: boolean;
}): Promise<Result> {
  await requireAdmin();
  const postcode = input.postcode.trim();
  const name = input.name.trim().slice(0, 60);
  const fee = parseEuro(input.fee);
  const minOrder = parseEuro(input.minOrder);
  if (!/^\d{4}$/.test(postcode)) return { success: false, error: "Postcode moet 4 cijfers zijn." };
  if (!name) return { success: false, error: "Gemeente is verplicht." };
  if (fee === null || minOrder === null) return { success: false, error: "Ongeldig bedrag." };

  try {
    const data = { postcode, name, fee, minOrder, active: !!input.active };
    if (input.id) await prisma.deliveryZone.update({ where: { id: input.id }, data });
    else await prisma.deliveryZone.create({ data });
  } catch {
    return { success: false, error: "Deze postcode bestaat al." };
  }
  revalidatePath("/admin/instellingen");
  return { success: true };
}

export async function deleteZone(id: string): Promise<Result> {
  await requireAdmin();
  await prisma.deliveryZone.delete({ where: { id } });
  revalidatePath("/admin/instellingen");
  return { success: true };
}
