import { cache } from "react";
import { prisma } from "@/lib/prisma";

/** Actieve categorieën met hun zichtbare producten, in volgorde. */
export const getMenu = cache(async () => {
  return prisma.category.findMany({
    where: { active: true, products: { some: { active: true } } },
    orderBy: { sort: "asc" },
    include: {
      products: {
        where: { active: true },
        orderBy: { sort: "asc" },
        select: { id: true, name: true, description: true, price: true, available: true },
      },
    },
  });
});

export type MenuCategory = Awaited<ReturnType<typeof getMenu>>[number];
export type MenuProduct = MenuCategory["products"][number];

export const getSettings = cache(async () => {
  return prisma.settings.upsert({ where: { id: 1 }, update: {}, create: { id: 1 } });
});

export const getActiveZones = cache(async () => {
  return prisma.deliveryZone.findMany({ where: { active: true }, orderBy: { postcode: "asc" } });
});
