// ABOUTME: Scenes 4 and 9b: the architecture as a city map; districts light up, traffic runs, and when you say no the alleys light up.
// ABOUTME: Same districts, buildings and roads as the site's living map, drawn flat.

import React from "react";
import { spring, useCurrentFrame, useVideoConfig } from "remotion";
import { CYAN, Caption, PINK, Screen } from "../ui";

const D = [
  { name: "Managed device", color: "#ff3c64", x: 100, y: 230, w: 400, h: 520 },
  { name: "Tool traffic", color: "#ed561b", x: 560, y: 230, w: 1000, h: 250 },
  { name: "Model traffic", color: "#bc37de", x: 560, y: 520, w: 460, h: 230 },
  { name: "Control plane", color: "#0b8a5c", x: 1100, y: 520, w: 460, h: 230 },
];
const N: Record<string, [number, number, string]> = {
  U: [170, 660, "End user"], A: [330, 520, "Agent"], CP: [170, 430, "Client policy"], OSP: [400, 400, "Device policy"],
  P: [640, 350, "Proxy"], G: [830, 350, "Gateway"], API: [1040, 350, "Boundary"], SRV: [1240, 350, "MCP server"], T: [1460, 350, "Tool / data"],
  AG: [700, 640, "AI gateway"], LLM: [940, 640, "Models"],
  R: [1200, 660, "Registry"], IDP: [1420, 660, "Identity"], GIT: [1310, 740, "GitOps"],
  OBS: [1700, 900, "Audit and traces"], OUT: [140, 830, "Outlook"], TM: [400, 830, "Teams"],
};
const E: [string, string, string][] = [
  ["U", "A", "tool"], ["A", "P", "tool"], ["P", "G", "tool"], ["G", "API", "tool"], ["API", "SRV", "tool"], ["SRV", "T", "tool"],
  ["A", "AG", "model"], ["AG", "LLM", "model"],
  ["CP", "A", "control"], ["OSP", "A", "control"], ["R", "G", "control"], ["IDP", "G", "control"], ["GIT", "SRV", "control"], ["R", "CP", "control"],
  ["G", "OBS", "audit"], ["AG", "OBS", "audit"], ["A", "OBS", "audit"],
  ["A", "OUT", "bypass"], ["A", "TM", "bypass"],
];
const COLOR: Record<string, string> = { tool: "#ed561b", model: "#bc37de", control: "#0b8a5c", audit: "#9a9a9a", bypass: PINK };

export const City: React.FC<{ sayNo?: boolean }> = ({ sayNo = false }) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  // When you say no the alleys light up; in the architecture scene they are only hinted at, late, as the deck's two red dashed lines.
  const alley = sayNo ? spring({ frame: frame - Math.round(durationInFrames * 0.35), fps, config: { damping: 14 } }) : 0.35 * spring({ frame: frame - Math.round(durationInFrames * 0.72), fps, config: { damping: 14 } });
  return (
    <Screen horizon={0.95}>
      <svg width={1920} height={1080} style={{ position: "absolute", inset: 0 }}>
        {D.map((d, i) => {
          const s = spring({ frame: frame - 6 - i * 10, fps, config: { damping: 14 } });
          return (
            <g key={d.name} opacity={s}>
              <rect x={d.x} y={d.y} width={d.w} height={d.h} rx={14} fill={d.color} opacity={0.22} />
              <text x={d.x + 16} y={d.y + 34} fill={d.color} fontSize={26} fontWeight={700}>{d.name}</text>
            </g>
          );
        })}
        {E.map(([a, b, k], i) => {
          const [ax, ay] = N[a]; const [bx, by] = N[b];
          const on = k === "bypass" ? alley : spring({ frame: frame - 30 - i * 3, fps, config: { damping: 20 } });
          const dots = 3;
          return (
            <g key={`${a}${b}`} opacity={on}>
              <line x1={ax} y1={ay} x2={bx} y2={by} stroke={COLOR[k]} strokeWidth={k === "bypass" ? 8 : 3} strokeDasharray={k === "control" ? "8 8" : k === "bypass" ? "16 10" : undefined} opacity={0.75} />
              {Array.from({ length: dots }, (_, j) => {
                const p = ((frame * (k === "control" ? 0.006 : 0.014) + j / dots + i * 0.11) % 1 + 1) % 1;
                return <circle key={j} cx={ax + (bx - ax) * p} cy={ay + (by - ay) * p} r={k === "bypass" ? 9 : 6} fill={COLOR[k]} />;
              })}
            </g>
          );
        })}
        {Object.entries(N).map(([id, [x, y, label]], i) => {
          const bypass = id === "OUT" || id === "TM";
          const dark = id === "OBS" && sayNo;
          const s = bypass ? alley : spring({ frame: frame - 20 - i * 3, fps, config: { damping: 12 } });
          return (
            <g key={id} opacity={s} transform={`translate(${x},${y}) scale(${0.6 + 0.4 * s})`}>
              <rect x={-30} y={-54} width={60} height={54} fill={dark ? "#1b2535" : "#02050c"} />
              <rect x={-10} y={-44} width={20} height={34} fill={bypass ? PINK : dark ? "#24303f" : CYAN} opacity={0.8} />
              <text x={0} y={26} textAnchor="middle" fill="#f8f8f2" fontSize={22} fontWeight={600}>{label}</text>
            </g>
          );
        })}
      </svg>
      {sayNo ? (
        <>
          <Caption from={0} top size={56}>So we said no.</Caption>
          <Caption from={Math.round(durationInFrames * 0.4)} size={42}>PowerShell against classic Outlook. The approved browser in debug mode, walking Teams. The shell and the browser never touch the gate.</Caption>
        </>
      ) : (
        <>
          <Caption from={0} top size={56}>The architecture, done properly.</Caption>
          <Caption from={Math.round(durationInFrames * 0.1)} end={Math.round(durationInFrames * 0.72)} size={42}>A person. A device. An agent. One gate, a proxy and a registry, that every call goes through. The tools.</Caption>
          <Caption from={Math.round(durationInFrames * 0.74)} size={42}>The two red dashed lines: the shell and the browser never touch any of it. Hold that thought.</Caption>
        </>
      )}
    </Screen>
  );
};
