# Coach Toolkit Login Page Flow Fix

This fixes the issue where the homepage and logged-in app show on the same page.

## What changed

- When logged out: homepage/login is shown and the app is hidden.
- When logged in: homepage/login is hidden and the app/dashboard is shown.
- Login/logout buttons now switch the correct screen.
- Adds extra CSS guards so authView and appView cannot show together.

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

https://antsev487.github.io/test/?v=pageflow1

Then hard refresh:

Command + Shift + R

Test flow:
1. Open page logged out.
2. Login.
3. Homepage should disappear.
4. Dashboard/app should show.
5. Logout.
6. Homepage should return.
