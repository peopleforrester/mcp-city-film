// ABOUTME: Draws one slide of the keynote deck from src/deck/deck.json: shapes, text, images and lines at their deck geometry.
// ABOUTME: Elements new to a slide rise in one after another; elements carried over from the previous slide hold still, so builds read as builds.

import React, { useEffect, useState } from "react";
import { freshElements } from "./signature";
import type { Element, Paragraph, SlideData } from "./types";
import { AbsoluteFill, Img, cancelRender, continueRender, delayRender, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";


const FONTS: [string, string, string][] = [
  ["Red Hat Display", "fonts/red-hat-display-variable.woff2", "normal"],
  ["Red Hat Display", "fonts/red-hat-display-italic-variable.woff2", "italic"],
  ["Roboto Mono", "fonts/roboto-mono-variable.woff2", "normal"],
  ["Roboto Mono", "fonts/roboto-mono-italic-variable.woff2", "italic"],
];

/** Loads the deck's two web fonts once; Arial falls back to Liberation Sans, which shares its metrics. */
export function useDeckFonts() {
  const [handle] = useState(() => delayRender("deck fonts"));
  useEffect(() => {
    Promise.all(FONTS.map(([family, file, style]) => new FontFace(family, `url(${staticFile(file)})`, { style, weight: "100 900" }).load().then((f) => document.fonts.add(f))))
      .then(() => continueRender(handle))
      .catch((err: unknown) => cancelRender(err));
  }, [handle]);
}

const STACK: Record<string, string> = {
  Arial: "Arial, 'Liberation Sans', sans-serif",
  "Red Hat Display": "'Red Hat Display', sans-serif",
  "Roboto Mono": "'Roboto Mono', monospace",
  Consolas: "'Roboto Mono', monospace",
  "Courier New": "'Courier New', 'Liberation Mono', monospace",
  Montserrat: "Montserrat, 'Red Hat Display', sans-serif",
};
const family = (f: string | null) => STACK[f ?? "Arial"] ?? `'${f}', Arial, 'Liberation Sans', sans-serif`;
const rgba = (c: { color: string; alpha: number }) => `${c.color}${Math.round(c.alpha * 255).toString(16).padStart(2, "0")}`;
const ALIGN: Record<string, React.CSSProperties["textAlign"]> = { START: "left", CENTER: "center", END: "right", JUSTIFIED: "justify" };
const VALIGN: Record<string, React.CSSProperties["justifyContent"]> = { TOP: "flex-start", MIDDLE: "center", BOTTOM: "flex-end" };
// Text insets, 0.05 inch on every side at 1920 pixels across 10 inches: measured against the deck, where a 536-pixel line fits a 564-pixel box.
const INSET_X = 9.6;
const INSET_Y = 9.6;

const Text: React.FC<{ paragraphs: Paragraph[] }> = ({ paragraphs }) => (
  <>
    {paragraphs.map((p, i) => {
      const size = p.runs.find((r) => r.size)?.size ?? 26.7;
      return (
        <div key={i} style={{ textAlign: ALIGN[p.align] ?? "left", lineHeight: (p.lineSpacing / 100) * 1.15, marginTop: p.spaceAbove, marginBottom: p.spaceBelow, paddingLeft: p.indentStart, textIndent: p.indentFirstLine - p.indentStart, minHeight: size * (p.lineSpacing / 100) * 1.15, whiteSpace: "pre-wrap", overflowWrap: "break-word" }}>
          {p.bullet && <span style={{ fontSize: size, color: p.runs[0]?.color ?? undefined, marginRight: "0.5em" }}>{p.bullet}</span>}
          {p.runs.map((r, j) => (
            <span key={j} style={{ fontFamily: family(r.font), fontSize: r.size ?? size, fontWeight: r.weight, fontStyle: r.italic ? "italic" : "normal", textDecoration: r.underline ? "underline" : "none", color: r.color ?? "#000", verticalAlign: r.baseline === "SUPERSCRIPT" ? "super" : r.baseline === "SUBSCRIPT" ? "sub" : undefined }}>
              {r.text}
            </span>
          ))}
        </div>
      );
    })}
  </>
);

const Draw: React.FC<{ e: Element }> = ({ e }) => {
  if (e.kind === "image") {
    const iw = e.w / Math.max(0.01, 1 - e.crop.l - e.crop.r);
    const ih = e.h / Math.max(0.01, 1 - e.crop.t - e.crop.b);
    return (
      <div style={{ position: "absolute", left: e.x, top: e.y, width: e.w, height: e.h, overflow: "hidden" }}>
        <Img src={staticFile(e.src)} style={{ position: "absolute", left: -e.crop.l * iw, top: -e.crop.t * ih, width: iw, height: ih }} />
      </div>
    );
  }
  if (e.kind === "line") {
    if (!e.stroke) return null;
    const x1 = e.x, y1 = e.y, x2 = e.x + e.w, y2 = e.y + e.h;
    const pad = e.weight * 4;
    return (
      <svg style={{ position: "absolute", left: Math.min(x1, x2) - pad, top: Math.min(y1, y2) - pad, overflow: "visible" }} width={Math.abs(e.w) + pad * 2} height={Math.abs(e.h) + pad * 2}>
        <line x1={x1 - Math.min(x1, x2) + pad} y1={y1 - Math.min(y1, y2) + pad} x2={x2 - Math.min(x1, x2) + pad} y2={y2 - Math.min(y1, y2) + pad} stroke={rgba(e.stroke)} strokeWidth={e.weight} strokeDasharray={e.dash === "SOLID" ? undefined : `${e.weight * 3} ${e.weight * 2}`} />
      </svg>
    );
  }
  const radius = e.shape === "ROUND_RECTANGLE" ? Math.min(e.w, e.h) * 0.1667 : e.shape === "ELLIPSE" ? "50%" : 0;
  return (
    <div style={{ position: "absolute", left: e.x, top: e.y, width: e.w, height: e.h, boxSizing: "border-box", background: e.fill ? rgba(e.fill) : undefined, border: e.outline ? `${e.outline.weight}px ${e.outline.dash === "SOLID" ? "solid" : "dashed"} ${rgba(e.outline)}` : undefined, borderRadius: radius, display: "flex", flexDirection: "column", justifyContent: VALIGN[e.valign] ?? "flex-start", padding: `${INSET_Y}px ${INSET_X}px` }}>
      <Text paragraphs={e.paragraphs} />
    </div>
  );
};


/**
 * One slide. `held` holds the signatures already on screen from the previous slide; those draw
 * at once. The rest arrive one after another across `spread` frames.
 */
export const Slide: React.FC<{ slide: SlideData; held?: Set<string>; spread?: number }> = ({ slide, held, spread = 45 }) => {
  useDeckFonts();
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const fresh = freshElements(slide.elements, held);
  const step = fresh.length > 1 ? Math.min(12, spread / (fresh.length - 1)) : 0;
  return (
    <AbsoluteFill style={{ background: slide.background, overflow: "hidden" }}>
      {slide.elements.map((e) => {
        const k = fresh.indexOf(e);
        if (k < 0) return <Draw key={e.id} e={e} />;
        const s = spring({ frame: frame - 4 - k * step, fps, config: { damping: 18, mass: 0.7 } });
        const o = interpolate(s, [0, 1], [0, 1], { extrapolateRight: "clamp" });
        return (
          <div key={e.id} style={{ position: "absolute", inset: 0, opacity: o, transform: `translateY(${(1 - s) * 18}px)` }}>
            <Draw e={e} />
          </div>
        );
      })}
    </AbsoluteFill>
  );
};
