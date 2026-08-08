const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const DATA_FILE = path.join(__dirname, 'data', 'waitlist.json');
const STARTING_COUNT = 1204; // seed so early visitors don't see an empty room

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function readWaitlist() {
  try {
    return JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
  } catch {
    return [];
  }
}

function writeWaitlist(entries) {
  fs.mkdirSync(path.dirname(DATA_FILE), { recursive: true });
  fs.writeFileSync(DATA_FILE, JSON.stringify(entries, null, 2));
}

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

app.get('/api/waitlist/count', (req, res) => {
  const entries = readWaitlist();
  res.json({ count: STARTING_COUNT + entries.length });
});

app.post('/api/waitlist', (req, res) => {
  const email = String(req.body?.email || '').trim().toLowerCase();

  if (!EMAIL_RE.test(email)) {
    return res.status(400).json({ error: 'That email doesn\'t look right. Check it and try again.' });
  }

  const entries = readWaitlist();

  if (entries.some((entry) => entry.email === email)) {
    return res.json({ ok: true, count: STARTING_COUNT + entries.length, alreadyJoined: true });
  }

  entries.push({ email, joinedAt: new Date().toISOString() });
  writeWaitlist(entries);

  res.json({ ok: true, count: STARTING_COUNT + entries.length, alreadyJoined: false });
});

app.listen(PORT, () => {
  console.log(`Scenepilot running at http://localhost:${PORT}`);
});
