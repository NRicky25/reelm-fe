/**
 * Auto-sizing grid used by Browse, Search and My List.
 * Fits as many columns as the screen allows: ~2 on phones up to 8+ on wide screens.
 */
export function PosterGrid({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-[repeat(auto-fill,minmax(140px,1fr))] gap-x-3 gap-y-6 sm:grid-cols-[repeat(auto-fill,minmax(160px,1fr))] sm:gap-x-4">
      {children}
    </div>
  );
}
