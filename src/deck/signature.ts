// ABOUTME: Decides whether a deck element is new on a slide or carried over from the one before.
// ABOUTME: Carried-over elements hold still, so a build adds only what is new; layout chrome and empty boxes never animate.

import type { Element } from "./types";

/** What makes two elements the same thing on screen: kind, place, and content. */
export function signature(e: Element): string {
  const at = `${Math.round(e.x / 4)},${Math.round(e.y / 4)},${Math.round(e.w / 4)},${Math.round(e.h / 4)}`;
  if (e.kind === "image") return `i:${e.src}:${at}`;
  if (e.kind === "line") return `l:${at}`;
  return `s:${at}:${e.fill?.color ?? ""}:${e.paragraphs.map((p) => p.runs.map((r) => r.text).join("")).join("|")}`;
}

const isEmpty = (e: Element): boolean => e.kind === "shape" && !e.fill && !e.outline && e.paragraphs.every((p) => p.runs.every((r) => !r.text.trim()));

/** The slide's own elements that are not on screen already, in drawing order. */
export function freshElements(elements: readonly Element[], held?: ReadonlySet<string>): Element[] {
  return elements.filter((e) => e.layer === "slide" && !isEmpty(e) && !held?.has(signature(e)));
}
