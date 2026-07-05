# Coach Toolkit V2

## What changed
- Tap a player name to view attendance, games played/selected, games started and average rating.
- Added **Match Day Lineup** with formation dropdown, starting XI and bench assignment.
- Removed DOB from player input.
- Player positions are now multi-select.
- Training attendance is grouped by session name/date. Tap a session to view present and absent players.

## Existing app upgrade
1. Do **not** overwrite your working `config.js` unless you paste your Supabase values again.
2. Replace in GitHub: `index.html`, `style.css`, `script.js`, `README.md`, `database.sql`, `database-upgrade.sql`.
3. In Supabase SQL Editor, run `database-upgrade.sql`.
4. Wait for GitHub Pages to redeploy and hard refresh with Command + Shift + R.

## Fresh install
1. Create a Supabase project.
2. Run `database.sql` in Supabase SQL Editor.
3. Put your Supabase URL and anonymous public key in `config.js`.
4. Upload files to GitHub and enable GitHub Pages.

## Definitions
- Games started = selected in the saved starting XI.
- Games played/selected = selected in starting XI or bench.
