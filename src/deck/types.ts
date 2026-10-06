// ABOUTME: The shape of src/deck/deck.json: slides of shapes, images and lines at pixel geometry with resolved text styles.
// ABOUTME: Written by scripts/extract-deck.mjs; read by the deck renderer and its tests.

export type Run = { text: string; color: string | null; size: number | null; bold: boolean; italic: boolean; underline: boolean; font: string | null; weight: number; baseline: string };
export type Paragraph = { align: string; lineSpacing: number; spaceAbove: number; spaceBelow: number; indentStart: number; indentFirstLine: number; bullet: string | null; runs: Run[] };
type Base = { id: string; layer: "layout" | "slide"; x: number; y: number; w: number; h: number };
export type Shape = Base & { kind: "shape"; shape: string; fill: { color: string; alpha: number } | null; outline: { color: string; alpha: number; weight: number; dash: string } | null; valign: string; paragraphs: Paragraph[] };
export type Picture = Base & { kind: "image"; src: string; crop: { l: number; r: number; t: number; b: number } };
export type Line = Base & { kind: "line"; stroke: { color: string; alpha: number } | null; weight: number; dash: string; arrow: string };
export type Element = Shape | Picture | Line;
export type SlideData = { id: string; number: number; background: string; notes: string; elements: Element[] };
