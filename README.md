# Coach Toolkit — Functional MVP

This is a functional football coaching toolkit using:

- GitHub Pages for frontend hosting
- Supabase for backend, database, authentication and row-level security
- No build step
- No React
- No paid hosting required for MVP testing

## Features

- Coach sign up / login
- Coach profile
- Player database
- Session planner
- Attendance tracker with saved history
- Player ratings with saved history
- Match reports
- Dashboard counts
- Mobile-first UI
- Backend storage through Supabase
- Row-level security so coaches can only access their own data

## Files

```txt
index.html
style.css
script.js
config.js
database.sql
README.md
```

## Setup

### 1. Create Supabase project

Go to Supabase and create a free project.

### 2. Run database.sql

Open:

Supabase > SQL Editor > New query

Paste the full contents of `database.sql` and run it.

### 3. Configure authentication

For fastest MVP testing:

Supabase > Authentication > Providers > Email

Turn on Email provider.

For easiest testing, turn OFF email confirmation.

If you keep email confirmation ON, users must confirm their email before they can log in.

### 4. Add your Supabase keys

Open `config.js` and replace:

```js
const SUPABASE_URL = "PASTE_YOUR_SUPABASE_URL_HERE";
const SUPABASE_ANON_KEY = "PASTE_YOUR_SUPABASE_ANON_KEY_HERE";
```

Find these values here:

Supabase > Project Settings > API

Use:
- Project URL
- anon public key

Do not use the service role key in frontend code.

### 5. Upload to GitHub

Create a GitHub repo and upload all files.

### 6. Enable GitHub Pages

GitHub repo > Settings > Pages

Use:
- Source: Deploy from branch
- Branch: main
- Folder: /root

### 7. Test

Create an account, add players, save a session, mark attendance, save ratings and create a match report.

Refresh the page and log back in. Your saved data should reload.

## Important

GitHub Pages cannot run a backend server. Supabase is the backend.

This app is fully functional once Supabase is configured.
