// ABOUTME: Unit tests for reading box and zone geometry out of the site's Mermaid-rendered architecture SVG.
// ABOUTME: Rect boxes carry their size; cylinder boxes carry it in the offset of their outline path.
import assert from "node:assert/strict";
import { test } from "node:test";
import { parseDiagram, unionBox } from "../scripts/architecture-model.mjs";

const SVG = `<svg id="arch" viewBox="0 0 3572.9 1238.8">
<g class="cluster" id="arch-DEV" data-look="classic"><rect style="fill:#ffe4ea" x="535.1" y="505.5" width="781.8" height="574.0"></rect></g>
<g class="node default toolgw" id="arch-flowchart-G-7" data-look="classic" transform="translate(2131.8, 416.75)"><rect class="basic label-container" x="-128" y="-108.5" width="256" height="217"></rect></g>
<g class="node default regmcp" id="arch-flowchart-R-16" data-look="classic" transform="translate(160, 723.3)"><path d="M0,15 a107,15 0,0,0 214,0" class="basic label-container outer-path" transform="translate(-107, -77.9)"></path></g>
</svg>`;

test("the view box is the diagram's size", () => {
  const d = parseDiagram(SVG);
  assert.equal(d.width, 3572.9);
  assert.equal(d.height, 1238.8);
});

test("a rect box is its center plus its own rect", () => {
  assert.deepEqual(parseDiagram(SVG).nodes.G, { x: 2131.8 - 128, y: 416.75 - 108.5, w: 256, h: 217 });
});

test("a cylinder box takes its size from its outline's offset", () => {
  const r = parseDiagram(SVG).nodes.R;
  assert.equal(r.x, 160 - 107);
  assert.ok(Math.abs(r.y - (723.3 - 77.9)) < 1e-9);
  assert.equal(r.w, 214);
  assert.ok(Math.abs(r.h - 155.8) < 1e-9);
});

test("a zone is its cluster rect, keyed by the Mermaid subgraph id", () => {
  assert.deepEqual(parseDiagram(SVG).zones.DEV, { x: 535.1, y: 505.5, w: 781.8, h: 574.0 });
});

test("the union of boxes covers them all", () => {
  assert.deepEqual(unionBox([{ x: 0, y: 10, w: 10, h: 10 }, { x: 20, y: 0, w: 5, h: 5 }]), { x: 0, y: 0, w: 25, h: 20 });
});
