# Coach Toolkit Lineup Image Dimension Fix

This keeps the simple homepage and fixes only the Lineups feature image.

## What changed

- Squad/dashboard image still uses object-fit: contain so the whole dashboard screenshot is visible.
- Lineups image now uses object-fit: cover again, so it displays like it did previously.
- Match Day remains text-only.
- App functionality unchanged.

## Upload instructions

Replace these in GitHub root:

- index.html
- style.css
- script.js
- README.md
- logo.svg
- .nojekyll
- assets/

Do not replace:

- config.js

## Test

Open:

https://antsev487.github.io/test/?v=lineupimg1

Then hard refresh:

Command + Shift + R
