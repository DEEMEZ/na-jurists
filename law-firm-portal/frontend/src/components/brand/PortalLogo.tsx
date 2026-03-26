import { Link } from "react-router-dom";

const ALT =
  "N&A Jurists — Advocates, Corporate & Legal Consultants";

type PortalLogoProps = {
  /** If set, logo is wrapped in a router link (e.g. `/dashboard` or `/login`). */
  to?: string;
  className?: string;
};

/**
 * Same asset as main site `public/text-logo.png` — served from Vite `public/` as `/text-logo.png`.
 */
export function PortalLogo({ to, className = "" }: PortalLogoProps) {
  const img = (
    <img
      src="/text-logo.png"
      alt={ALT}
      className="h-9 w-auto max-h-[52px] max-w-[min(260px,78vw)] object-contain object-left sm:h-11 sm:max-h-[56px]"
      width={260}
      height={56}
      decoding="async"
    />
  );

  if (to) {
    return (
      <Link
        to={to}
        className={`inline-flex shrink-0 items-center focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-blue ${className}`}
      >
        {img}
      </Link>
    );
  }

  return <div className={`inline-flex shrink-0 items-center ${className}`}>{img}</div>;
}
