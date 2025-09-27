const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");

const app = express();
app.use(cors());
app.use(bodyParser.json());

let scores = []; // Hier speichern wir die Scores im Speicher

// Root
app.get("/", (req, res) => {
  res.send("✅ DomainGuessr Backend läuft!");
});

// Score speichern
app.post("/score", (req, res) => {
  const { username, points } = req.body;
  if (!username || !points) {
    return res.status(400).json({ error: "Username und Punkte erforderlich" });
  }
  scores.push({ username, points });
  scores.sort((a, b) => b.points - a.points);
  scores = scores.slice(0, 50); // nur Top 50 halten
  res.json({ success: true });
});

// Leaderboard abrufen
app.get("/leaderboard", (req, res) => {
  res.json(scores.slice(0, 10)); // nur Top 10 zurückgeben
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Backend läuft auf Port ${PORT}`);
});

import fetch from "node-fetch";

const app = express();
const PORT = process.env.PORT || 3000;

// Talo Config
const TALO_API = "https://api.talo.gg/v1";
const TALO_KEY = process.env.TALO_KEY; // im Render-Dashboard als Env Variable setzen

app.use(bodyParser.json());

// Healthcheck
app.get("/", (req, res) => {
  res.send("✅ DomainGuessr Backend läuft mit Talo-Leaderboard!");
});

// Score speichern
app.post("/submit-score", async (req, res) => {
  const { playerId, score } = req.body;

  if (!playerId || !score) {
    return res.status(400).json({ error: "playerId und score erforderlich" });
  }

  try {
    const response = await fetch(`${TALO_API}/leaderboards/dg-singleplayer/scores`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${TALO_KEY}`,
      },
      body: JSON.stringify({
        playerId,
        score,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      return res.status(500).json({ error: data });
    }

    res.json({ success: true, data });
  } catch (err) {
    console.error("Fehler beim Score eintragen:", err);
    res.status(500).json({ error: "Serverfehler" });
  }
});

// Leaderboard abrufen
app.get("/leaderboard", async (req, res) => {
  try {
    const response = await fetch(`${TALO_API}/leaderboards/dg-singleplayer`, {
      headers: {
        Authorization: `Bearer ${TALO_KEY}`,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      return res.status(500).json({ error: data });
    }

    res.json(data);
  } catch (err) {
    console.error("Fehler beim Leaderboard abrufen:", err);
    res.status(500).json({ error: "Serverfehler" });
  }
});

app.listen(PORT, () => {
  console.log(`Backend läuft auf Port ${PORT}`);
});


