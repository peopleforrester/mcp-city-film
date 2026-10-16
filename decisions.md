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
