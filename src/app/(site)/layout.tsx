import { Nav } from "@/components/nav";
import { Footer } from "@/components/footer";
import { CookieConsent } from "@/components/cookie-consent";
import { LocalBusinessJsonLd } from "@/components/json-ld";
import { SmoothScroll } from "@/components/smooth-scroll";
import { CartProvider } from "@/components/order/cart";
import { CartBar, CartDrawer } from "@/components/order/cart-drawer";

export default function SiteLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <CartProvider>
      <LocalBusinessJsonLd />
      <Nav />
      <main>{children}</main>
      <Footer />
      <CookieConsent />
      <SmoothScroll />
      <CartBar />
      <CartDrawer />
    </CartProvider>
  );
}
