// ABOUTME: Renders the settled last frame of every deck slide to out/deck-stills/, bundling once, for checking against the deck.
// ABOUTME: Run after extract-deck.mjs; prints one line per slide as it goes.
import { mkdirSync } from "node:fs";
import { bundle } from "@remotion/bundler";
import { renderStill, selectComposition } from "@remotion/renderer";

const serveUrl = await bundle({ entryPoint: new URL("../src/index.ts", import.meta.url).pathname });
const outDir = new URL("../out/deck-stills/", import.meta.url).pathname;
mkdirSync(outDir, { recursive: true });
const only = process.argv.slice(2);
for (let n = 1; n <= 99; n++) {
  const id = `slide-${String(n).padStart(2, "0")}`;
  if (only.length && !only.includes(String(n))) continue;
  let composition;
  try {
    composition = await selectComposition({ serveUrl, id });
  } catch {
    break;
  }
  await renderStill({ serveUrl, composition, output: `${outDir}${id}.png`, frame: composition.durationInFrames - 1 });
  console.log(id);
}
