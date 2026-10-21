import { Nav } from "@/components/nav";
import { Footer } from "@/components/footer";
import { CookieConsent } from "@/components/cookie-consent";
import { LocalBusinessJsonLd } from "@/components/json-ld";
import { SmoothScroll } from "@/components/smooth-scroll";

export default function SiteLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <>
      <LocalBusinessJsonLd />
      <Nav />
      <main>{children}</main>
      <Footer />
      <CookieConsent />
      <SmoothScroll />
    </>
  );
}
