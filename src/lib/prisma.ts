import { PrismaClient } from "@/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const globalForPrisma = globalThis as unknown as { prisma?: InstanceType<typeof PrismaClient> };

function getClient() {
  if (globalForPrisma.prisma) return globalForPrisma.prisma;
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("DATABASE_URL is not set");
  }
  const client = new PrismaClient({ adapter: new PrismaPg({ connectionString }) });
  // Ook in productie hergebruiken binnen dezelfde (serverless) instance.
  globalForPrisma.prisma = client;
  return client;
}

// Lazy: de client wordt pas aangemaakt bij het eerste gebruik, zodat `next build`
// geen DATABASE_URL nodig heeft.
export const prisma = new Proxy({} as InstanceType<typeof PrismaClient>, {
  get: (_target, prop) => Reflect.get(getClient(), prop),
});
