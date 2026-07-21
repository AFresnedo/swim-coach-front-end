import { getSwimCount, getUserCount } from "@/app/_lib/stats";

export function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div>
      <p data-testid={`stat-value-${label}`} className="font-bold text-3xl">
        {value}
      </p>
      <p className="mt-1 text-cyan-50 text-sm">{label}</p>
    </div>
  );
}

export async function SwimmerCountStat() {
  const count = await getUserCount();
  return (
    <Stat
      value={count !== null ? count.toLocaleString() : "Fetching..."}
      label="Swimmers training"
    />
  );
}

export async function SwimCountStat() {
  const count = await getSwimCount();
  return (
    <Stat value={count !== null ? count.toLocaleString() : "Fetching..."} label="Swims logged" />
  );
}
