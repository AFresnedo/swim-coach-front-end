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
