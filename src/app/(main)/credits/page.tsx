import { STILLS, type Still } from "@/data/images";

export const metadata = { title: "Credits" };

const VIDEOS = [
  { film: "Big Buck Bunny", credit: "Blender Foundation", license: "CC BY 3.0", source: "https://peach.blender.org" },
  { film: "Tears of Steel", credit: "Blender Foundation", license: "CC BY 3.0", source: "https://mango.blender.org" },
  { film: "Sintel (trailer)", credit: "Blender Foundation", license: "CC BY 3.0", source: "https://durian.blender.org" },
];

/** Attribution for the Creative Commons artwork and sample videos used in this demo. */
export default function CreditsPage() {
  const stills = Object.entries(STILLS) as [string, Still][];
  return (
    <div className="mx-auto max-w-3xl px-gutter pt-24 sm:pt-28">
      <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">Credits</h1>
      <p className="mt-3 text-sm leading-relaxed text-muted">
        All titles, names and descriptions on Reelm are made up for this demo. The artwork and sample videos come from the Blender
        Foundation&rsquo;s open movies, used under Creative Commons licenses. Images are resized and cropped.
      </p>

      <h2 className="mt-10 text-xs font-semibold tracking-[0.15em] text-subtle">SAMPLE VIDEOS</h2>
      <ul className="mt-3 divide-y divide-line overflow-hidden rounded-2xl border border-line bg-elevated text-sm">
        {VIDEOS.map((v) => (
          <li key={v.film} className="flex flex-wrap items-center gap-x-3 gap-y-1 p-4">
            <span className="font-semibold">{v.film}</span>
            <span className="text-muted">© {v.credit}</span>
            <span className="ml-auto flex items-center gap-3">
              <span className="text-xs text-subtle">{v.license}</span>
              <a href={v.source} target="_blank" rel="noreferrer" className="text-xs font-semibold text-lavender hover:text-mauve">
                Source
              </a>
            </span>
          </li>
        ))}
      </ul>

      <h2 className="mt-10 text-xs font-semibold tracking-[0.15em] text-subtle">ARTWORK</h2>
      <ul className="mt-3 divide-y divide-line overflow-hidden rounded-2xl border border-line bg-elevated text-sm">
        {stills.map(([name, st]) => (
          <li key={name} className="flex flex-wrap items-center gap-x-3 gap-y-1 p-4">
            <span className="font-semibold">{st.film}</span>
            <span className="text-muted">© {st.credit}</span>
            <span className="ml-auto flex items-center gap-3">
              <span className="text-xs text-subtle">{st.license}</span>
              <a href={st.source} target="_blank" rel="noreferrer" className="text-xs font-semibold text-lavender hover:text-mauve">
                Source
              </a>
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
