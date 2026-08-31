/**
 * Fast syntax gate: parses every TS/TSX file with the TypeScript compiler and
 * reports syntactic diagnostics. This is NOT a substitute for `npm run
 * typecheck` — it exists so syntax errors are caught even in environments
 * where dependencies cannot be installed.
 */
import { createRequire } from "node:module";
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";

const require = createRequire(import.meta.url);
let ts;
try {
  ts = require("typescript");
} catch {
  ts = require(process.env.TS_FALLBACK ?? "/home/claude/.npm-global/lib/node_modules/typescript");
}

const ROOTS = ["src", "sanity", "tests", "."];
const files = [];

function walk(dir, depth = 0) {
  for (const entry of readdirSync(dir)) {
    if (["node_modules", ".next", ".git", "dist"].includes(entry)) continue;
    const full = join(dir, entry);
    const st = statSync(full);
    if (st.isDirectory()) {
      if (depth === 0 && !ROOTS.includes(entry) && dir === ".") continue;
      walk(full, depth + 1);
    } else if (/\.(ts|tsx)$/.test(entry)) {
      files.push(full);
    }
  }
}
walk(".");

let failures = 0;
for (const file of files) {
  const text = readFileSync(file, "utf8");
  const source = ts.createSourceFile(
    file,
    text,
    ts.ScriptTarget.ES2022,
    true,
    file.endsWith(".tsx") ? ts.ScriptKind.TSX : ts.ScriptKind.TS,
  );
  const diags = source.parseDiagnostics ?? [];
  if (diags.length > 0) {
    failures++;
    for (const d of diags.slice(0, 5)) {
      const { line, character } = source.getLineAndCharacterOfPosition(d.start ?? 0);
      console.error(
        `${file}:${line + 1}:${character + 1} — ${ts.flattenDiagnosticMessageText(d.messageText, " ")}`,
      );
    }
  }
}

console.log(`Checked ${files.length} files; ${failures} with syntax errors.`);
process.exit(failures > 0 ? 1 : 0);
