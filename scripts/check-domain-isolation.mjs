#!/usr/bin/env node
import { spawnSync } from "node:child_process";
import { unlinkSync, writeFileSync } from "node:fs";

// biome.json's domain-isolation rule (style/noRestrictedImports, in the single
// override block covering app/<route>/_components|_hooks|_lib) has a silent
// failure mode: splitting it into more than one override block, or a wrong
// glob escape, makes it stop enforcing a domain with no lint error at all —
// `biome check` looks clean either way. See the project-biome-json-editing-
// gotchas memory for how that was found. This script proves the rule is
// still doing its job by feeding it known-good and known-bad imports and
// checking Biome's actual verdict, rather than trusting a clean run.
//
// Every case here is a synthetic import specifier — none of the target paths
// need to exist as real files, since noRestrictedImports matches the
// specifier string itself, not a resolved module.

const cases = [
  {
    domain: "swim-log",
    specifier: "@/app/swim-log/_components/CreateSwimTimeForm",
    expect: "BLOCKED",
  },
  { domain: "swim-log", specifier: "@/app/swim-log/_components/SwimLog", expect: "ALLOWED" },
  {
    domain: "swim-log",
    specifier: "@/app/swim-log/_lib/swim-times-data",
    expect: "ALLOWED",
    note: "intentionally global — __tests__/swim-times-data.test.ts imports it directly (the BFF route no longer needs this exception; it moved inside the domain)",
  },
  { domain: "goals", specifier: "@/app/goals/_components/GoalCard", expect: "BLOCKED" },
  { domain: "goals", specifier: "@/app/goals/_components/GoalsList", expect: "ALLOWED" },
  {
    domain: "profile",
    specifier: "@/app/profile/_components/SomeFutureHelper",
    expect: "BLOCKED",
    note: "profile is single-file today; this proves the rule still guards a second file that doesn't exist yet",
  },
  { domain: "profile", specifier: "@/app/profile/_components/ProfileForm", expect: "ALLOWED" },
  {
    domain: "sign-up",
    specifier: "@/app/sign-up/_components/SomeFutureHelper",
    expect: "BLOCKED",
  },
  { domain: "sign-up", specifier: "@/app/sign-up/_components/Turnstile", expect: "ALLOWED" },
  {
    domain: "strokes/[stroke]",
    specifier: "@/app/strokes/[stroke]/_components/SomeFutureHelper",
    expect: "BLOCKED",
    note: "also proves the escaped [stroke] glob still matches the literal bracket path",
  },
  {
    domain: "strokes/[stroke]",
    specifier: "@/app/strokes/[stroke]/_components/DrillsSection",
    expect: "ALLOWED",
  },
  { domain: "home", specifier: "@/app/_components/FeatureCard", expect: "BLOCKED" },
  { domain: "home", specifier: "@/app/_lib/home-data", expect: "BLOCKED" },
  {
    domain: "home",
    specifier: "@/app/_lib/stats",
    expect: "ALLOWED",
    note: "intentionally global — __tests__/stats.test.tsx imports it directly",
  },
];

const scratchPath = "app/_domain_isolation_check_tmp.ts";

// Uses --reporter=json rather than matching Biome's human-readable text: a
// config parse error (e.g. an unescaped glob bracket) never prints a JSON
// summary line at all, so "no parseable JSON line" is a structural signal
// for CONFIG_ERROR that doesn't depend on any specific error wording. Once
// there IS a JSON line, checking diagnostics[].category against the rule's
// own id ("lint/style/noRestrictedImports") is far more stable than matching
// the rule's `message` text, which is free-form prose we wrote ourselves and
// could reword later. Biome calls --reporter=json itself "unstable/
// experimental," but a rule id is a config key used throughout the tool,
// so it's a safer bet than prose either way.
function classify(specifier) {
  writeFileSync(scratchPath, `import x from "${specifier}";\nexport default x;\n`);
  const result = spawnSync("npx", ["biome", "lint", "--reporter=json", scratchPath], {
    encoding: "utf-8",
  });
  const summaryLine = (result.stdout ?? "")
    .split("\n")
    .map((line) => line.trim())
    .find((line) => line.startsWith("{") && line.endsWith("}"));

  if (!summaryLine) return "CONFIG_ERROR";

  let parsed;
  try {
    parsed = JSON.parse(summaryLine);
  } catch {
    return "CONFIG_ERROR";
  }

  const blocked = (parsed.diagnostics ?? []).some(
    (d) => d.category === "lint/style/noRestrictedImports",
  );
  return blocked ? "BLOCKED" : "ALLOWED";
}

let failures = 0;

for (const { domain, specifier, expect, note } of cases) {
  let got;
  try {
    got = classify(specifier);
  } finally {
    try {
      unlinkSync(scratchPath);
    } catch {}
  }

  const ok = got === expect;
  if (!ok) failures++;
  const line = `[${ok ? "OK" : "FAIL"}] ${domain}: ${specifier} -> expected=${expect} got=${got}`;
  console.log(note ? `${line}\n       (${note})` : line);
}

console.log(`\n${cases.length - failures}/${cases.length} domain-isolation checks passed.`);

if (failures > 0) {
  console.error(
    "\nThe biome.json domain-isolation rule is not behaving as expected. This usually means " +
      "either it was split back into multiple overrides for the same rule (only the last one " +
      "wins — see the project-biome-json-editing-gotchas memory), or a glob pattern regressed.",
  );
  process.exit(1);
}

process.exit(0);
