import { Link } from "react-router-dom";

const linkClass =
  "inline-flex items-center rounded-lg border border-secondary-navy/20 bg-background-white px-3 py-1.5 text-sm font-medium text-secondary-navy shadow-sm transition-colors hover:border-accent-blue/40 hover:bg-background-light hover:text-accent-blue";

export function BackToDashboard() {
  return (
    <Link to="/dashboard" className={linkClass}>
      Back to Dashboard
    </Link>
  );
}
