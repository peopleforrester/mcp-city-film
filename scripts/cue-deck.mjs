// ABOUTME: Puts the deck video on the talk recording: reads src/deck/cues.json, the second each slide comes up in the recording.
// ABOUTME: Writes src/deck/timing.json with the recording as the track and each slide's frames; the per-slide clips stay for the synthetic cut.
import { readFileSync, writeFileSync } from "node:fs";
import { readCues } from "./deck-cues.mjs";
import { FPS } from "./speech.mjs";

const cues = readCues();
const timing = JSON.parse(readFileSync(new URL("../src/deck/timing.json", import.meta.url), "utf8"));
if (cues.slides.length !== timing.slides.length) throw new Error(`cues.json has ${cues.slides.length} slides, timing.json ${timing.slides.length}`);

const slides = timing.slides.map((s, i) => ({ ...s, frames: cues.frames[i] }));
writeFileSync(new URL("../src/deck/timing.json", import.meta.url), JSON.stringify({ track: cues.track, slides }, null, 1) + "\n");
console.log("track", cues.track, "total", (cues.frames.reduce((n, f) => n + f, 0) / FPS / 60).toFixed(2), "min");
