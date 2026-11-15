// ABOUTME: Holds the lockfile clear of dependency versions a security advisory has flagged here.
// ABOUTME: minimatch below 11.0.1 is GHSA-g3hv-75wg-m249 (issue #22); package.json's override keeps it out.
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";

const lock = JSON.parse(readFileSync(new URL("../package-lock.json", import.meta.url), "utf8"));

const atLeast = (version, floor) => {
  const a = version.split(/[.+-]/).slice(0, 3).map(Number);
  const b = floor.split(".").map(Number);
  for (let i = 0; i < 3; i++) if (a[i] !== b[i]) return a[i] > b[i];
  return true;
};

const installed = (name) =>
  Object.entries(lock.packages)
    .filter(([path]) => path === `node_modules/${name}` || path.endsWith(`/node_modules/${name}`))
    .map(([path, entry]) => ({ path, version: entry.version }));

test("every minimatch in the lockfile is 11.0.1 or later (GHSA-g3hv-75wg-m249)", () => {
  const copies = installed("minimatch");
  assert.ok(copies.length > 0, "package-lock.json has no minimatch; the lint toolchain should bring one");
  const flagged = copies.filter(({ version }) => !atLeast(version, "11.0.1"));
  assert.deepEqual(flagged, [], `minimatch below 11.0.1: ${JSON.stringify(flagged)}`);
});

test("the version comparison orders by major, then minor, then patch", () => {
  assert.equal(atLeast("10.2.6", "11.0.1"), false);
  assert.equal(atLeast("11.0.0", "11.0.1"), false);
  assert.equal(atLeast("11.0.1", "11.0.1"), true);
  assert.equal(atLeast("11.0.8", "11.0.1"), true);
  assert.equal(atLeast("12.0.0-rc.1", "11.0.1"), true);
});
