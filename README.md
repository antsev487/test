# Unique Player Allocation Update

This update is built from the rescue version, so it keeps:

- Electric blue / black UI
- Live Match Manager
- Match Day Lineup
- Desktop drag/drop
- Phone Move / Swap
- Formation-ordered Starting XI text
- Responsive laptop/phone layout

## What this update adds/fixes

A player can only be allocated once.

### Starting XI
If a player is already selected at one position, they are removed from the player picker for every other position.

Example:
- Lucas selected at CB
- Lucas will not appear as an option for RB, LB, ST, etc.

### Bench
If a player is selected in the Starting XI, they are removed from all bench dropdowns.

If a player is selected on Bench 1, they are removed from Bench 2, Bench 3, etc.

### Safety check
Even if the browser has stale data, saving the lineup blocks duplicate starters or duplicate bench players.

## Upload instructions

Replace these files in GitHub:

- index.html
- style.css
- script.js
- README.md

Do not replace:

- config.js
- database files

## After upload

1. Commit changes.
2. Wait 1-3 minutes.
3. Open:
   https://antsev57.github.io/test/?v=unique1
4. Hard refresh:
   Command + Shift + R

## No Supabase change

This is frontend-only. No SQL required.
