/**
 * Name a quality level the way streaming sites do: by the 16:9 picture of the
 * same width. A wide cinema video encoded at 1920x800 is full-HD width with the
 * black bars left out, so it's "1080p", not "800p". 4:3 and portrait videos go
 * by their short side (1440x1080 and 1080x1920 are both "1080p").
 */
export function qualityLabel(width: number, height: number): string {
  if (!width) return `${height}p`; // some playlists only state the height
  const long = Math.max(width, height);
  const short = Math.min(width, height);
  return `${Math.max(short, Math.round((long * 9) / 16))}p`;
}
