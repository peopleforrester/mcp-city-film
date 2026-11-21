// ABOUTME: Puts the deck video on the talk recording: reads src/deck/cues.json, the second each slide comes up in the recording.
// ABOUTME: Writes src/deck/timing.json with the recording as the track and each slide's frames; the per-slide clips stay for the synthetic cut.
import { readFileSync, writeFileSync } from "node:fs";
import { readCues } from "./deck-cues.mjs";
import { cueOffset, timingFromCues } from "./deck-model.mjs";
import { FPS } from "./speech.mjs";

const read = (p) => JSON.parse(readFileSync(new URL(`../${p}`, import.meta.url), "utf8"));
const cues = readCues();
// The room recording's cues, which the transcript is timed on; any other recording of the delivery is those cues moved by one offset.
const room = read("src/deck/room-cues.json");
const offset = cueOffset(room.slides, cues.slides);

const timing = timingFromCues(cues, read("src/deck/timing.json"), cues.seconds, FPS);
writeFileSync(new URL("../src/deck/timing.json", import.meta.url), JSON.stringify(timing, null, 1) + "\n");
console.log("track", cues.track, "offset from the room", offset, "s, total", (timing.slides.reduce((n, s) => n + s.frames, 0) / FPS / 60).toFixed(2), "min");
