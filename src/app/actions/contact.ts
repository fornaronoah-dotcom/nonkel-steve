"use server";

import { prisma } from "@/lib/prisma";
import { Resend } from "resend";

export interface ContactState {
  success?: boolean;
  error?: string;
}

const ALLOWED_PAGES = ["homepage", "menu", "contact"];

function esc(s: string) {
  return s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);
}

function row(label: string, value: string) {
  return `<tr><td style="padding:8px;border-bottom:1px solid #eee;font-weight:bold">${label}</td><td style="padding:8px;border-bottom:1px solid #eee">${esc(value).replace(/\n/g, "<br>")}</td></tr>`;
}

export async function submitContact(
  _prev: ContactState | undefined,
  formData: FormData,
): Promise<ContactState> {
  // Honeypot: bots vullen dit verborgen veld in.
  if (String(formData.get("website") ?? "") !== "") return { success: true };

  const naam = String(formData.get("naam") ?? "").trim().slice(0, 200);
  const email = String(formData.get("email") ?? "").trim().slice(0, 200);
  const telefoon = String(formData.get("telefoon") ?? "").trim().slice(0, 50);
  const bericht = String(formData.get("bericht") ?? "").trim().slice(0, 5000);
  const rawPage = String(formData.get("page") ?? "homepage");
  const page = ALLOWED_PAGES.includes(rawPage) ? rawPage : "homepage";
  const purpose = "contact";

  if (!naam || !bericht) return { error: "Vul je naam en bericht in." };
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return { error: "Vul een geldig e-mailadres in." };
  if (formData.get("privacy") !== "on") return { error: "Ga akkoord met het privacybeleid." };

  try {
    await prisma.contactSubmission.create({
      data: { naam, email, telefoon: telefoon || null, bericht, page, purpose },
    });
  } catch (error) {
    console.error("Contact submission error:", error);
    return { error: "Er ging iets mis. Probeer het opnieuw of bel ons." };
  }

  if (process.env.RESEND_API_KEY) {
    try {
      const resend = new Resend(process.env.RESEND_API_KEY);
      await resend.emails.send({
        from: process.env.RESEND_FROM_EMAIL || "Bie Nonkel Steve <noreply@bienonkelsteve.be>",
        to: process.env.CONTACT_EMAIL || "bienonkelsteve@gmail.com",
        replyTo: email,
        subject: `Nieuw bericht via de website — ${naam}`,
        html: `
          <h2>Nieuw bericht via de website</h2>
          <table style="border-collapse:collapse;width:100%;max-width:600px">
            ${row("Naam", naam)}
            ${row("E-mail", email)}
            ${telefoon ? row("Telefoon", telefoon) : ""}
            ${row("Bericht", bericht)}
          </table>
          <p style="margin-top:16px;color:#888;font-size:12px">Via ${page} — ${purpose}</p>
        `,
      });
    } catch (error) {
      // Inzending staat al in de database; mailfout niet aan bezoeker tonen.
      console.error("Resend error:", error);
    }
  }

  return { success: true };
}
