# Coach Toolkit Simple Homepage Feature Image Fix

This update keeps the simple homepage and fixes the feature card images.

## What changed

- Squad card uses dashboard-preview.jpg once.
- Lineups card uses lineup-preview.jpg.
- Match Day card is now text-only, so the dashboard image is not duplicated.
- Feature images now use object-fit: contain, so the whole screenshot is shown instead of being cropped.

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

https://antsev487.github.io/test/?v=featurefix1

Then hard refresh:

Command + Shift + R
