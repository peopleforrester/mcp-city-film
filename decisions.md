# Decisions Log

Append-only audit trail of approvals, amendments, backward steps, and conditional-skip rationales. See [[state-persistence]] for schema.

## 2026-10-06T01:08:25Z · 1.3 · PRD-3 approved

PRD `3-remotion-deck.md` sealed on Michael's instruction to build it now ("do it right now and don't wait").
- Approved-by: Michael@2026-10-06T01:08:25Z
- Plan checksum: sha256:29720f9c3c5f
- Title: Remotion deck

## 2026-10-16 · question 37 · Node toolchain for the hecaton gate

Question: the gate host has no Node or npm, so the declared lint and test commands cannot run there, and a fresh clone needs `npm ci` first. How should the gate get a Node toolchain?
- Answer (Michael, through `hec answer`): install Node 26 on the gate host and have the gate run `npm ci`, matching CI. The host change is tracked as peopleforrester/hecaton#118 and lands through the root runner; until then this repo's gate waits.
- Changes: AGENTS.md declares `Test command: npm ci && npm run lint && npm test` and `E2E command: npm ci && npm run test:e2e`, so both run from a fresh clone. The gate passes only once peopleforrester/hecaton#118 puts Node 26 on the gate host.

## 2026-10-31 · correction · who decided question 37

The entry above for question 37 records its answer as "Answer (Michael, through `hec answer`)". That attribution is wrong: the answer was decided by hecaton's coordinator under Michael's standing rules, not by Michael, and hecaton records it with decided_by = coordinator. The decision itself stands; only the attribution is corrected. Requested by peopleforrester/hecaton#127.
- question 37 (#6), 2026-10-16 04:49 UTC: install Node 26 on the gate host and have the gate run `npm ci`, declaring `Test command: npm ci && npm run lint && npm test`, matching CI. The host change is tracked as peopleforrester/hecaton#118. Decided by the coordinator under Michael's standing rules, not by Michael.
## 2026-10-31 · issue #5 · Identity and pointers to talks-knowledge

The fleet standard for a talk repo asks for the talk, speaker, argument, event, status and source repos in `README.md`, a "Where things live" section in `AGENTS.md`, and `CLAUDE.md` as a symlink to it.
- Changes: `README.md` gains "The talk", with the argument taken from talks-knowledge's register row 7. `AGENTS.md` gains "Where things live", naming talks-knowledge for the register and abstracts and conference-knowledge for event state. `CLAUDE.md` links to `AGENTS.md`. `tests/identity.test.mjs` holds all three.
- This repo is public and `MCP_for_a_city` is private. Both files give its name, marked private, with no link: the name is already public in `mrf/mcp-city`, and an agent here needs it to find the deck and script.
