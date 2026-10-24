import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { verifySession } from "@/lib/auth";
import { getSettings } from "@/lib/menu";
import { OrdersBoard } from "./orders-board";

export const dynamic = "force-dynamic";

const daysAgo = (n: number) => new Date(Date.now() - n * 86_400_000);
/** Printer pollt elke paar seconden; 2 min stil = offline. */
const isRecent = (d: Date | null) => d !== null && Date.now() - d.getTime() < 2 * 60_000;

export default async function OrdersPage() {
  if (!(await verifySession())) redirect("/admin/login");

  const since = daysAgo(14);
  const [orders, settings] = await Promise.all([
    prisma.order.findMany({
      where: { createdAt: { gte: since } },
      orderBy: { createdAt: "desc" },
      include: { items: true },
      take: 300,
    }),
    getSettings(),
  ]);

  return (
    <OrdersBoard
      orders={orders}
      printerOnline={isRecent(settings.printerLastSeen)}
      orderingEnabled={settings.orderingEnabled}
    />
  );
}
