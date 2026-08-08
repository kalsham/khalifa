# Scenepilot

Landing page and waitlist for **Scenepilot** — an AI editor that turns raw
footage into a finished, ready-to-post cut: it logs your takes, assembles a
rough cut, grades color and audio, then mixes in music and captions.

## Run it locally

```bash
npm install
npm start
```

Then open http://localhost:3000.

## How the waitlist works

`server.js` is a small Express app that serves `public/` and exposes two
endpoints:

- `POST /api/waitlist` — validates and stores an email in `data/waitlist.json`
- `GET /api/waitlist/count` — returns the current signup count (seeded at
  1,204 so the page doesn't launch empty)

`data/waitlist.json` is git-ignored since it's runtime data. For a real
deployment, swap the JSON file for a proper database (Postgres, SQLite,
Airtable, whatever you're already using) behind the same two routes — the
frontend doesn't need to change.

## Structure

```
server.js          Express app + waitlist API
public/index.html  Page markup
public/styles.css  Design system + layout
public/script.js   Timeline animation + waitlist form handling
data/               Waitlist storage (git-ignored)
```
