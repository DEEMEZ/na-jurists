import { FIRM_ALT, FIRM_NAME, FIRM_TAGLINE } from "@site/constants/branding";

type BrandLogoProps = {
  className?: string;
  inverted?: boolean;
  compact?: boolean;
};

export function BrandLogo({ className = "", inverted = false, compact = false }: BrandLogoProps) {
  const titleClass = inverted ? "text-white" : "text-primary-navy";
  const taglineClass = inverted ? "text-blue-100/90" : "text-text-light";

  return (
    <div className={`flex items-center gap-2.5 sm:gap-3 ${className}`} aria-label={FIRM_ALT}>
      <img
        src="/emblem-icon.png"
        alt=""
        className="h-9 w-9 shrink-0 object-contain sm:h-11 sm:w-11"
        width={44}
        height={44}
        decoding="async"
      />
      <div className={`min-w-0 leading-tight ${titleClass}`}>
        <div className="font-serif text-base font-bold tracking-wide sm:text-lg">{FIRM_NAME}</div>
        {!compact ? (
          <div className={`mt-0.5 text-[9px] font-medium leading-snug sm:text-[10px] ${taglineClass}`}>
            {FIRM_TAGLINE}
          </div>
        ) : null}
      </div>
    </div>
  );
}
