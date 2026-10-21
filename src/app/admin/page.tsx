import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { verifySession } from "@/lib/auth";
import { AdminDashboard } from "./dashboard";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  // Verdediging in de diepte: proxy is optimistisch, dus hier nog eens checken.
  if (!(await verifySession())) redirect("/admin/login");

  let submissions: Awaited<ReturnType<typeof prisma.contactSubmission.findMany>> = [];
  let dbError = false;

  try {
    submissions = await prisma.contactSubmission.findMany({
      orderBy: { createdAt: "desc" },
    });
  } catch {
    dbError = true;
  }

  return <AdminDashboard submissions={submissions} dbError={dbError} />;
}
