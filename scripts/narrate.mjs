// ABOUTME: Turns src/narration.ts into one MP3 per scene with Gemini's speech model, then writes src/timing.json from the audio lengths.
// ABOUTME: Needs GEMINI_API_KEY in the environment; skips a scene whose MP3 already exists unless FORCE=1.
import { execFileSync } from "node:child_process";
import { existsSync, readFileSync, writeFileSync } from "node:fs";

const src = readFileSync(new URL("../src/narration.ts", import.meta.url), "utf8");
const entries = [...src.matchAll(/^\s{2}(\w+):\n\s+"((?:[^"\\]|\\.)*)",/gm)].map((m) => [m[1], JSON.parse(`"${m[2]}"`)]);
if (!entries.length) throw new Error("no narration found");
const key = process.env.GEMINI_API_KEY;
if (!key) throw new Error("GEMINI_API_KEY is not set");
const MODEL = "gemini-3.8-flash-tts";
const VOICE = "Charon";
const TEMPO = "1.12"; // the model reads at about 140 words a minute; this lands it at a keynote pace
const STYLE = "Read this as a confident conference keynote at a brisk conversational pace, about 165 words per minute: warm, direct, a little dry humor. Short pauses at full stops only.";
const FPS = 30;
const PAD = 24; // frames of air after the voice stops
const timing = {};
for (const [id, text] of entries) {
  const out = new URL(`../public/voice/${id}.mp3`, import.meta.url);
  if (!existsSync(out) || process.env.FORCE === "1") {
    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`, {
      method: "POST",
      headers: { "x-goog-api-key": key, "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: `${STYLE}\n\n${text}` }] }],
        generationConfig: { responseModalities: ["AUDIO"], speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: VOICE } } } },
      }),
    });
    if (!res.ok) throw new Error(`${id}: ${res.status} ${await res.text()}`);
    const data = await res.json();
    const part = data.candidates?.[0]?.content?.parts?.find((p) => p.inlineData);
    if (!part) throw new Error(`${id}: no audio in response`);
    const wav = new URL(`../public/voice/${id}.wav`, import.meta.url);
    writeFileSync(wav, Buffer.from(part.inlineData.data, "base64"));
    execFileSync("ffmpeg", ["-v", "error", "-y", "-i", wav.pathname, "-filter:a", `atempo=${TEMPO}`, "-codec:a", "libmp3lame", "-q:a", "3", out.pathname]);
    execFileSync("rm", [wav.pathname]);
  }
  const seconds = parseFloat(execFileSync("ffprobe", ["-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", out.pathname]).toString());
  timing[id] = { seconds, frames: Math.ceil(seconds * FPS) + PAD };
  console.log(id.padEnd(11), seconds.toFixed(1) + "s", timing[id].frames, "frames");
}
writeFileSync(new URL("../src/timing.json", import.meta.url), JSON.stringify(timing, null, 2) + "\n");
console.log("total", (Object.values(timing).reduce((n, t) => n + t.frames, 0) / FPS / 60).toFixed(2), "min");
