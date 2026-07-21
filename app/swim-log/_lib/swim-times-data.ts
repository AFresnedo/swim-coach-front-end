export type Stroke =
  | "freestyle"
  | "backstroke"
  | "breaststroke"
  | "butterfly"
  | "individual_medley";
export type Course = "scy" | "scm" | "lcm";

export type SwimTime = {
  id: number;
  user_id: number;
  date: string;
  stroke: Stroke;
  course: Course;
  length: number;
  attempt_number: number;
  time_seconds: number;
  is_official: boolean;
  notes: string | null;
  created_at: string;
};

export const STROKE_OPTIONS: { value: Stroke; label: string }[] = [
  { value: "freestyle", label: "Freestyle" },
  { value: "backstroke", label: "Backstroke" },
  { value: "breaststroke", label: "Breaststroke" },
  { value: "butterfly", label: "Butterfly" },
  { value: "individual_medley", label: "Individual Medley" },
];

export const COURSE_OPTIONS: { value: Course; label: string }[] = [
  { value: "scy", label: "SCY (short course yards)" },
  { value: "scm", label: "SCM (short course meters)" },
  { value: "lcm", label: "LCM (long course meters)" },
];

// The BFF route (app/swim-log/api/route.ts) forwards exactly these keys
// from the incoming request to the backend; the query builder below sets
// exactly these keys. Sharing one list keeps the two from drifting apart.
export const SWIM_TIME_FILTER_PARAMS = [
  "date_from",
  "date_to",
  "stroke",
  "course",
  "length",
  "is_official",
  "cursor",
] as const;

export type SwimTimeFilterParam = (typeof SWIM_TIME_FILTER_PARAMS)[number];

export const STROKE_LABELS = Object.fromEntries(
  STROKE_OPTIONS.map(({ value, label }) => [value, label]),
) as Record<Stroke, string>;

export const COURSE_LABELS = Object.fromEntries(
  COURSE_OPTIONS.map(({ value, label }) => [value, label]),
) as Record<Course, string>;

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
