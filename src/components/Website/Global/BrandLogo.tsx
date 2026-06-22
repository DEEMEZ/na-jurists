import Image from "next/image";
import { FIRM_ALT, FIRM_NAME, FIRM_TAGLINE } from "@/constants/branding";

type BrandLogoProps = {
  className?: string;
  /** White text for dark backgrounds (footer). */
  inverted?: boolean;
  /** Hide tagline under the firm name. */
  compact?: boolean;
};

export function BrandLogo({ className = "", inverted = false, compact = false }: BrandLogoProps) {
  const titleClass = inverted ? "text-white" : "text-[#2c415e]";
  const taglineClass = inverted ? "text-blue-200" : "text-[#64748b]";

  return (
    <div className={`flex items-center gap-2.5 sm:gap-3 ${className}`} aria-label={FIRM_ALT}>
      <Image
        src="/emblem-icon.png"
        alt=""
        width={44}
        height={44}
        className="h-9 w-9 shrink-0 sm:h-11 sm:w-11"
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
