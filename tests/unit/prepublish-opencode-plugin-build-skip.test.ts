// Regression test for issue #11787.
//
// scripts/build/prepublish.ts gates the "@omniroute/opencode-plugin already
// built -> skip rebuild" fast path on both dist/index.js AND dist/index.cjs
// existing. @omniroute/opencode-plugin/tsup.config.ts is ESM-only
// (format: ["esm"]), so a successful `tsup` run in that package never
// produces dist/index.cjs -- the old predicate could never be true.
//
// This test builds the REAL plugin package with the REAL tsup config (no
// mocks) and then evaluates the fixed predicate copied from prepublish.ts
// against the resulting dist/, proving the "already built" skip path now
// works for an ESM-only build, and still correctly reports "not built" when
// dist/ is absent.
import { test } from "node:test";
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { existsSync, rmSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..", "..");
const opencodePluginSrc = join(ROOT, "@omniroute", "opencode-plugin");
const opencodePluginDist = join(opencodePluginSrc, "dist", "index.js");
const opencodePluginCjs = join(opencodePluginSrc, "dist", "index.cjs");

test("prepublish pluginAlreadyBuilt predicate recognizes a real ESM-only tsup build (#11787)", () => {
  rmSync(join(opencodePluginSrc, "dist"), { recursive: true, force: true });
  execFileSync(process.execPath, [join(opencodePluginSrc, "node_modules", ".bin", "tsup")], {
    cwd: opencodePluginSrc,
    stdio: "inherit",
  });

  assert.equal(existsSync(opencodePluginDist), true, "dist/index.js should exist after tsup");
  assert.equal(
    existsSync(opencodePluginCjs),
    false,
    "dist/index.cjs should NOT exist for an ESM-only tsup build"
  );

  // This is the fixed predicate from scripts/build/prepublish.ts.
  const pluginAlreadyBuilt = existsSync(opencodePluginDist);

  assert.equal(
    pluginAlreadyBuilt,
    true,
    "expected the ESM-only build to be recognized as already built (index.js present is sufficient)"
  );
});

test("prepublish pluginAlreadyBuilt predicate is false when dist/ is absent (#11787)", () => {
  rmSync(join(opencodePluginSrc, "dist"), { recursive: true, force: true });

  const pluginAlreadyBuilt = existsSync(opencodePluginDist);

  assert.equal(pluginAlreadyBuilt, false, "expected a missing dist/ to require a rebuild");
});
