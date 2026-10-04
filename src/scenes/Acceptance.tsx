// ABOUTME: Scene 10: psychological acceptance, in four of the deck's shadow pictures with their lines.
// ABOUTME: The dam, the markers, the summoner, twenty years of no.

import React from "react";
import { useCurrentFrame } from "remotion";
import { Caption, Screen, Shadow } from "../ui";

const BEATS: [string, string][] = [
  ["acceptance", "Psychological acceptance for security is now more important than ever."],
  ["dam", "You cannot wait this one out. Block the approved server, and an unapproved one appears."],
  ["markers", "We handed a three-year-old the markers, and said: you can write on the wall now."],
  ["summoned", "Do you go after the minions, or the summoner? The summoner is the heart and mind to win."],
  ["twenty-years", "Twenty years of no. Then we handed out magic and said: stay inside the lines."],
];
const STEP = 84;

export const Acceptance: React.FC = () => {
  const frame = useCurrentFrame();
  const i = Math.min(BEATS.length - 1, Math.floor(frame / STEP));
  return (
    <Screen horizon={0.7}>
      <Shadow key={BEATS[i][0]} name={BEATS[i][0]} from={0} />
      <Caption key={i} from={i * STEP + 4} size={50}>{BEATS[i][1]}</Caption>
    </Screen>
  );
};
