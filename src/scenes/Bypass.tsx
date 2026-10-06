// ABOUTME: Scene 9b: what the agent actually did after the no: PowerShell driving classic Outlook as the user, then the browser walking Teams.
// ABOUTME: Each route builds hop by hop as it is spoken; the gate above them never lights, because neither route touches it.

import React from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { CYAN, Caption, PINK, Screen, useBeats } from "../ui";

type Hop = { label: string; mark: string };

const OUTLOOK: Hop[] = [
  { label: "The agent", mark: "🤖" },
  { label: "PowerShell", mark: ">_" },
  { label: "COM automation", mark: "⚙" },
  { label: "Classic Outlook", mark: "✉" },
  { label: "Sent as the user", mark: "👤" },
];
const TEAMS: Hop[] = [
  { label: "The agent", mark: "🤖" },
  { label: "Approved browser", mark: "◎" },
  { label: "Remote debugging", mark: "⚙" },
  { label: "Teams", mark: "💬" },
  { label: "Sent as the user", mark: "👤" },
];

const X0 = 230;
const DX = 365;

const Route: React.FC<{ hops: Hop[]; y: number; from: number; span: number }> = ({ hops, y, from, span }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const step = span / hops.length;
  return (
    <>
      {hops.slice(1).map((_, i) => {
        const draw = interpolate(frame, [from + (i + 0.6) * step, from + (i + 1) * step], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
        const x1 = X0 + i * DX + 80;
        const x2 = X0 + (i + 1) * DX - 80;
        const dot = ((frame * 0.02 + i * 0.3) % 1) * (x2 - x1);
        return (
          <svg key={i} style={{ position: "absolute", left: 0, top: 0, overflow: "visible" }} width={1920} height={1080}>
            <line x1={x1} y1={y} x2={x1 + (x2 - x1) * draw} y2={y} stroke={PINK} strokeWidth={8} strokeDasharray="18 12" />
            {draw >= 1 && <circle cx={x1 + dot} cy={y} r={10} fill={PINK} />}
          </svg>
        );
      })}
      {hops.map((h, i) => {
        const s = spring({ frame: frame - from - i * step, fps, config: { damping: 12 } });
        return (
          <div key={i} style={{ position: "absolute", left: X0 + i * DX - 120, top: y - 80, width: 240, textAlign: "center", opacity: s, transform: `scale(${0.6 + 0.4 * s})` }}>
            <div style={{ margin: "0 auto", width: 160, height: 160, borderRadius: 18, background: "#02050c", border: `4px solid ${i === hops.length - 1 ? PINK : "#1f3a5f"}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 72, color: CYAN, fontFamily: "ui-monospace, monospace", fontWeight: 700 }}>{h.mark}</div>
            <div style={{ marginTop: 12, fontSize: 30, fontWeight: 700, textShadow: "0 2px 12px #000" }}>{h.label}</div>
          </div>
        );
      })}
    </>
  );
};

export const Bypass: React.FC = () => {
  const frame = useCurrentFrame();
  const b = useBeats("sayno");
  // The gate sits above both routes, dark the whole time: a closed gate nobody walks through.
  const gate = interpolate(frame, [b.at(2), b.at(2) + 20], [0.35, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <Screen horizon={0.97}>
      <div style={{ position: "absolute", right: 120, top: 70, width: 260, textAlign: "center", opacity: gate }}>
        <div style={{ margin: "0 auto", width: 200, height: 110, borderRadius: "100px 100px 0 0", border: `6px solid ${CYAN}`, borderBottom: "none", position: "relative" }}>
          {[0, 1, 2, 3, 4].map((k) => <div key={k} style={{ position: "absolute", bottom: 0, left: 28 + k * 34, width: 8, height: 90, background: CYAN, opacity: 0.6 }} />)}
        </div>
        <div style={{ height: 8, background: CYAN, opacity: 0.6 }} />
        <div style={{ marginTop: 10, fontSize: 30, fontWeight: 700, color: CYAN }}>The gate</div>
      </div>
      <Route hops={OUTLOOK} y={420} from={b.at(0)} span={b.end(0) - b.at(0)} />
      <Route hops={TEAMS} y={760} from={b.at(1)} span={b.end(1) - b.at(1)} />
      <Caption from={b.at(0)} top size={52}>So we said no.</Caption>
    </Screen>
  );
};
