// ABOUTME: The one voice of the film, the deck video and the architecture video: Gemini speech, trimmed and paced.
// ABOUTME: speak() writes an MP3 for a passage; seconds() reads a clip's length. Needs GEMINI_API_KEY.
import { execFileSync } from "node:child_process";
import { statSync, unlinkSync, writeFileSync } from "node:fs";

const MODEL = "gemini-3.8-flash-tts";
const VOICE = "Sulafat"; // a woman's voice: median pitch 186 Hz on a full slide of notes, the highest of four measured
const TEMPO = "0.97"; // Sulafat reads a full passage at about 170 words a minute; this lands it near 165, a keynote pace
export const FPS = 30;

/**
 * Reads `text` aloud into the MP3 at `out` (a file URL). `lead` frames of silence go before the voice.
 * No style prompt is sent: on a short passage the model reads an instruction aloud.
 */
export async function speak(text, out, { lead = 0 } = {}) {
  const key = process.env.GEMINI_API_KEY;
  if (!key) throw new Error("GEMINI_API_KEY is not set");
  const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`, {
    method: "POST",
    headers: { "x-goog-api-key": key, "Content-Type": "application/json" },
    body: JSON.stringify({ contents: [{ parts: [{ text }] }], generationConfig: { responseModalities: ["AUDIO"], speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: VOICE } } } } }),
  });
  if (!res.ok) throw new Error(`${out.pathname}: ${res.status} ${await res.text()}`);
  const part = (await res.json()).candidates?.[0]?.content?.parts?.find((p) => p.inlineData);
  if (!part) throw new Error(`${out.pathname}: no audio in response`);
  const wav = out.pathname.replace(/\.mp3$/, ".wav");
  writeFileSync(wav, Buffer.from(part.inlineData.data, "base64"));
  const encode = (filter) => execFileSync("ffmpeg", ["-v", "error", "-y", "-i", wav, "-af", filter, "-codec:a", "libmp3lame", "-q:a", "3", out.pathname]);
  // Trim leading silence, then the trailing silence by reversing, so pauses inside the clip are kept.
  const trim = "silenceremove=start_periods=1:start_threshold=-45dB";
  const delay = lead ? `adelay=${Math.round((lead / FPS) * 1000)},` : "";
  encode(`${trim},areverse,${trim},areverse,${delay}atempo=${TEMPO}`);
  // A very short or quiet clip can be trimmed to nothing; keep it whole rather than lose it.
  if (statSync(out).size < 2000) encode(`${delay}atempo=${TEMPO}`);
  unlinkSync(wav);
}

/** A clip's length in seconds. */
export function seconds(out) {
  return parseFloat(execFileSync("ffprobe", ["-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", out.pathname]).toString());
}
