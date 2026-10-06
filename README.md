# The shadow-play film, the deck video and the architecture video

Three videos of one keynote. The film is a cartoon walkthrough of **Governing MCP for a Workforce the Size of a City**,
the keynote at MCP Dev Summit Toronto on 6 October 2026, as a shadow play:
cut-paper silhouettes on a backlit screen, the deck's own art, the site's
ideas, and the talk's words as captions. The deck video is the talk itself:
every slide of the deck redrawn from the Slides API, its builds animated,
each slide held for its stretch of the voice track. Both are built with
Remotion.

- The talk's site: https://mcp.michaelrishiforrester.com
- The collateral: https://github.com/peopleforrester/mcp-for-a-city
- The site's source: https://github.com/peopleforrester/mcp-city

## Run it

```bash
npm install
npm run dev                                        # Remotion Studio
npx remotion render src/index.ts Film out/film.mp4  # the narrated film
npx remotion render src/index.ts FilmSilent out/film-silent.mp4  # the captions-only cut
npx remotion still src/index.ts scene-gates out/gates.jpg --frame=200
```

## The architecture video

A walk through the architecture diagram on the talk site, box by box in the
order a request travels. The picture is the site's own diagram; the words
are the site's own description of each box.

```bash
npm run architecture:extract   # the site's diagram and box geometry at a pinned commit (SITE_COMMIT)
npm run architecture:voice     # needs GEMINI_API_KEY; one clip per stop, src/architecture/timing.json
npm run render:architecture    # out/architecture.mp4
npm run architecture:captions  # out/architecture.en.vtt, closed captions for the site's player
```

The tour itself, which boxes each stop shows and what it says, is
`src/architecture/tour.json`.

## Test it

```bash
npm run lint       # eslint and the type checker
npm test           # unit and integration: beat timing, the deck model, build signatures, data integrity
npm run test:e2e   # bundles the project, checks composition lengths, renders real stills (about a minute)
```

`npm test` fails when the deck has been re-extracted with changed speaker
notes but not re-voiced, naming the slide.

## The deck video

The deck is the source. Pull it, voice it, render it:

```bash
# A Slides API token, minted from a gog export with the fleet's gdoc-update helper:
gog auth tokens export michaelrishiforrester@gmail.com --out tok.json
export SLIDES_ACCESS_TOKEN=$(python3 -c "import importlib.util,pathlib; s=importlib.util.spec_from_file_location('g','$HOME/repos/workflow/scripts-knowledge/bin/gdoc-update.py'); m=importlib.util.module_from_spec(s); s.loader.exec_module(m); print(m.access_token(pathlib.Path('tok.json')))")
rm tok.json                    # it holds a live refresh token

npm run deck:extract           # src/deck/deck.json and public/deck/
npm run deck:voice             # needs GEMINI_API_KEY; one clip per slide, src/deck/timing.json
npm run deck:stills            # every slide's settled frame, for checking against the deck
npm run render:deck            # out/deck.mp4
```

The voice is the speaker notes read by Gemini's speech model, the film's
voice. To use the talk recording instead, set `track` in
`src/deck/timing.json` to the recording's path under `public/` and give each
slide's `frames` from the slide changes in the recording; the slides
themselves do not change.

## License

Code: Apache 2.0. The art is generated for the talk; the ship outlines depict
designs that belong to their studios and are fan art for a scale comparison.
