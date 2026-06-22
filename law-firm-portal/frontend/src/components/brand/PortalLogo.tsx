import { Link } from "react-router-dom";
import { BrandLogo } from "@/components/brand/BrandLogo";

type PortalLogoProps = {
  /** If set, logo is wrapped in a router link (e.g. `/dashboard` or `/login`). */
  to?: string;
  className?: string;
};

/**
 * Firm lockup — emblem + name + tagline (Tax Consultants).
 */
export function PortalLogo({ to, className = "" }: PortalLogoProps) {
  const logo = <BrandLogo className={className} />;

  if (to) {
    return (
      <Link
        to={to}
        className={`inline-flex shrink-0 items-center focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-blue ${className}`}
      >
        {logo}
      </Link>
    );
  }

  return <div className={`inline-flex shrink-0 items-center ${className}`}>{logo}</div>;
}
