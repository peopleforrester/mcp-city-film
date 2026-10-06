// ABOUTME: Unit tests for the architecture video's camera: framing a box, keeping the diagram filling the frame, and the spotlight's place on screen.
// ABOUTME: All geometry is in image pixels of the site's PNG, viewed in a 1920 by 1080 frame.
import assert from "node:assert/strict";
import { test } from "node:test";
import { type Camera, frameFor, onScreen } from "../src/architecture/camera.ts";

const VIEW = { w: 1920, h: 1080 };
const IMAGE = { w: 5400, h: 1875 };
const near = (a: number, b: number) => assert.ok(Math.abs(a - b) < 1e-6, `${a} != ${b}`);

test("the whole diagram fits the frame width, centered top to bottom", () => {
  const c = frameFor({ x: 0, y: 0, w: IMAGE.w, h: IMAGE.h }, IMAGE, VIEW);
  near(c.zoom, 1920 / 5400);
  near(c.cx, IMAGE.w / 2);
  near(c.cy, IMAGE.h / 2);
});

test("a small box is zoomed toward, up to the zoom cap", () => {
  const c = frameFor({ x: 2700, y: 900, w: 100, h: 50 }, IMAGE, VIEW, { fill: 0.5, maxZoom: 1.2 });
  near(c.zoom, 1.2);
  near(c.cx, 2750);
  near(c.cy, 925);
});

test("near an edge the camera stops so the diagram still fills the frame", () => {
  const c = frameFor({ x: 0, y: 0, w: 200, h: 200 }, IMAGE, VIEW, { fill: 0.5, maxZoom: 1 });
  near(c.zoom, 1);
  near(c.cx, VIEW.w / 2);
  near(c.cy, VIEW.h / 2);
});

test("a box maps onto the screen through the camera", () => {
  const cam: Camera = { zoom: 2, cx: 1000, cy: 500 };
  assert.deepEqual(onScreen({ x: 1000, y: 500, w: 10, h: 20 }, cam, VIEW), { x: 960, y: 540, w: 20, h: 40 });
});
