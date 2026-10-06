// ABOUTME: Writes out/architecture.en.vtt: one caption cue per tour stop, timed from src/architecture/timing.json.
// ABOUTME: The video burns in no text, so the site's player shows these as closed captions.
import { readFileSync, writeFileSync } from "node:fs";
import { vttFromStops } from "./captions-model.mjs";

const read = (p) => JSON.parse(readFileSync(new URL(`../${p}`, import.meta.url), "utf8"));
const tour = read("src/architecture/tour.json");
const timing = read("src/architecture/timing.json");
writeFileSync(new URL("../out/architecture.en.vtt", import.meta.url), vttFromStops(tour.stops.map((s) => s.text), timing.stops.map((s) => s.frames)));
console.log(`${tour.stops.length} cues`);
