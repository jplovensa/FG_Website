# FAD identity

The ascending-panel mark expresses FAD's repeatable construction system and progression from individual buildings to coordinated developments. Three equal-thickness panels share a rising axis; decreasing lengths create a compact, recognisable silhouette. The wordmark uses outlined Inter at weight 750 with deliberate spacing.

## Artwork

- `fad-logo.svg`: primary horizontal lockup for light backgrounds.
- `fad-logo-reverse.svg`: mint and ivory lockup for deep green backgrounds.
- `fad-logo-mono.svg`: single-colour artwork for stamps and one-colour printing.
- `fad-mark.svg`: standalone mark for dark backgrounds, used by the website.
- `fad-mark-dark.svg`: standalone mark for light backgrounds.
- `fad-mark-mono.svg`: single-colour standalone mark.
- `fad-wordmark.svg` and `fad-wordmark-reverse.svg`: outlined wordmarks. The website combines these with a live bilingual descriptor.
- `fad-identity-board.svg`: visual presentation.
- `exports/`: transparent PNG artwork, with horizontal lockups at 3400 × 1200 and standalone marks at 1920 × 2400. The presentation board intentionally has a background.

All logo SVG files have transparent backgrounds, outlined lettering, and no external dependencies. The Inter license is included in the downloadable package. The font remains Inter throughout the website.

## Usage

Use the primary logo on warm ivory (#F5F4ED) or white; use the reverse version on forest green (#193A32). Supporting greens are mint (#A1E5CF) and teal (#398780). Leave at least one panel thickness of clear space on every side. Do not stretch, rotate, add shadows, or change the panel spacing. Use the standalone mark at small sizes; omit the descriptor where it becomes unreadable. Suggested minimum horizontal lockup width: 220 px on screen or 40 mm in print. Suggested minimum mark height: 24 px.

These are RGB digital masters. Convert colours for the chosen print stock and printer, and review a proof before production. No trademark availability search has been performed.

## Rebuilding

From the repository root, install `fonttools[woff]` in a Python environment and run `python scripts/brand/build_identity.py`. To regenerate PNG exports, start `npm run dev` and run `node scripts/brand/export_identity.mjs`; Chromium and the existing Playwright dependency are required. The website build uses checked-in files and needs neither Python nor these authoring steps.
