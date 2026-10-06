// ABOUTME: Reads each stop of the architecture tour aloud with the shared voice, one clip per stop.
// ABOUTME: Writes src/architecture/timing.json; a clip is named by its text, so an edited stop gets a new clip.
import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { FPS, seconds, speak } from "./speech.mjs";

const tour = JSON.parse(readFileSync(new URL("../src/architecture/tour.json", import.meta.url), "utf8"));
const LEAD = 10; // frames for the camera to start moving before the voice names the box
const TAIL = 10; // frames of air after the voice stops
mkdirSync(new URL("../public/architecture-voice/", import.meta.url), { recursive: true });

const stops = [];
for (const [i, s] of tour.stops.entries()) {
  const name = `architecture-voice/${String(i).padStart(2, "0")}-${createHash("sha1").update(s.text).digest("hex").slice(0, 8)}.mp3`;
  const out = new URL(`../public/${name}`, import.meta.url);
  if (!existsSync(out) || process.env.FORCE === "1") await speak(s.text, out, { lead: LEAD });
  stops.push({ frames: Math.ceil(seconds(out) * FPS) + TAIL, clip: name });
  process.stdout.write(`\rstop ${i + 1}/${tour.stops.length}`);
}
process.stdout.write("\n");
writeFileSync(new URL("../src/architecture/timing.json", import.meta.url), JSON.stringify({ stops }, null, 1) + "\n");
console.log("total", (stops.reduce((n, s) => n + s.frames, 0) / FPS / 60).toFixed(2), "min");
