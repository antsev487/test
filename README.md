# Coach Toolkit V3 — Live Match Manager

This update adds a new feature tab: **Live Match Manager**.

## What it does

- Load a saved Match Day Lineup.
- Start / pause a match timer.
- Move to Half Time, Second Half and Full Time.
- Track live player minutes.
- Add substitutions.
- Log goals, assists, yellow cards, red cards and custom events.
- Save a full live match summary to Supabase.

## Upload to GitHub

Replace these files:

```txt
index.html
style.css
script.js
README.md
```

Do not replace your working `config.js`.

## Supabase upgrade

In Supabase SQL Editor, run:

```txt
database-live-match-upgrade.sql
```

## After upload

Open your site with:

```txt
https://antsev57.github.io/test/?v=20
```

Then hard refresh with Command + Shift + R.

## How to use

1. Create players.
2. Create and save a Match Day Lineup.
3. Go to Live Match Manager.
4. Select that saved lineup.
5. Start the timer.
6. Add subs and events.
7. Save the live match summary.
