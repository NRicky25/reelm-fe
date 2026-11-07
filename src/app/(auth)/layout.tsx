import { Logo } from "@/components/layout/logo";

/** Shared look for Login / Sign up / Profiles: centered card on a soft glow. */
export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative flex min-h-dvh flex-col overflow-hidden">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(60% 50% at 20% 10%, rgba(169,156,240,0.16), transparent 70%), radial-gradient(50% 45% at 85% 90%, rgba(201,160,184,0.12), transparent 70%)",
        }}
      />
      <header className="relative px-5 py-5 sm:px-8">
        <Logo />
      </header>
      <main className="relative flex flex-1 items-center justify-center px-4 pb-16">{children}</main>
    </div>
  );
}
