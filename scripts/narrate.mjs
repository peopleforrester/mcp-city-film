// ABOUTME: Turns src/narration.json into one MP3 per beat with the shared voice, then writes src/timing.json from the audio lengths.
// ABOUTME: Needs GEMINI_API_KEY in the environment; skips a beat whose MP3 already exists unless FORCE=1.
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { FPS, seconds, speak } from "./speech.mjs";

const narration = JSON.parse(readFileSync(new URL("../src/narration.json", import.meta.url), "utf8"));
const GAP = 5; // frames of air between beats
const PAD = 20; // frames of air after the last beat
const timing = {};
let total = 0;
for (const [id, beats] of Object.entries(narration)) {
  const frames = [];
  for (let i = 0; i < beats.length; i++) {
    const out = new URL(`../public/voice/${id}-${i}.mp3`, import.meta.url);
    if (!existsSync(out) || process.env.FORCE === "1") await speak(beats[i], out);
    frames.push(Math.ceil(seconds(out) * FPS) + GAP);
  }
  const scene = frames.reduce((n, f) => n + f, 0) + PAD;
  timing[id] = { frames: scene, beats: frames };
  total += scene;
  console.log(id.padEnd(9), String(beats.length).padStart(2), "beats", (scene / FPS).toFixed(1) + "s");
}
writeFileSync(new URL("../src/timing.json", import.meta.url), JSON.stringify(timing) + "\n");
console.log("total", (total / FPS / 60).toFixed(2), "min");
