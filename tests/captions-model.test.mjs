// ABOUTME: Unit tests for building a WebVTT captions file from narration stops and their lengths in frames.
// ABOUTME: Long passages split into cues of at most two short lines, each holding its share of the stop's time.
import assert from "node:assert/strict";
import { test } from "node:test";
import { stamp, vttFromStops } from "../scripts/captions-model.mjs";

test("a frame count at 30 fps becomes a WebVTT timestamp", () => {
  assert.equal(stamp(0), "00:00:00.000");
  assert.equal(stamp(30 * 61 + 15), "00:01:01.500");
});

test("each stop's cues run back to back from where the stop starts", () => {
  const vtt = vttFromStops(["One.", "Two."], [30, 60]);
  assert.match(vtt, /^WEBVTT\n/);
  assert.match(vtt, /00:00:00\.000 --> 00:00:01\.000\nOne\./);
  assert.match(vtt, /00:00:01\.000 --> 00:00:03\.000\nTwo\./);
});

test("a long passage splits at sentences into cues that share the stop's time by length", () => {
  const vtt = vttFromStops(["A short one. And then a much longer sentence that keeps going for quite a while past the limit."], [90]);
  const cues = vtt.trim().split("\n\n").slice(1);
  assert.equal(cues.length, 2);
  assert.match(cues[0], /^00:00:00\.000 --> 00:00:00\.\d{3}\nA short one\.$/);
  assert.match(cues[1], /--> 00:00:03\.000\nAnd then/);
});

test("a sentence too long for one cue splits at the comma or colon nearest its middle", () => {
  const long = "Four zones: the managed device, tool traffic through the tool gateway, model traffic through the model gateway, and the control plane of identity, registry, audit and device policy.";
  const cues = vttFromStops([long], [300]).trim().split("\n\n").slice(1).map((c) => c.split("\n")[1]);
  assert.ok(cues.length > 1, "the sentence was not split");
  for (const c of cues) assert.ok(c.length <= 84, `cue too long: ${c}`);
  assert.equal(cues.join(" "), long);
});

test("a long sentence with no comma splits at a space", () => {
  const long = "Outlook was reached by a script the agent wrote against the mail client's own automation interface";
  const cues = vttFromStops([long], [120]).trim().split("\n\n").slice(1).map((c) => c.split("\n")[1]);
  assert.equal(cues.length, 2);
  for (const c of cues) assert.ok(c.length <= 84, `cue too long: ${c}`);
  assert.equal(cues.join(" "), long);
});
