"use client";
import Link from "next/link";
import { ChevronDown } from "lucide-react";
import { Avatar } from "@/components/layout/header";
import { setPlayerPrefs, usePlayerPrefs, useProfile } from "@/lib/user-data";

/** DEMO settings. Playback options are real (they change the player); account bits are placeholders. */
export default function SettingsPage() {
  const prefs = usePlayerPrefs();
  const { profile } = useProfile();

  return (
    <div className="mx-auto max-w-2xl px-4 pt-24 sm:pt-28">
      <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">Settings</h1>

      <Section title="Profile">
        <div className="flex items-center gap-4 p-4">
          <Avatar name={profile.name} color={profile.color} size={48} />
          <div>
            <p className="font-semibold">{profile.name}</p>
            <p className="text-xs text-muted">demo@reelm.app</p>
          </div>
          <Link href="/profiles" className="ml-auto rounded-full border border-line px-4 py-2 text-xs font-medium text-soft hover:bg-surface">
            Switch profile
          </Link>
        </div>
      </Section>

      <Section title="Playback">
        <SelectRow
          label="Default audio"
          value={prefs.audio}
          options={["Japanese", "English"]}
          onChange={(v) => setPlayerPrefs({ audio: v })}
        />
        <SelectRow
          label="Default subtitles"
          value={prefs.subtitles}
          options={["Off", "English", "Español", "Bahasa Indonesia", "Français"]}
          onChange={(v) => setPlayerPrefs({ subtitles: v })}
        />
        <SelectRow
          label="Playback speed"
          value={String(prefs.speed)}
          options={["0.75", "1", "1.25", "1.5"]}
          format={(v) => (v === "1" ? "Normal" : `${v}×`)}
          onChange={(v) => setPlayerPrefs({ speed: Number(v) })}
        />
      </Section>

      <Section title="Account">
        <Row label="Email" value="demo@reelm.app" />
        <Row label="Plan" value="Demo" />
        <Row label="Password" value="••••••••" />
        <div className="p-4">
          <Link href="/login" className="text-sm font-semibold text-mauve hover:text-lavender">
            Sign out
          </Link>
        </div>
      </Section>

      <p className="mt-6 text-center text-xs text-subtle">Demo build: account details are placeholders until the backend is connected.</p>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-8">
      <h2 className="mb-2 px-1 text-xs font-semibold tracking-[0.15em] text-subtle">{title.toUpperCase()}</h2>
      <div className="divide-y divide-line overflow-hidden rounded-2xl border border-line bg-elevated">{children}</div>
    </section>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4 p-4 text-sm">
      <span className="text-soft">{label}</span>
      <span className="text-muted">{value}</span>
    </div>
  );
}

function SelectRow({
  label,
  value,
  options,
  onChange,
  format = (v) => v,
}: {
  label: string;
  value: string;
  options: string[];
  onChange: (v: string) => void;
  format?: (v: string) => string;
}) {
  const id = label.toLowerCase().replace(/\s+/g, "-");
  return (
    <div className="flex items-center justify-between gap-4 p-4 text-sm">
      <label htmlFor={id} className="text-soft">
        {label}
      </label>
      <div className="relative">
        <select
          id={id}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="h-9 appearance-none rounded-lg border border-line bg-surface pl-3 pr-9 text-sm outline-none hover:bg-surface-hover"
        >
          {options.map((o) => (
            <option key={o} value={o}>
              {format(o)}
            </option>
          ))}
        </select>
        <ChevronDown size={15} className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-muted" />
      </div>
    </div>
  );
}
