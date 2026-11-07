// Placeholder artwork painted from a title's two colors.
// When real images exist (posterUrl / backdropUrl), they're shown instead.
import Image from "next/image";
import type { Title } from "@/data/types";

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
}: {
  title: Pick<Title, "name" | "colors" | "posterUrl" | "backdropUrl">;
  variant: "poster" | "landscape" | "backdrop";
  className?: string;
  priority?: boolean;
}) {
  const url = variant === "poster" ? title.posterUrl : title.backdropUrl;
  if (url)
    return (
      <div className={`relative overflow-hidden ${className}`}>
        <Image src={url} alt="" fill priority={priority} className="object-cover" sizes={variant === "poster" ? "200px" : "100vw"} />
      </div>
    );

  const [a, b] = title.colors;
  const h = hash(title.name);
  const x = 20 + (h % 60);
  const y = 15 + ((h >> 3) % 50);
  const r = 18 + ((h >> 5) % 22);
  const x2 = 100 - x;
  const y2 = 100 - y / 2;

  return (
    <div
      aria-hidden
      className={`relative overflow-hidden ${className}`}
      style={{
        backgroundImage: [
          `radial-gradient(circle at ${x}% ${y}%, color-mix(in srgb, ${a} 100%, white 18%) 0%, transparent ${r}%)`,
          `radial-gradient(circle at ${x2}% ${y2}%, color-mix(in srgb, ${a} 70%, #c9a0b8 30%) 0%, transparent ${r + 18}%)`,
          `linear-gradient(${150 + (h % 40)}deg, ${a}, ${b})`,
        ].join(","),
      }}
    >
      {/* soft horizon line for a little depth */}
      <div
        className="absolute inset-x-0 bottom-0 h-1/2 opacity-40"
        style={{ background: `linear-gradient(0deg, ${b}, transparent)` }}
      />
      {variant === "poster" && (
        <span className="absolute inset-x-3 bottom-3 line-clamp-3 text-[13px] font-extrabold leading-tight tracking-tight text-white/80 drop-shadow">
          {title.name}
        </span>
      )}
    </div>
  );
}
