"use client";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import { PROFILES, useProfile } from "@/lib/user-data";

/** DEMO: profiles are hard-coded; picking one is stored locally. */
export default function ProfilesPage() {
  const router = useRouter();
  const { select } = useProfile();

  return (
    <div className="text-center">
      <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">Who&rsquo;s watching?</h1>
      <ul className="mt-10 grid grid-cols-2 gap-6 sm:flex sm:gap-8">
        {PROFILES.map((p) => (
          <li key={p.id}>
            <button
              type="button"
              onClick={() => {
                select(p.id);
                router.push("/");
              }}
              className="group flex flex-col items-center gap-3"
            >
              <span className="rounded-3xl p-[3px] transition-[background] duration-200 group-hover:bg-[linear-gradient(135deg,var(--color-lavender),var(--color-mauve))] group-focus-visible:bg-[linear-gradient(135deg,var(--color-lavender),var(--color-mauve))]">
                <span
                  className="grid size-24 place-items-center rounded-[22px] text-4xl font-extrabold text-fg/90 transition-transform duration-200 group-hover:scale-[0.97] sm:size-28"
                  style={{ background: `linear-gradient(150deg, ${p.color}, #24252b)` }}
                >
                  {p.name[0]}
                </span>
              </span>
              <span className="text-sm text-muted transition-colors group-hover:text-fg">{p.name}</span>
            </button>
          </li>
        ))}
        <li className="hidden sm:block">
          <div className="flex flex-col items-center gap-3 opacity-60" title="Not available in the demo">
            <span className="grid size-[118px] place-items-center rounded-3xl border-2 border-dashed border-line text-muted">
              <Plus size={30} />
            </span>
            <span className="text-sm text-muted">Add profile</span>
          </div>
        </li>
      </ul>
      <button type="button" className="mt-12 rounded-full border border-line px-6 py-2.5 text-sm text-soft opacity-70" disabled title="Not available in the demo">
        Manage profiles
      </button>
    </div>
  );
}
