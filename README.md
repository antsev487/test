# HARD FIX — fetchLiveMatches + Unique Allocation

This is the stronger fix for:

fetchLiveMatches is not defined

## Important

This version uses:

script.js?v=hardfix2
style.css?v=hardfix2

It also adds a small visible badge near the top of the app:

Build: hardfix2 · Live Match + Unique Allocation

If you do not see that badge, GitHub Pages is still serving old files.

## Upload instructions

Replace these files in GitHub root:

- index.html
- style.css
- script.js
- README.md

Do not replace:

- config.js
- database files

## After upload

1. Commit changes.
2. Wait 2-3 minutes.
3. Open:
   https://antsev57.github.io/test/?v=hardfix2
4. Hard refresh:
   Command + Shift + R

## Check script is live

Open this exact URL:

https://antsev57.github.io/test/script.js?v=hardfix2

Search for:

window.fetchLiveMatches

If you do not see it, the new script.js was not uploaded to the correct place.

## Included features

- Electric blue / black UI
- Live Match Manager
- Desktop drag/drop
- Phone Move / Swap
- Formation-ordered Starting XI
- Responsive layout
- Unique player allocation
