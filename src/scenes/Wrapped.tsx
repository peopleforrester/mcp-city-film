// ABOUTME: Scene 7: USB-C closes around USB-A, and the six reasons to wrap tick in.
// ABOUTME: Apparently everybody is doing it.

import React from "react";
import { Img, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { CYAN, Caption, Screen } from "../ui";

const REASONS = ["The server does not meet our security standards", "Credentials must not cross from client to server", "A hundred tools offered; nine presented", "Reads and writes split into separate servers", "stdio on one side, HTTP on the other", "Every call logged, rate limited and traced"];

export const Wrapped: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const wrap = spring({ frame: frame - Math.round(durationInFrames * 0.12), fps, config: { damping: 12 } });
  return (
    <Screen horizon={0.85}>
      <Caption from={0} top size={52}>We wrapped MCP servers in MCP servers. So did you.</Caption>
      <div style={{ position: "absolute", left: 120, top: 250, width: 640, height: 520, background: "#fff", borderRadius: 24 }}>
        <Img src={staticFile("art/cables/cable-usb-a.png")} style={{ position: "absolute", inset: 0, margin: "auto", height: 360, transform: `scale(${1 - wrap * 0.38})` }} />
        <Img src={staticFile("art/cables/cable-usb-c.png")} style={{ position: "absolute", inset: 0, margin: "auto", height: 480, opacity: wrap, transform: `scale(${1.5 - wrap * 0.5})` }} />
      </div>
      <div style={{ position: "absolute", left: 840, top: 250, width: 980 }}>
        {REASONS.map((r, i) => {
          const s = spring({ frame: frame - Math.round(durationInFrames * 0.25) - i * Math.round(durationInFrames * 0.08), fps, config: { damping: 13 } });
          return (
            <div key={r} style={{ display: "flex", gap: 20, alignItems: "baseline", fontSize: 36, marginBottom: 22, opacity: s, transform: `translateX(${(1 - s) * 60}px)` }}>
              <span style={{ fontFamily: "ui-monospace, monospace", color: CYAN, fontSize: 30 }}>{i + 1}</span>
              <span>{r}</span>
            </div>
          );
        })}
      </div>
      <Caption from={Math.round(durationInFrames * 0.78)} size={42}>Apparently everybody is doing it. The full list, and the tools, are on the site.</Caption>
    </Screen>
  );
};
