export function formatMmSs(totalSeconds: number): string {
  const rounded = Math.round(totalSeconds * 100) / 100;
  const minutes = Math.floor(rounded / 60);
  const seconds = rounded - minutes * 60;
  return `${minutes}:${seconds.toFixed(2).padStart(5, "0")}`;
}

// Accepts "m:ss.ss" (e.g. "1:02.35") or bare seconds (e.g. "32.10") for
// times under a minute. Returns null on anything that isn't a positive
// number the backend's time_seconds field would accept.
export function parseMmSs(input: string): number | null {
  const trimmed = input.trim();
  if (!trimmed) return null;

  const withMinutes = trimmed.match(/^(\d+):([0-5]?\d(?:\.\d+)?)$/);
  if (withMinutes) {
    const minutes = Number(withMinutes[1]);
    const seconds = Number(withMinutes[2]);
    const total = minutes * 60 + seconds;
    return total > 0 ? total : null;
  }

  const secondsOnly = trimmed.match(/^\d+(?:\.\d+)?$/);
  if (secondsOnly) {
    const total = Number(trimmed);
    return total > 0 ? total : null;
  }

  return null;
}
