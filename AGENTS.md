# Agent guidance for this repo

ABOUTME: Repo-local rules for the shadow-play film and the deck video of the MCP Dev Summit keynote.
ABOUTME: Both say what the deck says; the deck is the source of every claim.

- Captions carry the deck's words. A number on screen is one the deck already
  sources; the sources live in `peopleforrester/mcp-for-a-city`.
- The film's look is cut paper on the cyan-to-navy screen (`src/ui.tsx`). New
  scenes use `Screen`, `Caption` and `Shadow`; nothing photoreal.
- The deck video (`src/deck/`) has no look of its own. It draws the deck from
  `src/deck/deck.json`, which `npm run deck:extract` regenerates from the
  Slides API. Fix a slide in the deck and re-extract; never hand-edit
  `deck.json`. A rendering defect is fixed in `src/deck/Slide.tsx` or the
  extractor, for every slide at once.
- `npm run dev` opens Remotion Studio; `npx remotion render src/index.ts Film out/film.mp4`
  renders the narrated film and `FilmSilent` the captions-only cut; `scene-<id>` compositions render one scene.
- `npm run render:deck` renders the deck video; `slide-NN` compositions render one slide,
  and `npm run deck:stills` writes every slide's settled frame to `out/deck-stills/` for a
  side-by-side check against the deck's PDF export.
- Work on `staging`; promote to `main` once a render has been watched.
