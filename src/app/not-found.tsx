import Link from "next/link";
import { CtaPair } from "@/components/cta";
import { Logo } from "@/components/logo";

export default function NotFound() {
  return (
    <main className="mx-auto flex min-h-dvh max-w-xl flex-col items-center justify-center text-center px-4 py-16 sm:px-6">
      <Link href="/" aria-label="Bie Nonkel Steve — naar home">
        <Logo />
      </Link>
      <h1 className="font-display mt-10 text-5xl text-coal">Deze pagina is op.</h1>
      <p className="mt-4 text-lg text-ink/75">
        Net als de laatste frietjes van de dag. Ga terug naar de homepage of bestel meteen online.
      </p>
      <CtaPair primary="order" secondary="call" center className="mt-8" />
    </main>
  );
}
