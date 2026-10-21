"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { verifySession } from "@/lib/auth";
import { STATUSES, type Status } from "@/lib/status";

interface Result {
  success: boolean;
  error?: string;
}

async function requireAdmin() {
  if (!(await verifySession())) {
    throw new Error("Unauthorized");
  }
}

export async function updateStatus(id: string, status: string): Promise<Result> {
  await requireAdmin();
  if (!STATUSES.includes(status as Status)) {
    return { success: false, error: "Ongeldige status" };
  }
  try {
    await prisma.contactSubmission.update({ where: { id }, data: { status } });
    revalidatePath("/admin");
    return { success: true };
  } catch {
    return { success: false, error: "Opslaan mislukt" };
  }
}

export async function updateNotes(id: string, notes: string): Promise<Result> {
  await requireAdmin();
  try {
    await prisma.contactSubmission.update({
      where: { id },
      data: { notes: notes.trim() === "" ? null : notes },
    });
    revalidatePath("/admin");
    return { success: true };
  } catch {
    return { success: false, error: "Opslaan mislukt" };
  }
}

export async function deleteSubmission(id: string): Promise<Result> {
  await requireAdmin();
  try {
    await prisma.contactSubmission.delete({ where: { id } });
    revalidatePath("/admin");
    return { success: true };
  } catch {
    return { success: false, error: "Verwijderen mislukt" };
  }
}
