# Coach Toolkit V4 UI + Config Fix

This fixes the current login issue and improves the UI.

## Main fix

The previous V4 was checking only:

window.SUPABASE_URL
window.SUPABASE_ANON_KEY

Your config.js likely uses:

const SUPABASE_URL = "..."
const SUPABASE_ANON_KEY = "..."

This update supports both styles.

## UI changes

- Cleaner desktop login layout
- Less empty vertical space
- Better hero section
- More professional login card
- Better spacing and sizing
- Improved mobile layout
- Keeps electric blue / black brand direction

## Upload instructions

Replace these files in GitHub root:

- index.html
- style.css
- script.js
- README.md
- logo.svg
- .nojekyll

Do not replace:

- config.js

## Supabase

If you already ran database-v4-upgrade.sql, you do not need to run it again.

If you have not run it yet, run:

database-v4-upgrade.sql

## Test

Open:

https://antsev57.github.io/test/?v=v4ui2

Hard refresh:

Command + Shift + R

You should see:

Build: v4ui2 · config fixed + improved UI
