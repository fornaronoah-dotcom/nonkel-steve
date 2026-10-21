import Link from "next/link";
import { Phone, ShoppingBag, UtensilsCrossed, Mail, Navigation } from "lucide-react";
import { site } from "@/lib/site";
import { delay } from "@/lib/reveal";

type Variant = "primary" | "secondary" | "light";
type Kind = "order" | "call" | "menu" | "contact" | "route";

const CONFIG: Record<Kind, { label: string; href: string; icon: typeof Phone; external?: boolean }> = {
  order: { label: "Bestel online", href: site.orderUrl, icon: ShoppingBag, external: true },
  call: { label: `Bel ${site.phone}`, href: site.phoneHref, icon: Phone },
  menu: { label: "Bekijk het menu", href: "/menu", icon: UtensilsCrossed },
  contact: { label: "Stuur een bericht", href: "/contact", icon: Mail },
  route: { label: "Plan je route", href: site.mapsUrl, icon: Navigation, external: true },
};

export function CtaButton({
  kind,
  variant = "primary",
  label,
}: {
  kind: Kind;
  variant?: Variant;
  label?: string;
}) {
  const { href, icon: Icon, external, label: defaultLabel } = CONFIG[kind];
  const cls = `btn btn-${variant}`;
  const content = (
    <>
      <Icon className="size-5 shrink-0" strokeWidth={2.4} aria-hidden="true" />
      {label ?? defaultLabel}
    </>
  );
  if (external) {
    return (
      <a href={href} className={cls} target="_blank" rel="noopener">
        {content}
      </a>
    );
  }
  if (href.startsWith("/")) {
    return (
      <Link href={href} className={cls}>
        {content}
      </Link>
    );
  }
  return (
    <a href={href} className={cls}>
      {content}
    </a>
  );
}

/** Elke sectie krijgt 2 keuzes: een primaire en een secundaire actie. */
export function CtaPair({
  primary = "order",
  secondary = "call",
  dark = false,
  center = false,
  delayMs = 0,
  className = "",
}: {
  primary?: Kind;
  secondary?: Kind;
  dark?: boolean;
  center?: boolean;
  delayMs?: number;
  className?: string;
}) {
  return (
    <div
      className={`reveal flex flex-col gap-3 sm:flex-row sm:flex-wrap ${center ? "sm:justify-center" : ""} ${className}`}
      style={delayMs ? delay(delayMs) : undefined}
    >
      <CtaButton kind={primary} variant="primary" />
      <CtaButton kind={secondary} variant={dark ? "light" : "secondary"} />
    </div>
  );
}
