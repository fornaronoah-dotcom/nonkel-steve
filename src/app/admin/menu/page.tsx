import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { verifySession } from "@/lib/auth";
import { MenuEditor } from "./menu-editor";

export const dynamic = "force-dynamic";

export default async function AdminMenuPage() {
  if (!(await verifySession())) redirect("/admin/login");

  const categories = await prisma.category.findMany({
    orderBy: { sort: "asc" },
    include: { products: { orderBy: { sort: "asc" } } },
  });

  return <MenuEditor categories={categories} />;
}
