"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Eye, EyeOff, Loader2 } from "lucide-react";

/**
 * DEMO ONLY: no real authentication. Any input "succeeds" and goes to the
 * profile picker. Replace onSubmit with a call to reelm-be later.
 */
export function AuthForm({ mode }: { mode: "login" | "signup" }) {
  const router = useRouter();
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);
  const isLogin = mode === "login";

  return (
    <div className="w-full max-w-sm rounded-3xl border border-line bg-elevated/80 p-7 shadow-2xl backdrop-blur-md sm:p-8">
      <h1 className="text-2xl font-extrabold tracking-tight">{isLogin ? "Welcome back" : "Create your account"}</h1>
      <p className="mt-1 text-sm text-muted">{isLogin ? "Sign in to keep watching." : "Start watching in less than a minute."}</p>

      <form
        className="mt-7 space-y-4"
        onSubmit={(e) => {
          e.preventDefault();
          setBusy(true);
          setTimeout(() => router.push("/profiles"), 500);
        }}
      >
        {!isLogin && <Field label="Name" name="name" autoComplete="name" />}
        <Field label="Email" name="email" type="email" autoComplete="email" />
        <div>
          <label htmlFor="password" className="mb-1.5 block text-xs font-medium text-soft">
            Password
          </label>
          <div className="relative">
            <input
              id="password"
              name="password"
              type={show ? "text" : "password"}
              autoComplete={isLogin ? "current-password" : "new-password"}
              className="h-11 w-full rounded-xl border border-line bg-surface px-4 pr-11 text-sm outline-none transition-[border-color,box-shadow] focus:border-lavender/60 focus:shadow-[0_0_0_0.25rem_rgba(169,156,240,0.15)] focus-visible:outline-none"
            />
            <button
              type="button"
              onClick={() => setShow((s) => !s)}
              aria-label={show ? "Hide password" : "Show password"}
              className="absolute right-2 top-1/2 grid size-8 -translate-y-1/2 place-items-center rounded-lg text-muted hover:text-fg"
            >
              {show ? <EyeOff size={17} /> : <Eye size={17} />}
            </button>
          </div>
        </div>

        {isLogin && (
          <div className="text-right">
            <span className="cursor-not-allowed text-xs text-muted" title="Not available in the demo">
              Forgot password?
            </span>
          </div>
        )}

        <button
          type="submit"
          disabled={busy}
          className="bg-brand flex h-11 w-full items-center justify-center gap-2 rounded-xl text-sm font-bold text-bg transition-[filter,transform] hover:brightness-105 active:scale-[0.98] disabled:opacity-80"
        >
          {busy && <Loader2 size={16} className="animate-spin" />}
          {isLogin ? "Sign in" : "Create account"}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-muted">
        {isLogin ? "New to Reelm? " : "Already have an account? "}
        <Link href={isLogin ? "/signup" : "/login"} className="font-semibold text-lavender hover:text-mauve">
          {isLogin ? "Create an account" : "Sign in"}
        </Link>
      </p>
      <p className="mt-4 rounded-lg bg-surface/60 px-3 py-2 text-center text-[0.6875rem] text-subtle">Demo: any email and password will work.</p>
    </div>
  );
}

function Field({ label, name, type = "text", autoComplete }: { label: string; name: string; type?: string; autoComplete?: string }) {
  return (
    <div>
      <label htmlFor={name} className="mb-1.5 block text-xs font-medium text-soft">
        {label}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        autoComplete={autoComplete}
        className="h-11 w-full rounded-xl border border-line bg-surface px-4 text-sm outline-none transition-[border-color,box-shadow] focus:border-lavender/60 focus:shadow-[0_0_0_0.25rem_rgba(169,156,240,0.15)] focus-visible:outline-none"
      />
    </div>
  );
}
