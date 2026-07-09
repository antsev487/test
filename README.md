# Coach Toolkit V4 Clean Rebuild

This is a clean rebuild, not a patch.

## What is included

- Electric blue / black UI
- Cleaner app structure
- Login / signup
- Team profile
- Player database
- Training session planner
- Attendance tracking
- Player ratings
- Match Day Lineup pitch view
- Formation-ordered Starting XI text
- Unique player allocation
- Desktop drag/drop on pitch
- Phone tap-to-move / swap
- Live Match Manager
- Substitution and event logging
- Saved live match summaries
- Match reports
- Responsive laptop / phone layout
- Logo SVG

## Upload instructions

Replace these files in your GitHub root:

- index.html
- style.css
- script.js
- README.md
- logo.svg
- .nojekyll

Do not replace:

- config.js

Your existing config.js should stay exactly as-is.

## Supabase

Run this once in Supabase > SQL Editor > New Query:

database-v4-upgrade.sql

It is safe to run more than once.

## Test URL

After committing to GitHub, wait 2-3 minutes and open:

https://antsev57.github.io/test/?v=v4clean1

Then hard refresh:

Command + Shift + R

## Build check

You should see:

Build: v4clean1 · stable rebuild

If you do not see that, GitHub Pages is still serving the old files.
