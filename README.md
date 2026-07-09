# Coach Toolkit V4 Hover Fix

This fixes the issue where pitch position circles move when you hover over them.

## What caused it

The app has a normal button hover effect:

button:hover { transform: translateY(-1px); }

That is fine for normal buttons, but the pitch circles are also buttons. The hover effect was overriding their positioning transform.

## What this fixes

- ST / GK / CB / etc. no longer move when the cursor hovers over them.
- Pitch circles stay locked in place.
- Keeps production polish UI.
- Keeps all V4 features.

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

## Test

Open:

https://antsev57.github.io/test/?v=hoverfix1

Hard refresh:

Command + Shift + R

## Supabase

No SQL change needed.
