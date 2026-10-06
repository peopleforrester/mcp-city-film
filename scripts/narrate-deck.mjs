// ABOUTME: Reads each slide's speaker notes from src/deck/deck.json aloud with Gemini's speech model, one clip per slide.
// ABOUTME: Writes src/deck/timing.json from the clip lengths; needs GEMINI_API_KEY and skips existing clips unless FORCE=1.
import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, statSync, writeFileSync } from "node:fs";

const deck = JSON.parse(readFileSync(new URL("../src/deck/deck.json", import.meta.url), "utf8"));
const key = process.env.GEMINI_API_KEY;
if (!key) throw new Error("GEMINI_API_KEY is not set");
const MODEL = "gemini-3.8-flash-tts";
const VOICE = "Charon"; // the film's voice, so the two pieces sound like one speaker
const TEMPO = "0.9"; // unprompted, the model reads at about 205 words a minute; this lands it near 165, a keynote pace
const FPS = 30;
const LEAD = 6; // frames before the voice starts, so a slide lands before it is spoken about
const TAIL = 12; // frames of air after the voice stops
mkdirSync(new URL("../public/deck-voice/", import.meta.url), { recursive: true });

const slides = [];
for (const s of deck.slides) {
  // A clip is named by its text, so an edited note gets a new clip and an unchanged one is reused.
  const name = `deck-voice/${String(s.number).padStart(2, "0")}-${createHash("sha1").update(s.notes).digest("hex").slice(0, 8)}.mp3`;
  const out = new URL(`../public/${name}`, import.meta.url);
  if (!existsSync(out) || process.env.FORCE === "1") {
    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`, {
      method: "POST",
      headers: { "x-goog-api-key": key, "Content-Type": "application/json" },
      // No style prompt: the model reads an instruction aloud on short passages.
      body: JSON.stringify({ contents: [{ parts: [{ text: s.notes }] }], generationConfig: { responseModalities: ["AUDIO"], speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: VOICE } } } } }),
    });
    if (!res.ok) throw new Error(`slide ${s.number}: ${res.status} ${await res.text()}`);
    const part = (await res.json()).candidates?.[0]?.content?.parts?.find((p) => p.inlineData);
    if (!part) throw new Error(`slide ${s.number}: no audio in response`);
    const wav = new URL(out.href.replace(/\.mp3$/, ".wav"));
    writeFileSync(wav, Buffer.from(part.inlineData.data, "base64"));
    const trim = "silenceremove=start_periods=1:start_threshold=-45dB";
    const encode = (filter) => execFileSync("ffmpeg", ["-v", "error", "-y", "-i", wav.pathname, "-af", filter, "-codec:a", "libmp3lame", "-q:a", "3", out.pathname]);
    encode(`${trim},areverse,${trim},areverse,adelay=${Math.round((LEAD / FPS) * 1000)},atempo=${TEMPO}`);
    if (statSync(out).size < 2000) encode(`atempo=${TEMPO}`);
    execFileSync("rm", [wav.pathname]);
  }
  const seconds = parseFloat(execFileSync("ffprobe", ["-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", out.pathname]).toString());
  slides.push({ frames: Math.ceil(seconds * FPS) + TAIL, clip: name });
  process.stdout.write(`\rslide ${s.number}/${deck.slides.length}`);
}
process.stdout.write("\n");
writeFileSync(new URL("../src/deck/timing.json", import.meta.url), JSON.stringify({ track: null, slides }, null, 1) + "\n");
console.log("total", (slides.reduce((n, s) => n + s.frames, 0) / FPS / 60).toFixed(2), "min");
