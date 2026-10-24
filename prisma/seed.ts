import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";
import { MENU } from "./seed-data";

const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL! }) });

// Voorlopige leverzones — bedragen nakijken met de frituur vóór livegang (/admin/instellingen).
const ZONES = [
  { postcode: "8450", name: "Bredene", fee: 250, minOrder: 1500 },
  { postcode: "8400", name: "Oostende", fee: 350, minOrder: 2000 },
  { postcode: "8420", name: "De Haan", fee: 400, minOrder: 2500 },
];

async function main() {
  await prisma.settings.upsert({ where: { id: 1 }, update: {}, create: { id: 1 } });

  for (const z of ZONES) {
    await prisma.deliveryZone.upsert({ where: { postcode: z.postcode }, update: {}, create: z });
  }

  // Menu enkel vullen als het nog leeg is, zodat aanpassingen in de admin niet overschreven worden.
  if ((await prisma.product.count()) > 0) {
    console.log("Menu bestaat al, overgeslagen.");
    return;
  }
  for (const [ci, c] of MENU.entries()) {
    await prisma.category.create({
      data: {
        slug: c.id,
        name: c.title,
        intro: c.intro,
        sort: ci,
        products: {
          create: c.items.map((item, pi) => ({
            name: item.name,
            description: item.description,
            price: Math.round(item.price * 100),
            sort: pi,
          })),
        },
      },
    });
  }
  console.log(`Menu aangemaakt: ${MENU.length} categorieën.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
