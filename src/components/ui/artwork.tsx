// Title artwork. Uses the real image when a title has one (posterUrl /
// backdropUrl), otherwise paints a placeholder from the title's two colors.
import Image from "next/image";
import type { Title } from "@/data/types";

type ArtTitle = Pick<Title, "name" | "colors" | "posterUrl" | "backdropUrl" | "posterFocusX">;

const SIZES = {
  poster: "(max-width: 640px) 45vw, 220px",
  landscape: "(max-width: 640px) 70vw, 320px",
  backdrop: "100vw",
};

function hash(s: string) {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return Math.abs(h);
}

export function Artwork({
  title,
  variant,
  className = "",
  priority,
  showName = variant === "poster",
}: {
  title: ArtTitle;
  variant: "poster" | "landscape" | "backdrop";
  className?: string;
  priority?: boolean;
  /** Overlay the title name (posters only by default). */
  showName?: boolean;
}) {
  // posters fall back to the backdrop image, cropped around its focus point
  const url = variant === "poster" ? (title.posterUrl ?? title.backdropUrl) : (title.backdropUrl ?? title.posterUrl);

  if (url)
    return (
      <div className={`relative overflow-hidden bg-surface ${className}`}>
        <Image
          src={url}
          alt=""
          fill
          priority={priority}
          sizes={SIZES[variant]}
          className="object-cover"
          style={variant === "poster" ? { objectPosition: `${title.posterFocusX ?? 50}% 50%` } : undefined}
        />
        {showName && <PosterName name={title.name} />}
      </div>
    );

  const [a, b] = title.colors;
  const h = hash(title.name);
  const x = 20 + (h % 60);
  const y = 15 + ((h >> 3) % 50);
  const r = 18 + ((h >> 5) % 22);

  return (
    <div
      aria-hidden
      className={`relative overflow-hidden ${className}`}
      style={{
        backgroundImage: [
          `radial-gradient(circle at ${x}% ${y}%, color-mix(in srgb, ${a} 100%, white 18%) 0%, transparent ${r}%)`,
          `radial-gradient(circle at ${100 - x}% ${100 - y / 2}%, color-mix(in srgb, ${a} 70%, #c9a0b8 30%) 0%, transparent ${r + 18}%)`,
          `linear-gradient(${150 + (h % 40)}deg, ${a}, ${b})`,
        ].join(","),
      }}
    >
      <div className="absolute inset-x-0 bottom-0 h-1/2 opacity-40" style={{ background: `linear-gradient(0deg, ${b}, transparent)` }} />
      {showName && <PosterName name={title.name} />}
    </div>
  );
}

/** Title printed on the lower part of a poster, like key art. */
function PosterName({ name }: { name: string }) {
  return (
    <>
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-2/5 bg-gradient-to-t from-black/75 via-black/30 to-transparent" />
      <span className="pointer-events-none absolute inset-x-3 bottom-3 line-clamp-3 text-[13px] font-extrabold leading-tight tracking-tight text-white drop-shadow-[0_1px_4px_rgba(0,0,0,0.6)]">
        {name}
      </span>
    </>
  );
}
