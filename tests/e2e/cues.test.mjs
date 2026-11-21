// ABOUTME: End-to-end test of npm run deck:cues' inputs: measures both talk recordings with ffprobe, which the script's own measure matches.
// ABOUTME: Needs ffprobe on PATH; fails if the files on disk no longer match the cues or timing.json is not what the script writes.
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import { cueOffset, timingFromCues } from "../../scripts/deck-model.mjs";
import { FPS, seconds } from "../../scripts/speech.mjs";

const read = (p) => JSON.parse(readFileSync(new URL(`../../${p}`, import.meta.url), "utf8"));
const measure = (track) => seconds(new URL(`../../public/${track}`, import.meta.url));

test("npm run deck:cues, on the measured track, writes the timing.json in the repo", () => {
  const cues = read("src/deck/cues.json");
  const timing = read("src/deck/timing.json");
  assert.deepEqual(timingFromCues(cues, timing, measure(cues.track), FPS), timing, "timing.json is not what npm run deck:cues writes; run it");
});

test("the deck video's track is the room edit with the lead before it, which every cue moves by", () => {
  const cues = read("src/deck/cues.json");
  const room = read("src/deck/room-cues.json");
  const lengthened = measure(cues.track) - measure(room.track);
  const offset = cueOffset(room.slides, cues.slides);
  assert.ok(Math.abs(lengthened - offset) < 1 / FPS, `${cues.track} is ${lengthened} s longer than ${room.track}, but the cues move by ${offset} s`);
});
