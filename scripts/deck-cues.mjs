// ABOUTME: Reads src/deck/cues.json, the deck video's recording and the second each slide comes up in it, and checks it against that file.
// ABOUTME: npm run deck:cues writes timing.json from what readCues returns; the tests read the cues the same way.
import { readFileSync } from "node:fs";
import { framesFromCues, mp3Seconds } from "./deck-model.mjs";
import { FPS } from "./speech.mjs";

const CUES = new URL("../src/deck/cues.json", import.meta.url);

/**
 * The deck's cues, with the recording's measured length as `seconds` and each slide's frames on it.
 * Refuses a track that is not on disk under public/, or one whose length is not the cues' `end` to within 0.05 s.
 */
export function readCues(cues = JSON.parse(readFileSync(CUES, "utf8"))) {
  const seconds = mp3Seconds(readFileSync(new URL(`../public/${cues.track}`, import.meta.url)));
  if (Math.abs(seconds - cues.end) > 0.05) throw new Error(`${cues.track} is ${seconds} s long, but cues.json says it ends at ${cues.end} s`);
  return { ...cues, seconds, frames: framesFromCues(cues.slides.map((s) => s.at), cues.end, FPS) };
}
