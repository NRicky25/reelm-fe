import Link from "next/link";

export function Logo({ className = "" }: { className?: string }) {
  return (
    <Link href="/" aria-label="Reelm home" className={`font-logo text-2xl font-extrabold tracking-tight text-fg ${className}`}>
      reel<span className="text-brand">m</span>
    </Link>
  );
}

/** The gradient "m" alone, for small spaces (favicon-style mark). */
export function LogoMark({ className = "" }: { className?: string }) {
  return <span className={`font-logo font-extrabold text-brand ${className}`}>m</span>;
}
