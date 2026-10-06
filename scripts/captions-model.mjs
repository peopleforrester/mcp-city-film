// ABOUTME: Builds WebVTT captions from narration stops and their lengths in frames.
// ABOUTME: Splits each stop at sentence ends and gives each cue time in proportion to its length.

const FPS = 30;
const MAX = 84; // characters in a cue, about two lines on a phone

/** A frame count as an HH:MM:SS.mmm WebVTT timestamp. */
export function stamp(frames) {
  const ms = Math.round((frames / FPS) * 1000);
  const p = (n, w = 2) => String(n).padStart(w, "0");
  return `${p(Math.floor(ms / 3600000))}:${p(Math.floor(ms / 60000) % 60)}:${p(Math.floor(ms / 1000) % 60)}.${p(ms % 1000, 3)}`;
}

/** A sentence too long for one cue, split at the comma or colon nearest its middle, or failing that a space, until every piece fits. */
function fit(sentence) {
  if (sentence.length <= MAX) return [sentence];
  const punct = [...sentence.matchAll(/[,:;] /g)].map((m) => m.index + 1);
  // With no comma or colon to split on, the space nearest the middle will do.
  const breaks = punct.length ? punct : [...sentence.matchAll(/ /g)].map((m) => m.index);
  const mid = sentence.length / 2;
  const at = breaks.reduce((best, b) => (Math.abs(b - mid) < Math.abs(best - mid) ? b : best));
  return [...fit(sentence.slice(0, at).trim()), ...fit(sentence.slice(at).trim())];
}

/** Sentences, fitted to the cue length, then joined back up while the joined cue stays short enough to read. */
function cues(text) {
  const out = [];
  for (const s of (text.match(/[^.!?]+[.!?]+["']?|[^.!?]+$/g) ?? [text]).flatMap((x) => fit(x.trim()))) {
    const t = s.trim();
    if (out.length && (out.at(-1) + " " + t).length <= MAX) out[out.length - 1] += " " + t;
    else out.push(t);
  }
  return out;
}

export function vttFromStops(texts, frames) {
  const lines = ["WEBVTT", ""];
  let at = 0;
  texts.forEach((text, i) => {
    const parts = cues(text);
    const total = parts.reduce((n, p) => n + p.length, 0);
    let start = at;
    parts.forEach((p, k) => {
      const end = k === parts.length - 1 ? at + frames[i] : start + Math.round((frames[i] * p.length) / total);
      lines.push(`${stamp(start)} --> ${stamp(end)}`, p, "");
      start = end;
    });
    at += frames[i];
  });
  return lines.join("\n");
}
