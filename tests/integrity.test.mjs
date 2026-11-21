// ABOUTME: Integration tests across the data files: narration, timing, voice clips, deck.json and the deck's images.
// ABOUTME: They catch a deck re-extracted without re-voicing, a missing clip, or a scene with no timing.
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { test } from "node:test";
import { cueOffset, framesFromCues, timingFromCues } from "../scripts/deck-model.mjs";
import { FPS } from "../scripts/speech.mjs";

const read = (p) => JSON.parse(readFileSync(new URL(`../${p}`, import.meta.url), "utf8"));
const exists = (p) => existsSync(new URL(`../public/${p}`, import.meta.url));

test("every film scene in Film.tsx has narration and timing with matching beats", () => {
  const narration = read("src/narration.json");
  const timing = read("src/timing.json");
  const film = readFileSync(new URL("../src/Film.tsx", import.meta.url), "utf8");
  const ids = [...film.matchAll(/\{ id: "(\w+)", frames: frames\("\1"/g)].map((m) => m[1]);
  assert.ok(ids.length > 0, "no scenes found in Film.tsx");
  for (const id of ids) {
    assert.ok(narration[id], `${id}: no narration`);
    assert.ok(timing[id], `${id}: no timing`);
    assert.equal(timing[id].beats.length, narration[id].length, `${id}: beats and narration differ`);
  }
});

test("every film beat has its voice clip", () => {
  for (const [id, beats] of Object.entries(read("src/narration.json"))) {
    beats.forEach((_, i) => assert.ok(exists(`voice/${id}-${i}.mp3`), `missing voice/${id}-${i}.mp3`));
  }
});

test("every deck slide has notes, timing, and a clip voiced from its current notes", () => {
  const deck = read("src/deck/deck.json");
  const timing = read("src/deck/timing.json");
  assert.equal(timing.slides.length, deck.slides.length, "timing and deck have different slide counts");
  deck.slides.forEach((s, i) => {
    assert.ok(s.notes.trim(), `slide ${s.number}: no speaker notes`);
    const clip = timing.slides[i].clip;
    assert.ok(exists(clip), `slide ${s.number}: missing ${clip}`);
    const hash = createHash("sha1").update(s.notes).digest("hex").slice(0, 8);
    assert.ok(clip.includes(hash), `slide ${s.number}: notes changed since the clip was voiced; run npm run deck:voice`);
  });
});

test("the deck video's track is on disk and each slide's frames come from its cue in the recording", () => {
  const deck = read("src/deck/deck.json");
  const cues = read("src/deck/cues.json");
  const timing = read("src/deck/timing.json");
  assert.equal(cues.slides.length, deck.slides.length, "cues and deck have different slide counts");
  assert.equal(timing.track, cues.track, "timing.json is not on the recording cues.json names; run npm run deck:cues");
  assert.ok(exists(cues.track), `missing ${cues.track}`);
  const frames = framesFromCues(cues.slides.map((s) => s.at), cues.end, FPS);
  assert.deepEqual(timing.slides.map((s) => s.frames), frames, "timing.json is behind cues.json; run npm run deck:cues");
});

test("every cue on the deck video's track is the room recording's cue moved by the lead before the room edit", () => {
  const cues = read("src/deck/cues.json");
  const room = read("src/deck/room-cues.json");
  assert.ok(exists(room.track), `missing ${room.track}`);
  const offset = cueOffset(room.slides, cues.slides);
  // decisions.md, 2026-11-21: the room edit, Angie Jones' introduction, starts 7.14 s into the livestream file.
  assert.equal(offset, 7.14, `the cues are the room's moved by ${offset} s, not the 7.14 s before the room edit starts`);
  // The file ends where the room edit ends, so it is the room edit plus the lead before it, to within a frame.
  assert.ok(Math.abs(cues.end - room.end - offset) < 1 / FPS, `the track is ${cues.end - room.end} s longer than the room edit, not ${offset} s`);
});

test("npm run deck:cues regenerates the timing.json in the repo from cues.json", () => {
  const cues = read("src/deck/cues.json");
  const timing = read("src/deck/timing.json");
  assert.deepEqual(timingFromCues(cues, timing, cues.end, FPS), timing, "timing.json is not what npm run deck:cues writes; run it");
});

test("every deck recording is named in the README, and the foundation's audio is credited with its video and timestamps", () => {
  const readme = readFileSync(new URL("../README.md", import.meta.url), "utf8");
  for (const f of readdirSync(new URL("../public/deck-recording/", import.meta.url))) assert.ok(readme.includes(f), `README does not name deck-recording/${f}`);
  const credits = readme.split("## Credits")[1]?.split("\n## ")[0] ?? "";
  assert.match(credits, /Agentic AI Foundation/, "README's Credits do not name the Agentic AI Foundation");
  assert.match(credits, /https:\/\/www\.youtube\.com\/watch\?v=a8p-Pz1k5l0&t=2806s/, "README's Credits do not link the talk at 46:46 of a8p-Pz1k5l0");
  assert.match(credits, /46:46 to 1:01:57/, "README's Credits do not give the talk's timestamps");
});

test("every image the deck draws is on disk", () => {
  for (const s of read("src/deck/deck.json").slides) {
    for (const e of s.elements) if (e.kind === "image") assert.ok(exists(e.src), `slide ${s.number}: missing ${e.src}`);
  }
});

test("every box the architecture tour names is in the diagram", () => {
  const diagram = read("src/architecture/diagram.json");
  for (const [i, s] of read("src/architecture/tour.json").stops.entries()) {
    for (const f of s.focus) assert.ok(f === "ALL" || diagram.nodes[f] || diagram.zones[f], `stop ${i}: ${f} is not in the diagram`);
  }
  assert.ok(exists("architecture/architecture.png"), "missing the diagram image");
});

test("every architecture stop has a clip voiced from its current text", () => {
  const stops = read("src/architecture/tour.json").stops;
  const timing = read("src/architecture/timing.json");
  assert.equal(timing.stops.length, stops.length, "timing and tour have different stop counts");
  stops.forEach((s, i) => {
    const clip = timing.stops[i].clip;
    assert.ok(exists(clip), `stop ${i}: missing ${clip}`);
    assert.ok(clip.includes(createHash("sha1").update(s.text).digest("hex").slice(0, 8)), `stop ${i}: text changed since the clip was voiced; run npm run architecture:voice`);
  });
});
