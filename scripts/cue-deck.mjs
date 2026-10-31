// ABOUTME: Puts the deck video on the talk recording: reads src/deck/cues.json, the second each slide comes up in the recording.
// ABOUTME: Writes src/deck/timing.json with the recording as the track and each slide's frames; the per-slide clips stay for the synthetic cut.
import { readFileSync, writeFileSync } from "node:fs";
import { FPS, seconds } from "./speech.mjs";
import { framesFromCues } from "./deck-model.mjs";

const read = (p) => JSON.parse(readFileSync(new URL(`../${p}`, import.meta.url), "utf8"));
const cues = read("src/deck/cues.json");
const timing = read("src/deck/timing.json");
if (cues.slides.length !== timing.slides.length) throw new Error(`cues.json has ${cues.slides.length} slides, timing.json ${timing.slides.length}`);

const length = seconds(new URL(`../public/${cues.track}`, import.meta.url));
if (Math.abs(length - cues.end) > 0.05) throw new Error(`${cues.track} is ${length} s long, but cues.json says it ends at ${cues.end} s`);

const frames = framesFromCues(cues.slides.map((s) => s.at), cues.end, FPS);
const slides = timing.slides.map((s, i) => ({ ...s, frames: frames[i] }));
writeFileSync(new URL("../src/deck/timing.json", import.meta.url), JSON.stringify({ track: cues.track, slides }, null, 1) + "\n");
console.log("track", cues.track, "total", (frames.reduce((n, f) => n + f, 0) / FPS / 60).toFixed(2), "min");
