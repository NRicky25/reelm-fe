import Link from "next/link";
import { Logo } from "@/components/layout/logo";

export default function NotFound() {
  return (
    <div className="grid min-h-dvh place-items-center px-6 text-center">
      <div>
        <Logo />
        <p className="text-brand mt-10 text-6xl font-extrabold">404</p>
        <h1 className="mt-3 text-xl font-bold">This page drifted off the reel</h1>
        <p className="mt-1 text-sm text-muted">The title or page you&rsquo;re looking for doesn&rsquo;t exist.</p>
        <Link href="/" className="bg-brand mt-7 inline-block rounded-full px-6 py-2.5 text-sm font-bold text-bg">
          Back to Home
        </Link>
      </div>
    </div>
  );
}
