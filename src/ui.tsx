// ABOUTME: The shared stage pieces: the backlit screen, captions, the shadow-play image, and small motion helpers.
// ABOUTME: Everything in the film is cut paper on a cyan-to-navy screen; this file is where that look lives.

import React, { createContext, useContext, useEffect, useState } from "react";
import { AbsoluteFill, Img, continueRender, delayRender, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import timing from "./timing.json";

const TIMING = timing as Record<string, { frames: number; beats: number[] }>;

/** Where each voice beat of a scene starts, so captions land when the words do. */
export function useBeats(id: string) {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const t = TIMING[id];
  // In the captions-only cut the scene is shorter than its narration; the beats scale to fit.
  const scale = t ? durationInFrames / t.frames : 1;
  const starts: number[] = [];
  let acc = 0;
  for (const f of t?.beats ?? []) { starts.push(Math.round(acc * scale)); acc += f; }
  const at = (i: number) => starts[i] ?? Math.round((durationInFrames * i) / Math.max(1, starts.length || 1));
  const end = (i: number) => (i + 1 < starts.length ? starts[i + 1] : durationInFrames);
  const current = Math.max(0, starts.filter((s) => s <= frame).length - 1);
  return { at, end, current, count: starts.length };
}


export const NAVY = "#051932";
export const CYAN = "#04c0da";
export const PINK = "#ff3c64";
export const YELLOW = "#ffc800";
export const ZONE = ["#ff3c64", "#ffc800", "#00c8bc", "#009eff", "#bc37de", "#ed561b"];

const FONT = "Bricolage Grotesque";

function useFont() {
  const [handle] = useState(() => delayRender("font"));
  useEffect(() => {
    const face = new FontFace(FONT, `url(${staticFile("bricolage-grotesque-variable.woff2")})`, { weight: "200 800" });
    face.load().then((f) => {
      document.fonts.add(f);
      continueRender(handle);
    }).catch(() => continueRender(handle));
  }, [handle]);
}

/** The backlit screen: cyan at the horizon line, navy above, near-black below. */
export const Screen: React.FC<{ horizon?: number; children?: React.ReactNode }> = ({ horizon = 0.62, children }) => {
  useFont();
  const h = Math.round(horizon * 100);
  return (
    <AbsoluteFill style={{ background: `linear-gradient(180deg, ${NAVY} 0%, #0a2a52 ${h - 30}%, ${CYAN} ${h}%, #03101f ${h + 6}%, #03101f 100%)`, fontFamily: `${FONT}, system-ui, sans-serif`, color: "#f8f8f2", overflow: "hidden" }}>
      {children}
      <AbsoluteFill style={{ background: "radial-gradient(ellipse at center, transparent 55%, rgba(0,0,0,0.45) 100%)", pointerEvents: "none" }} />
    </AbsoluteFill>
  );
};

/** Progress 0..1 of a spring that starts at `from` frames into the scene. */
export function useRise(from = 0, damping = 14): number {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return spring({ frame: frame - from, fps, config: { damping, mass: 0.8 } });
}

/** Whether burned-in captions draw. The narrated cut turns them off: the player's closed captions carry the spoken words. */
export const CaptionsShown = createContext(true);

/** A caption that slides up and in, and fades out `out` frames before `end` when given. */
export const Caption: React.FC<{ from?: number; end?: number; size?: number; children: React.ReactNode; top?: boolean }> = ({ from = 0, end, size = 54, children, top = false }) => {
  const shown = useContext(CaptionsShown);
  const frame = useCurrentFrame();
  const rise = useRise(from);
  if (!shown) return null;
  const fade = end ? interpolate(frame, [end - 12, end], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }) : 1;
  return (
    <div style={{ position: "absolute", left: 96, right: 96, [top ? "top" : "bottom"]: 88, opacity: rise * fade, transform: `translateY(${(1 - rise) * 30}px)`, fontSize: size, fontWeight: 600, lineHeight: 1.15, textShadow: "0 2px 18px rgba(0,0,0,0.7)", maxWidth: 1400 }}>
      {children}
    </div>
  );
};

/** A shadow-play scene image, full-bleed, with a slow drift so it never sits still. */
export const Shadow: React.FC<{ name: string; from?: number; drift?: number; opacity?: number }> = ({ name, from = 0, drift = 1.04, opacity = 1 }) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const fadeIn = interpolate(frame, [from, from + 14], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const scale = interpolate(frame, [0, durationInFrames], [1, drift]);
  return <Img src={staticFile(`art/shadow/${name}.png`)} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", opacity: fadeIn * opacity, transform: `scale(${scale})` }} />;
};

/** A seeded skyline of black cut-paper buildings along the bottom edge. */
export const Skyline: React.FC<{ seed?: number; count?: number; maxH?: number; y?: number; rise?: number }> = ({ seed = 7, count = 60, maxH = 260, y = 0, rise = 1 }) => {
  let s = seed;
  const rand = () => ((s = (s * 16807) % 2147483647) - 1) / 2147483646;
  const blocks = Array.from({ length: count }, (_, i) => ({ x: (i / count) * 1920 + rand() * 20, w: 18 + rand() * 42, h: 40 + rand() * maxH }));
  return (
    <div style={{ position: "absolute", left: 0, right: 0, bottom: y, height: maxH + 60 }}>
      {blocks.map((b, i) => (
        <div key={i} style={{ position: "absolute", left: b.x, bottom: 0, width: b.w, height: b.h * rise, background: "#02050c" }}>
          {Array.from({ length: Math.floor(b.h / 30) }, (_, k) => (
            <div key={k} style={{ position: "absolute", left: "35%", width: 4, height: 6, bottom: 12 + k * 28, background: CYAN, opacity: (i * 7 + k * 3) % 5 === 0 ? 0.9 : 0.25 }} />
          ))}
        </div>
      ))}
    </div>
  );
};

export const clamp01 = (v: number) => Math.max(0, Math.min(1, v));
