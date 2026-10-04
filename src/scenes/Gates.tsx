// ABOUTME: Scene 5: six city gates on the road in; a little vehicle drives up, each barrier lifts, each question is asked.
// ABOUTME: The site's gate walk, as a side-scrolling shadow play.

import React from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { CYAN, Caption, Screen, ZONE } from "../ui";

const ASK = ["Do we know the vendor?", "Do we need it, and is it core?", "How well is it built, and does it need wrapping?", "Does it speak the current spec?", "Does it carry authorization?", "Is the vendor itself compliant?"];

export const Gates: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  // The six gates share the scene evenly, with a breath left at the end for the admission line.
  const STEP = Math.floor((durationInFrames - 60) / 6);
  const gate = Math.min(5, Math.floor(frame / STEP));
  const carX = interpolate(frame, [0, STEP * 6], [120, 1680], { extrapolateRight: "clamp" });
  return (
    <Screen horizon={0.72}>
      <Caption from={0} top size={52}>Six gates before yes.</Caption>
      <div style={{ position: "absolute", left: 0, right: 0, bottom: 300, height: 6, background: "#0b1a30" }} />
      {ASK.map((q, i) => {
        const x = 300 + i * 250;
        const lift = spring({ frame: frame - (i * STEP + 26), fps, config: { damping: 11 } });
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
      <Caption from={gate * STEP + 4} size={48} key={gate}>
        <span style={{ color: ZONE[gate] }}>Gate {gate + 1}.</span> {ASK[gate]}
      </Caption>
    </Screen>
  );
};
