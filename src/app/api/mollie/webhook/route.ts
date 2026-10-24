import { prisma } from "@/lib/prisma";
import { syncPayment } from "@/lib/orders";

// Mollie stuurt enkel het betaal-id; de echte status halen we zelf op bij Mollie.
export async function POST(request: Request) {
  const form = await request.formData().catch(() => null);
  const id = String(form?.get("id") ?? "");
  if (!id.startsWith("tr_")) return new Response("Bad request", { status: 400 });

  const order = await prisma.order.findUnique({ where: { paymentId: id } });
  // Onbekend id: toch 200, zodat Mollie niet blijft herproberen.
  if (!order) return new Response("OK");

  try {
    await syncPayment(order);
  } catch (error) {
    console.error("Webhook sync mislukt:", error);
    return new Response("Error", { status: 500 }); // Mollie probeert later opnieuw
  }
  return new Response("OK");
}
