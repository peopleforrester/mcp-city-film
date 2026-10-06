// ABOUTME: End-to-end test: bundles the project, checks every composition's length against its timing, and renders real stills.
// ABOUTME: Slow (about a minute); run with npm run test:e2e.
import assert from "node:assert/strict";
import { mkdtempSync, readFileSync, rmSync, statSync } from "node:fs";
import { after, before, test } from "node:test";
import { bundle } from "@remotion/bundler";
import { getCompositions, renderStill } from "@remotion/renderer";

const read = (p) => JSON.parse(readFileSync(new URL(`../../${p}`, import.meta.url), "utf8"));
let serveUrl;
let comps;
let dir;

before(async () => {
  serveUrl = await bundle({ entryPoint: new URL("../../src/index.ts", import.meta.url).pathname });
  comps = Object.fromEntries((await getCompositions(serveUrl)).map((c) => [c.id, c]));
  dir = mkdtempSync(new URL("../../out/e2e-", import.meta.url).pathname);
});
after(() => rmSync(dir, { recursive: true, force: true }));

test("the narrated film lasts as long as its timing, less the crossfades", () => {
  const timing = read("src/timing.json");
  const scenes = Object.values(timing);
  const expected = scenes.reduce((n, s) => n + s.frames, 0) - 18 * (scenes.length - 1);
  assert.equal(comps.Film.durationInFrames, expected);
});

test("the deck video lasts as long as its slides' timing", () => {
  const expected = read("src/deck/timing.json").slides.reduce((n, s) => n + s.frames, 0);
  assert.equal(comps.Deck.durationInFrames, expected);
});

for (const id of ["Film", "FilmSilent", "Deck", "scene-sayno", "slide-02", "slide-32"]) {
  test(`${id} renders a real frame`, async () => {
    const c = comps[id];
    assert.ok(c, `${id} is not registered`);
    const output = `${dir}/${id}.png`;
    await renderStill({ serveUrl, composition: c, output, frame: Math.floor(c.durationInFrames / 2) });
    assert.ok(statSync(output).size > 20000, `${id}: the still is suspiciously small`);
  });
}
