// ABOUTME: The architecture video: the site's own diagram, the camera moving box by box in the order a request travels.
// ABOUTME: Each stop dims everything but the boxes it names, while the shared voice reads the site's description of them.

import React from "react";
import { AbsoluteFill, Audio, Easing, Img, Sequence, interpolate, staticFile, useCurrentFrame } from "remotion";
import { type Box, type Camera, between, frameFor, onScreen } from "./camera";
import diagram from "./diagram.json";
import timing from "./timing.json";
import tour from "./tour.json";

const VIEW = { w: 1920, h: 1080 };
const IMAGE = { w: diagram.image.width, h: diagram.image.height };
const SX = diagram.image.width / diagram.width;
const SY = diagram.image.height / diagram.height;
const PAD = 22; // diagram units of air around a focused box
const MOVE = 28; // frames the camera takes to travel between stops
const NAVY = "#051932";
const CYAN = "#04c0da";

type Stop = { focus: string[]; text: string };
const STOPS = tour.stops as Stop[];
const T = timing as { stops: { frames: number; clip: string }[] };
const nodes = diagram.nodes as Record<string, Box>;
const zones = diagram.zones as Record<string, Box>;

/** A focus id in image pixels: a box, a zone, or the whole diagram. */
function boxOf(id: string): Box {
  if (id === "ALL") return { x: 0, y: 0, w: IMAGE.w, h: IMAGE.h };
  const b = nodes[id] ?? zones[id];
  if (!b) throw new Error(`tour names ${id}, which the diagram does not have`);
  return { x: (b.x - PAD) * SX, y: (b.y - PAD) * SY, w: (b.w + 2 * PAD) * SX, h: (b.h + 2 * PAD) * SY };
}

function union(boxes: Box[]): Box {
  const x = Math.min(...boxes.map((b) => b.x));
  const y = Math.min(...boxes.map((b) => b.y));
  return { x, y, w: Math.max(...boxes.map((b) => b.x + b.w)) - x, h: Math.max(...boxes.map((b) => b.y + b.h)) - y };
}

const wide = (s: Stop) => s.focus.some((f) => f === "ALL" || f in zones);
const HIGHLIGHTS = STOPS.map((s) => (s.focus.includes("ALL") ? [] : s.focus.map(boxOf)));
const CAMERAS: Camera[] = STOPS.map((s, i) => frameFor(union(s.focus.map(boxOf)), IMAGE, VIEW, { fill: wide(s) ? 0.92 : 0.42, maxZoom: HIGHLIGHTS[i]!.length > 1 ? 0.9 : 1 }));
const STARTS = T.stops.reduce<number[]>((acc, s, i) => [...acc, i === 0 ? 0 : acc[i - 1]! + T.stops[i - 1]!.frames], []);
export const ARCHITECTURE_FRAMES = T.stops.reduce((n, s) => n + s.frames, 0);

const Spotlight: React.FC<{ boxes: Box[]; cam: Camera; opacity: number }> = ({ boxes, cam, opacity }) => {
  if (!boxes.length || opacity <= 0) return null;
  const holes = boxes.map((b) => onScreen(b, cam, VIEW));
  const id = `hole-${holes.map((h) => Math.round(h.x)).join("-")}`;
  return (
    <svg width={VIEW.w} height={VIEW.h} style={{ position: "absolute", inset: 0, opacity }}>
      <defs>
        <mask id={id}>
          <rect width={VIEW.w} height={VIEW.h} fill="white" />
          {holes.map((h, k) => <rect key={k} x={h.x} y={h.y} width={h.w} height={h.h} rx={14} fill="black" />)}
        </mask>
      </defs>
      <rect width={VIEW.w} height={VIEW.h} fill={NAVY} opacity={0.6} mask={`url(#${id})`} />
      {holes.map((h, k) => <rect key={k} x={h.x} y={h.y} width={h.w} height={h.h} rx={14} fill="none" stroke={CYAN} strokeWidth={5} />)}
    </svg>
  );
};

export function Architecture(): React.ReactElement {
  const frame = useCurrentFrame();
  const i = Math.max(0, STARTS.filter((s) => s <= frame).length - 1);
  const t = interpolate(frame - STARTS[i]!, [0, MOVE], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.inOut(Easing.cubic) });
  const cam = between(CAMERAS[Math.max(0, i - 1)]!, CAMERAS[i]!, i === 0 ? 1 : t);
  return (
    <AbsoluteFill style={{ background: NAVY, overflow: "hidden" }}>
      <div style={{ position: "absolute", left: VIEW.w / 2 - cam.cx * cam.zoom, top: VIEW.h / 2 - cam.cy * cam.zoom, width: IMAGE.w * cam.zoom, height: IMAGE.h * cam.zoom, background: "#ffffff" }}>
        <Img src={staticFile("architecture/architecture.png")} style={{ width: "100%", height: "100%" }} />
      </div>
      {i > 0 && <Spotlight boxes={HIGHLIGHTS[i - 1]!} cam={cam} opacity={1 - t} />}
      <Spotlight boxes={HIGHLIGHTS[i]!} cam={cam} opacity={t} />
      {T.stops.map((s, k) => (
        <Sequence key={k} from={STARTS[k]} durationInFrames={s.frames}>
          <Audio src={staticFile(s.clip)} />
        </Sequence>
      ))}
    </AbsoluteFill>
  );
}
