// ABOUTME: Unit tests for the rules that turn Slides API JSON into deck.json geometry and styles.
// ABOUTME: Each case is a defect found against the real deck: omitted zero scales, transparent layouts, inherited title styles.
import assert from "node:assert/strict";
import { test } from "node:test";
import { createDeckModel } from "../scripts/deck-model.mjs";

const EMU_W = 9144000;
const pres = {
  pageSize: { width: { magnitude: EMU_W, unit: "EMU" }, height: { magnitude: 5143500, unit: "EMU" } },
  masters: [{
    objectId: "m",
    pageProperties: { colorScheme: { colors: [{ type: "DARK1", color: {} }, { type: "LIGHT1", color: { red: 1, green: 1, blue: 1 } }] } },
    pageElements: [{ objectId: "mt", shape: { placeholder: { type: "TITLE" }, text: { textElements: [{ paragraphMarker: { style: { alignment: "START" } } }, { textRun: { content: "x", style: { fontSize: { magnitude: 30, unit: "PT" }, fontFamily: "Arial", bold: true } } }] } } }],
  }],
  layouts: [{
    objectId: "l",
    pageElements: [{ objectId: "lt", shape: { placeholder: { type: "TITLE", parentObjectId: "mt" }, shapeProperties: { contentAlignment: "MIDDLE" }, text: { textElements: [{ textRun: { content: "x", style: { fontSize: { magnitude: 24, unit: "PT" }, fontFamily: "Red Hat Display", foregroundColor: { opaqueColor: { themeColor: "LIGHT1" } } } } }] } } }],
  }],
};
const m = createDeckModel(pres);
const PX = 1920 / EMU_W;

test("a transform with no scaleY is a flat line, because the API omits zeros", () => {
  const b = m.box({ size: { width: { magnitude: 3000000 }, height: { magnitude: 3000000 } }, transform: { scaleX: 0.1, translateX: 1000, translateY: 2000 } });
  assert.equal(b.h, 0);
  assert.ok(Math.abs(b.w - 300000 * PX) < 1e-9);
  assert.ok(Math.abs(b.x - 1000 * PX) < 1e-9);
});

test("an element with no transform keeps its size", () => {
  const b = m.box({ size: { width: { magnitude: EMU_W }, height: { magnitude: 1000 } } });
  assert.ok(Math.abs(b.w - 1920) < 1e-9);
  assert.equal(b.x, 0);
});

test("a theme color with missing channels reads them as zero", () => {
  assert.equal(m.color({ themeColor: "DARK1" }), "#000000");
  assert.equal(m.color({ opaqueColor: { themeColor: "LIGHT1" } }), "#ffffff");
  assert.equal(m.color({ rgbColor: { red: 1, green: 0.78431374 } }), "#ffc800");
});

test("a transparent page background is the white Slides draws beneath it", () => {
  const navy = { rgbColor: { red: 0.019607844, green: 0.09803922, blue: 0.19607843 } };
  assert.equal(m.background({ pageProperties: { pageBackgroundFill: { solidFill: { color: navy, alpha: 0 } } } }), "#ffffff");
  assert.equal(m.background({ pageProperties: { pageBackgroundFill: { solidFill: { color: navy, alpha: 1 } } } }), "#051932");
  assert.equal(m.background({ pageProperties: { pageBackgroundFill: { propertyState: "INHERIT" } } }), null);
});

test("a placeholder run with no style inherits size, font and color from layout and master", () => {
  const el = { objectId: "s", shape: { placeholder: { type: "TITLE", parentObjectId: "lt" }, text: { textElements: [{ paragraphMarker: { style: {} } }, { textRun: { content: "Title\n", style: {} } }] } } };
  const base = m.inherited(el);
  assert.equal(base.valign, "MIDDLE");
  const [p] = m.textRuns(el.shape.text, base);
  const [r] = p.runs;
  assert.equal(r.text, "Title");
  assert.equal(r.font, "Red Hat Display");
  assert.equal(r.color, "#ffffff");
  assert.equal(r.bold, true);
  assert.ok(Math.abs(r.size - 24 * 12700 * PX) < 1e-9);
});

test("a run's own style overrides what it inherits", () => {
  const el = { objectId: "s", shape: { placeholder: { type: "TITLE", parentObjectId: "lt" }, text: { textElements: [{ paragraphMarker: { style: {} } }, { textRun: { content: "Title", style: { fontSize: { magnitude: 40, unit: "PT" } } } }] } } };
  const [p] = m.textRuns(el.shape.text, m.inherited(el));
  assert.ok(Math.abs(p.runs[0].size - 40 * 12700 * PX) < 1e-9);
});

test("a bullet paragraph keeps its glyph", () => {
  const [p] = m.textRuns({ textElements: [{ paragraphMarker: { style: {}, bullet: { glyph: "●" } } }, { textRun: { content: "point\n", style: {} } }] });
  assert.equal(p.bullet, "●");
});
