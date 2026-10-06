// ABOUTME: Unit tests for how the deck video decides an element is new on a slide or carried over from the last one.
// ABOUTME: Carried-over elements hold still, so a build adds only what is new; layout chrome and empty boxes never animate.
import assert from "node:assert/strict";
import { test } from "node:test";
import { freshElements, signature } from "../src/deck/signature.ts";
import type { Element } from "../src/deck/types.ts";

const text = (id: string, t: string, x = 100): Element => ({ id, layer: "slide", kind: "shape", shape: "TEXT_BOX", x, y: 100, w: 400, h: 60, fill: null, outline: null, valign: "TOP", paragraphs: [{ align: "START", lineSpacing: 100, spaceAbove: 0, spaceBelow: 0, indentStart: 0, indentFirstLine: 0, bullet: null, runs: [{ text: t, color: "#000000", size: 20, bold: false, italic: false, underline: false, font: "Arial", weight: 400, baseline: "NONE" }] }] });
const image = (id: string, src: string): Element => ({ id, layer: "slide", kind: "image", x: 10, y: 10, w: 100, h: 100, src, crop: { l: 0, r: 0, t: 0, b: 0 } });

test("the same text in the same place under a different id is the same element", () => {
  assert.equal(signature(text("a", "428")), signature(text("b", "428")));
});

test("moved or changed elements are different", () => {
  assert.notEqual(signature(text("a", "428")), signature(text("a", "428", 300)));
  assert.notEqual(signature(text("a", "428")), signature(text("a", "1,014")));
  assert.notEqual(signature(image("a", "deck/1.png")), signature(image("a", "deck/2.png")));
});

test("only elements new to the slide animate", () => {
  const before = [text("t", "Title"), image("ship", "deck/enterprise.png")];
  const after = [text("t2", "Title"), image("ship2", "deck/enterprise.png"), image("new", "deck/enterprise-d.png")];
  const held = new Set(before.map(signature));
  assert.deepEqual(freshElements(after, held).map((e) => e.id), ["new"]);
});

test("layout chrome and empty text boxes never animate", () => {
  const chrome: Element = { ...image("logo", "deck/logo.png"), layer: "layout" };
  const empty = text("e", "   ");
  assert.deepEqual(freshElements([chrome, empty, text("t", "Hello")], new Set()).map((e) => e.id), ["t"]);
});
