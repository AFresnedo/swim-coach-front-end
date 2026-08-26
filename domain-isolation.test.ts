import { readdirSync, readFileSync, statSync } from "node:fs";
import { dirname, join, relative } from "node:path";
import ts from "typescript";
import { describe, expect, it } from "vitest";

const REPO_ROOT = __dirname;
const SKIP_DIRS = new Set(["node_modules", ".next", ".git", "out", "build", "test-results"]);

type Domain = {
  name: string;
  root: string;
  // Domains with an exclusive route subtree (nothing else lives under root) grant
  // ownership of every file under it. "home" has no exclusive subtree of its own —
  // its private folders sit directly inside the shared app/ root alongside every
  // other domain's route folder — so it lists its one owned file explicitly instead.
  exclusiveRoot: boolean;
  ownedFiles?: string[];
  // Private paths (relative to root) that outside files may import anyway — e.g. a
  // route's entry-point component. Tests are colocated inside the domain they cover,
  // so they never need an entry here; this is only for genuine non-test exceptions.
  exceptions?: string[];
};

const DOMAINS: Domain[] = [
  {
    name: "swim-log",
    root: "app/swim-log",
    exclusiveRoot: true,
  },
  {
    name: "goals",
    root: "app/goals",
    exclusiveRoot: true,
  },
  {
    name: "profile",
    root: "app/profile",
    exclusiveRoot: true,
  },
  {
    name: "(auth)/sign-up",
    root: "app/(auth)/sign-up",
    exclusiveRoot: true,
  },
  {
    name: "strokes/[stroke]",
    root: "app/strokes/[stroke]",
    exclusiveRoot: true,
  },
  {
    name: "home",
    root: "app",
    exclusiveRoot: false,
    ownedFiles: ["app/page"],
  },
];

function listSourceFiles(dir: string): string[] {
  const files: string[] = [];
  for (const entry of readdirSync(dir)) {
    if (SKIP_DIRS.has(entry) || entry.startsWith(".")) continue;
    const fullPath = join(dir, entry);
    if (statSync(fullPath).isDirectory()) {
      files.push(...listSourceFiles(fullPath));
    } else if (/\.(ts|tsx)$/.test(entry)) {
      files.push(fullPath);
    }
  }
  return files;
}

function stripExtension(path: string): string {
  return path.replace(/\.(ts|tsx)$/, "");
}

function importSpecifiers(filePath: string): string[] {
  const sourceText = readFileSync(filePath, "utf8");
  const sourceFile = ts.createSourceFile(filePath, sourceText, ts.ScriptTarget.Latest, true);
  const specifiers: string[] = [];

  function visit(node: ts.Node) {
    if (
      (ts.isImportDeclaration(node) || ts.isExportDeclaration(node)) &&
      node.moduleSpecifier &&
      ts.isStringLiteral(node.moduleSpecifier)
    ) {
      specifiers.push(node.moduleSpecifier.text);
    }
    ts.forEachChild(node, visit);
  }
  visit(sourceFile);
  return specifiers;
}

// Resolves an import specifier to a repo-relative, extensionless path, or null for a
// bare package specifier (e.g. "react") that can't reach into app/.
function resolveSpecifier(specifier: string, importerRelPath: string): string | null {
  if (specifier.startsWith("@/")) return specifier.slice(2);
  if (specifier.startsWith(".")) return stripExtension(join(dirname(importerRelPath), specifier));
  return null;
}

function privateAreaOf(domain: Domain, targetPath: string): boolean {
  const prefix = `${domain.root}/`;
  if (!targetPath.startsWith(prefix)) return false;
  return targetPath.slice(prefix.length).split("/")[0].startsWith("_");
}

function belongsToDomain(domain: Domain, importerPath: string): boolean {
  if (privateAreaOf(domain, importerPath)) return true;
  if (domain.exclusiveRoot) {
    return importerPath === domain.root || importerPath.startsWith(`${domain.root}/`);
  }
  return (domain.ownedFiles ?? []).includes(importerPath);
}

describe("domain isolation", () => {
  it("blocks outside files from importing a domain's private implementation", () => {
    const violations: string[] = [];

    for (const absPath of listSourceFiles(REPO_ROOT)) {
      const importerRelPath = stripExtension(relative(REPO_ROOT, absPath));

      for (const specifier of importSpecifiers(absPath)) {
        const target = resolveSpecifier(specifier, importerRelPath);
        if (!target) continue;

        for (const domain of DOMAINS) {
          if (!privateAreaOf(domain, target)) continue;
          if (belongsToDomain(domain, importerRelPath)) break;

          const isException = (domain.exceptions ?? []).some(
            (e) => `${domain.root}/${e}` === target,
          );
          if (!isException) {
            violations.push(`${importerRelPath} imports ${target} (private to ${domain.name})`);
          }
          break;
        }
      }
    }

    expect(violations).toEqual([]);
  });
});
