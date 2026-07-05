# Coach Toolkit Pitch Lineup Update

This update changes Match Day Lineup into a football pitch diagram.

## What changed
- Formation dropdown stays.
- Starting XI is now a pitch diagram.
- Tap a position circle, choose a player, and the player name appears in the circle.
- Bench remains simple dropdowns underneath.
- Uses your existing Supabase `match_day_lineups` table. No new backend change is needed if you already ran `database-upgrade.sql`.

## Upload to GitHub
Replace these files in the root of your repo:

```txt
index.html
style.css
script.js
README.md
```

Do not replace your working `config.js`.

After upload, wait for GitHub Pages, then open:

```txt
https://antsev57.github.io/test/?v=6
```

Then hard refresh with Command + Shift + R.
