/** Gouden sierlijn met ruit, als scheiding onder titels. Groeit open als hij in beeld komt. */
export function Ornament({ className = "" }: { className?: string }) {
  return (
    <div className={`ornament flex items-center justify-center gap-3 text-gold ${className}`} aria-hidden="true">
      <span className="ornament-line h-px w-12 origin-right bg-current" />
      <span className="ornament-gem size-2 rotate-45 bg-current" />
      <span className="ornament-line h-px w-12 origin-left bg-current" />
    </div>
  );
}
