// ABOUTME: Integration tests across the data files: narration, timing, voice clips, deck.json and the deck's images.
// ABOUTME: They catch a deck re-extracted without re-voicing, a missing clip, or a scene with no timing.
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { existsSync, readFileSync } from "node:fs";
import { test } from "node:test";

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

test("every image the deck draws is on disk", () => {
  for (const s of read("src/deck/deck.json").slides) {
    for (const e of s.elements) if (e.kind === "image") assert.ok(exists(e.src), `slide ${s.number}: missing ${e.src}`);
  }
});
