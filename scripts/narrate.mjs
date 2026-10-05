// ABOUTME: Turns src/narration.json into one MP3 per beat with Gemini's speech model, then writes src/timing.json from the audio lengths.
// ABOUTME: Needs GEMINI_API_KEY in the environment; skips a beat whose MP3 already exists unless FORCE=1.
import { execFileSync } from "node:child_process";
import { existsSync, readFileSync, statSync, writeFileSync } from "node:fs";

const narration = JSON.parse(readFileSync(new URL("../src/narration.json", import.meta.url), "utf8"));
const key = process.env.GEMINI_API_KEY;
if (!key) throw new Error("GEMINI_API_KEY is not set");
const MODEL = "gemini-3.8-flash-tts";
const VOICE = "Charon";
const TEMPO = "1.12"; // the model reads at about 140 words a minute; this lands it at a keynote pace
// No style prompt: on a short beat the model reads the instruction aloud. The pace comes from the tempo filter.
const FPS = 30;
const GAP = 5; // frames of air between beats
const PAD = 20; // frames of air after the last beat
const timing = {};
let total = 0;
for (const [id, beats] of Object.entries(narration)) {
  const frames = [];
  for (let i = 0; i < beats.length; i++) {
    const out = new URL(`../public/voice/${id}-${i}.mp3`, import.meta.url);
    if (!existsSync(out) || process.env.FORCE === "1") {
      const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`, {
        method: "POST",
        headers: { "x-goog-api-key": key, "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: beats[i] }] }],
          generationConfig: { responseModalities: ["AUDIO"], speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: VOICE } } } },
        }),
      });
      if (!res.ok) throw new Error(`${id}-${i}: ${res.status} ${await res.text()}`);
      const data = await res.json();
      const part = data.candidates?.[0]?.content?.parts?.find((p) => p.inlineData);
      if (!part) throw new Error(`${id}-${i}: no audio in response`);
      const wav = new URL(`../public/voice/${id}-${i}.wav`, import.meta.url);
      writeFileSync(wav, Buffer.from(part.inlineData.data, "base64"));
      // Trim the silence the model leaves at either end, then set the pace.
      const encode = (filter) => execFileSync("ffmpeg", ["-v", "error", "-y", "-i", wav.pathname, "-af", filter, "-codec:a", "libmp3lame", "-q:a", "3", out.pathname]);
      // Trim leading silence, then the trailing silence by reversing, so pauses inside the clip are kept.
      const trim = "silenceremove=start_periods=1:start_threshold=-45dB";
      encode(`${trim},areverse,${trim},areverse,atempo=${TEMPO}`);
      // A very short or quiet clip can be trimmed to nothing; keep it whole rather than lose it.
      if (statSync(out).size < 2000) encode(`atempo=${TEMPO}`);
      execFileSync("rm", [wav.pathname]);
    }
    const seconds = parseFloat(execFileSync("ffprobe", ["-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", out.pathname]).toString());
    frames.push(Math.ceil(seconds * FPS) + GAP);
  }
  const scene = frames.reduce((n, f) => n + f, 0) + PAD;
  timing[id] = { frames: scene, beats: frames };
  total += scene;
  console.log(id.padEnd(9), String(beats.length).padStart(2), "beats", (scene / FPS).toFixed(1) + "s");
}
writeFileSync(new URL("../src/timing.json", import.meta.url), JSON.stringify(timing) + "\n");
console.log("total", (total / FPS / 60).toFixed(2), "min");
