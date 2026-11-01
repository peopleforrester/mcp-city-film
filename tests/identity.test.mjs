// ABOUTME: Checks the repo says who it is: the talk, speaker, argument and status in README, and where things live in AGENTS.md.
// ABOUTME: CLAUDE.md must be a symlink to AGENTS.md so every agent reads the same rules.
import assert from "node:assert/strict";
import { lstatSync, readFileSync, readlinkSync } from "node:fs";
import { test } from "node:test";

const text = (p) => readFileSync(new URL(`../${p}`, import.meta.url), "utf8");
const path = (p) => new URL(`../${p}`, import.meta.url);

const section = (md, heading) => {
  const start = md.indexOf(`\n## ${heading}\n`);
  if (start < 0) return "";
  const rest = md.slice(start + heading.length + 5);
  const end = rest.indexOf("\n## ");
  return end < 0 ? rest : rest.slice(0, end);
};

test("CLAUDE.md is a symlink to AGENTS.md", () => {
  assert.ok(lstatSync(path("CLAUDE.md")).isSymbolicLink(), "CLAUDE.md is not a symlink");
  assert.equal(readlinkSync(path("CLAUDE.md")), "AGENTS.md");
});

test("README names the talk, its speaker, its argument, its event and its status", () => {
  const readme = text("README.md");
  assert.ok(readme.includes("Governing MCP for a Workforce the Size of a City"), "no talk title");
  assert.ok(readme.includes("Michael Rishi Forrester"), "no speaker");
  assert.ok(readme.includes("MCP Dev Summit Toronto"), "no event");
  assert.ok(readme.includes("6 October 2026"), "no date");
  const about = section(readme, "The talk");
  assert.ok(about.includes("argues"), "no argument under ## The talk");
  assert.ok(about.includes("Status"), "no status under ## The talk");
  assert.ok(about.includes("Built from"), "no source repos under ## The talk");
  for (const repo of ["MCP_for_a_city", "mcp-for-a-city", "mcp-city"]) {
    assert.ok(about.includes(`\`${repo}\``), `## The talk does not name ${repo}`);
  }
});

test("AGENTS.md points at talks-knowledge and conference-knowledge under Where things live", () => {
  const where = section(text("AGENTS.md"), "Where things live");
  assert.ok(where.trim(), "no ## Where things live section");
  assert.ok(where.includes("talks/talks-knowledge"), "no pointer to talks-knowledge");
  assert.ok(where.includes("talks/register.md"), "no pointer to the register");
  assert.ok(where.includes("abstracts/"), "no pointer to the abstracts");
  assert.ok(where.includes("conferences/conference-knowledge"), "no pointer to conference-knowledge");
});
