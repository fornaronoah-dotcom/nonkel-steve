/** Woordmerk naar het uithangbord op de gevel: goud script op antraciet. */
export function Logo({ light = false, size = "md" }: { light?: boolean; size?: "md" | "lg" }) {
  return (
    <span
      className={`logo-shine font-script inline-block whitespace-nowrap ${size === "lg" ? "text-5xl sm:text-6xl" : "text-[2rem] sm:text-4xl"} ${light ? "text-gold" : "text-coal"}`}
    >
      Bie nonkel Steve
    </span>
  );
}
