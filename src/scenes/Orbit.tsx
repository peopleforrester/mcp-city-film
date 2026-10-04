// ABOUTME: Scene 1: the title over the city at night, the Death Star drifting past, the ship ladder counting up.
// ABOUTME: Mirrors the site's descent and the deck's clock ladder in a single shot.

import React from "react";
import { Img, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { CYAN, Caption, Screen, Skyline, YELLOW } from "../ui";

const SHIPS = [
  ["enterprise", "USS Enterprise", "428"],
  ["enterprise-d", "Enterprise-D", "1,014"],
  ["galactica", "Galactica", "2,800"],
  ["infinity", "UNSC Infinity", "17,151"],
  ["star-destroyer", "Star Destroyer", "37,085"],
  ["executor", "Executor", "279,144"],
  ["death-star", "Death Star", "1.2 million"],
];

export const Orbit: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const x = interpolate(frame, [0, durationInFrames], [-300, 2100]);
  const rise = spring({ frame, fps, config: { damping: 20 } });
  return (
    <Screen horizon={0.74}>
      <Img src={staticFile("art/ships/death-star-yellow.png")} style={{ position: "absolute", top: 90, left: x, width: 260, opacity: 0.95, filter: "drop-shadow(0 0 30px rgba(255,200,0,0.35))" }} />
      <div style={{ position: "absolute", top: 370, left: x + 70, fontFamily: "ui-monospace, monospace", fontSize: 34, color: YELLOW, opacity: 0.9 }}>0x7A120</div>
      <Skyline seed={11} count={70} maxH={300} rise={rise} />
      <div style={{ position: "absolute", right: 90, top: 70, width: 420 }}>
        {SHIPS.map(([file, name, crew], i) => {
          const s = spring({ frame: frame - 20 - i * 12, fps, config: { damping: 12 } });
          return (
            <div key={file} style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 16, height: 62, opacity: s, transform: `translateX(${(1 - s) * 80}px)` }}>
              <div style={{ textAlign: "right", fontSize: 22, lineHeight: 1.1 }}>
                <div style={{ fontWeight: 600 }}>{name}</div>
                <div style={{ fontFamily: "ui-monospace, monospace", color: CYAN }}>{crew}</div>
              </div>
              <Img src={staticFile(`art/ships/${file}.png`)} style={{ height: 44, width: 150, objectFit: "contain", filter: "drop-shadow(0 0 8px rgba(4,192,218,0.6))" }} />
            </div>
          );
        })}
      </div>
      <Caption from={10} size={72}>Governing MCP for a workforce the size of a city.</Caption>
      <Caption from={120} top size={34}>So what do we mean by a city? Let me put it in ships.</Caption>
    </Screen>
  );
};
