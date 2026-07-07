#!/usr/bin/env node
import { spawnSync } from "node:child_process";

// `biome check --changed` errors when a PR's diff contains zero files of
// types Biome processes (e.g. a PR that only touches a workflow YAML file or
// a .gitkeep placeholder). That error has also caught real problems before —
// a misconfigured vcs.defaultBranch can make the diff resolve to nothing at
// all (see biome.json / the defaultBranch gotcha this repo already hit) — so
// we don't blanket-suppress it with --no-errors-on-unmatched. Instead: only
// treat "no files processed" as a pass when Biome's own output shows it
// found real changed files and is intentionally ignoring their types, not
// when the ignored-paths list is empty (which means the diff itself came
// back empty — the actual failure mode worth still catching).
const result = spawnSync("npx", ["biome", "check", "--changed"], {
  encoding: "utf-8",
});

process.stdout.write(result.stdout ?? "");
process.stderr.write(result.stderr ?? "");

if (result.status === 0) {
  process.exit(0);
}

const output = `${result.stdout ?? ""}${result.stderr ?? ""}`;
const noFilesProcessed = output.includes("No files were processed in the specified paths.");
const ignoredListIsEmpty = output.includes("The list is empty.");

if (noFilesProcessed && !ignoredListIsEmpty) {
  console.log(
    "\ncheck:ci — every changed file is a type Biome doesn't process (e.g. YAML, .gitkeep); treating as a pass.",
  );
  process.exit(0);
}

process.exit(result.status ?? 1);
