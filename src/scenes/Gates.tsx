// ABOUTME: Scene 4: six city gates on the road in; a little vehicle drives up, each barrier lifts as its question is asked.
// ABOUTME: The site's gate walk, as a side-scrolling shadow play.

import React from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { CYAN, Caption, Screen, ZONE, useBeats } from "../ui";

const ASK = ["Do we have a relationship with the vendor? A contract, a support path.", "Is there a real business need?", "Is it well built, and wrapped where we needed?", "Does it speak the current spec?", "Does it meet our security standards?", "Is the vendor certified? SOC 2, ISO 27001."];

export const Gates: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const b = useBeats("gates");
  const gate = Math.min(5, Math.max(0, b.current - 1));
  const carX = interpolate(frame, [b.at(1), b.at(7)], [120, 1680], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <Screen horizon={0.72}>
      <Caption from={b.at(0)} top size={52}>The acceptance process: six gates before an MCP server comes online.</Caption>
      <div style={{ position: "absolute", left: 0, right: 0, bottom: 300, height: 6, background: "#0b1a30" }} />
      {ASK.map((q, i) => {
        const x = 300 + i * 250;
        const lift = spring({ frame: frame - b.at(1 + i) - 10, fps, config: { damping: 11 } });
        return (
          <div key={q} style={{ position: "absolute", left: x, bottom: 300 }}>
            <div style={{ position: "absolute", left: -8, bottom: 0, width: 16, height: 150, background: "#02050c" }} />
            <div style={{ position: "absolute", left: 0, bottom: 108, width: 190, height: 10, background: ZONE[i], transformOrigin: "left center", transform: `rotate(${-70 * lift}deg)`, boxShadow: `0 0 16px ${ZONE[i]}` }} />
            <div style={{ position: "absolute", left: -18, bottom: 160, width: 36, height: 36, background: lift > 0.5 ? CYAN : "#1f3a5f", borderRadius: 6 }} />
            <div style={{ position: "absolute", left: -12, bottom: -40, fontSize: 24, color: ZONE[i], fontWeight: 700 }}>{i + 1}</div>
          </div>
        );
      })}
      <div style={{ position: "absolute", left: carX, bottom: 306, width: 120, height: 54, background: "#02050c", borderRadius: "14px 18px 4px 4px" }}>
        <div style={{ position: "absolute", left: 20, top: -26, width: 70, height: 28, background: "#02050c", borderRadius: "10px 10px 0 0" }} />
        <div style={{ position: "absolute", right: -4, top: 30, width: 10, height: 8, background: CYAN, boxShadow: `0 0 12px ${CYAN}` }} />
        <div style={{ position: "absolute", left: 12, bottom: -12, width: 22, height: 22, borderRadius: 11, background: "#02050c" }} />
        <div style={{ position: "absolute", right: 12, bottom: -12, width: 22, height: 22, borderRadius: 11, background: "#02050c" }} />
      </div>
      {b.current >= 1 && b.current <= 6 && (
        <Caption from={b.at(1 + gate)} end={b.end(1 + gate)} size={48} key={gate}>
          <span style={{ color: ZONE[gate] }}>Gate {gate + 1}.</span> {ASK[gate]}
        </Caption>
      )}
      <Caption from={b.at(7)} size={44}>The complete checklist, with every source, is on the site.</Caption>
    </Screen>
  );
};
