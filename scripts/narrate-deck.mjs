// ABOUTME: Reads each slide's speaker notes from src/deck/deck.json aloud with the shared voice, one clip per slide.
// ABOUTME: Writes src/deck/timing.json from the clip lengths; needs GEMINI_API_KEY and skips existing clips unless FORCE=1.
import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { FPS, seconds, speak } from "./speech.mjs";

const deck = JSON.parse(readFileSync(new URL("../src/deck/deck.json", import.meta.url), "utf8"));
const LEAD = 6; // frames before the voice starts, so a slide lands before it is spoken about
const TAIL = 12; // frames of air after the voice stops
mkdirSync(new URL("../public/deck-voice/", import.meta.url), { recursive: true });

const slides = [];
for (const s of deck.slides) {
  // A clip is named by its text, so an edited note gets a new clip and an unchanged one is reused.
  const name = `deck-voice/${String(s.number).padStart(2, "0")}-${createHash("sha1").update(s.notes).digest("hex").slice(0, 8)}.mp3`;
  const out = new URL(`../public/${name}`, import.meta.url);
  if (!existsSync(out) || process.env.FORCE === "1") await speak(s.notes, out, { lead: LEAD });
  slides.push({ frames: Math.ceil(seconds(out) * FPS) + TAIL, clip: name });
  process.stdout.write(`\rslide ${s.number}/${deck.slides.length}`);
}
process.stdout.write("\n");
writeFileSync(new URL("../src/deck/timing.json", import.meta.url), JSON.stringify({ track: null, slides }, null, 1) + "\n");
console.log("total", (slides.reduce((n, s) => n + s.frames, 0) / FPS / 60).toFixed(2), "min");
