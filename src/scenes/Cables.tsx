// ABOUTME: Scene 2: seven connectors march past with their years, then the eighteen-year count.
// ABOUTME: The talk's own hand-drawn sketches on white cards.

import React from "react";
import { Img, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { Caption, Screen, YELLOW } from "../ui";

const PLUGS = [["parallel", "Parallel", 1981], ["serial", "Serial", 1984], ["ps2", "PS/2", 1987], ["usb-a", "USB-A", 1996], ["mini-usb", "Mini-USB", 2000], ["micro-usb", "Micro-USB", 2007], ["usb-c", "USB-C", 2014]] as const;

export const Cables: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const count = spring({ frame: frame - Math.round(durationInFrames * 0.62), fps, config: { damping: 30 } });
  return (
    <Screen horizon={0.8}>
      <Caption from={0} top size={56}>"MCP is the USB of AI tooling." Remember these?</Caption>
      <div style={{ position: "absolute", top: 260, left: 80, display: "flex", gap: 22 }}>
        {PLUGS.map(([file, name, year], i) => {
          const s = spring({ frame: frame - Math.round(durationInFrames * 0.18) - i * Math.round(durationInFrames * 0.045), fps, config: { damping: 11 } });
          return (
            <div key={file} style={{ width: 232, background: "#fff", color: "#000", borderRadius: 14, padding: 14, opacity: s, transform: `translateY(${(1 - s) * 120}px) rotate(${(1 - s) * -6}deg)` }}>
              <Img src={staticFile(`art/cables/cable-${file}.png`)} style={{ width: "100%", height: 150, objectFit: "contain" }} />
              <div style={{ fontWeight: 700, fontSize: 28, marginTop: 8 }}>{name}</div>
              <div style={{ fontFamily: "ui-monospace, monospace", fontSize: 24 }}>{year}</div>
            </div>
          );
        })}
      </div>
      <div style={{ position: "absolute", left: 96, bottom: 230, fontFamily: "ui-monospace, monospace", fontSize: 150, fontWeight: 700, color: YELLOW, textShadow: "0 4px 30px rgba(0,0,0,0.6)", opacity: count, transform: `scale(${0.6 + 0.4 * count})`, transformOrigin: "left bottom" }}>
        {Math.round(18 * count)} years
      </div>
      <Caption from={Math.round(durationInFrames * 0.7)} size={40}>to get to one plug. USB 1.0 in 1996; USB-C in 2014. We are not at USB-C yet.</Caption>
    </Screen>
  );
};
