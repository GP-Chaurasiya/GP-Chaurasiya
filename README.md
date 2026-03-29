# Department Sports Scoreboard Website

A full website for managing sports matches for the **Department of Computer Science**.

## Features

- Team registration with:
  - Team name
  - Team ID
  - Course
  - Team photo
- Sport selection (Football, Cricket, Volleyball, etc.)
- Live scoreboard with + / - controls
- End-match result with:
  - Winner team name + photo
  - Runner-up team name + photo
- Department report table
- Downloadable reports:
  - JSON
  - CSV
- Local persistence using browser `localStorage`

## Files

- `index.html` — main UI structure
- `styles.css` — styling and layout
- `app.js` — logic for registration, scoring, results, and report export

## Run Locally

You can open `index.html` directly in a browser, or run a simple local server:

```bash
python3 -m http.server 8000
```

Then open: `http://localhost:8000`

## Usage Flow

1. Register at least two teams.
2. Setup match (sport + Team A + Team B).
3. Update scores live.
4. Click **End Match** to finalize winner/runner-up.
5. Download department report from buttons in the report section.
