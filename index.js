console.log("TALO_KEY:", process.env.TALO_KEY ? "✅ Gefunden" : "❌ Nicht gefunden");
// ====== DIESER FINALE CODE GEHÖRT IN DEINE index.js AUF RENDER ======

import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import fetch from "node-fetch";

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json());

// Talo Config
// Richtige API-Adresse mit Leaderboard-Endpunkt
const TALO_API = "https://api.trytalo.com/v1/leaderboards";
const TALO_KEY = process.env.TALO_KEY;

// Einfacher Healthcheck
app.get("/", (req, res) => {
  res.send("✅ DomainGuessr Backend läuft mit Talo-Leaderboard!");
});

// Score eintragen
app.post("/submit-score", async (req, res) => {
  const { playerId, score } = req.body;

  if (!playerId || typeof score !== "number") {
    return res.status(400).json({ error: "playerId (string) und score (number) erforderlich" });
  }
  if (!TALO_KEY) {
    return res.status(500).json({ error: "TALO_KEY ist auf dem Server nicht konfiguriert." });
  }

  try {
    const response = await fetch(`${TALO_API}/dg-singleplayer/entries`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${TALO_KEY}`,
      },
      body: JSON.stringify({ playerId, score }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("Talo API Fehler beim Score eintragen:", data);
      return res.status(response.status).json({ error: data });
    }

    res.json({ success: true, data });
  } catch (err) {
    console.error("Fehler beim Score eintragen:", err);
    res.status(500).json({ error: "Serverfehler" });
  }
});

// Leaderboard abrufen
app.get("/leaderboard", async (req, res) => {
  if (!TALO_KEY) return res.status(500).json({ error: "TALO_KEY nicht gesetzt" });

  try {
    const response = await fetch(`${TALO_API}/dg-singleplayer/entries`, {
      headers: { Authorization: `Bearer ${TALO_KEY}` }
    });
    const text = await response.text(); // statt .json()
    console.log("Talo API raw response:", text);
    res.send(text);
  } catch (err) {
    console.error("Fehler beim Leaderboard abrufen:", err);
    res.status(500).json({ error: "Serverfehler" });
  }
});


app.listen(PORT, () => {
  console.log(`✅ Backend läuft auf Port ${PORT}`);
});

