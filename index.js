console.log("TALO_KEY:", process.env.TALO_KEY ? "✅ Gefunden" : "❌ Nicht gefunden");
// ====== FINALER KORRIGIERTER CODE für deine index.js ======
// Mit der korrekten /entries URL

import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import fetch from "node-fetch";

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json());

const TALO_API = "https://api.trytalo.com/v1"; 
const TALO_KEY = process.env.TALO_KEY;
const TALO_LEADERBOARD_ID = "dg-singleplayer";

app.get("/", (req, res) => {
  res.send("✅ DomainGuessr Backend läuft mit Talo-Leaderboard!");
});

app.post("/submit-score", async (req, res) => {
  const { playerId, score } = req.body;

  if (!playerId || typeof score !== "number") {
    return res.status(400).json({ error: "playerId (string) und score (number) erforderlich" });
  }
  if (!TALO_KEY) {
    return res.status(500).json({ error: "TALO_KEY ist auf dem Server nicht konfiguriert." });
  }

  try {
    // KORREKTUR: /entries statt /scores
    const response = await fetch(`${TALO_API}/leaderboards/${TALO_LEADERBOARD_ID}/entries`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${TALO_KEY}`,
      },
      body: JSON.stringify({ playerId, score }),
    });

    const data = await response.json();
    if (!response.ok) throw new Error(JSON.stringify(data));
    res.json({ success: true, data });
  } catch (err) {
    console.error("Fehler beim Score eintragen:", err.message);
    res.status(500).json({ error: "Serverfehler beim Score eintragen" });
  }
});

app.get("/leaderboard", async (req, res) => {
  if (!TALO_KEY) {
    return res.status(500).json({ error: "TALO_KEY ist auf dem Server nicht konfiguriert." });
  }

  try {
    // KORREKTUR: /entries statt ohne alles
    const response = await fetch(`${TALO_API}/leaderboards/${TALO_LEADERBOARD_ID}/entries`, {
      headers: { Authorization: `Bearer ${TALO_KEY}` },
    });

    const data = await response.json();
    if (!response.ok) throw new Error(JSON.stringify(data));
    res.json(data);
  } catch (err) {
    console.error("Fehler beim Leaderboard abrufen:", err.message);
    res.status(500).json({ error: "Serverfehler beim Leaderboard abrufen" });
  }
});

app.listen(PORT, () => {
  console.log(`✅ Backend läuft auf Port ${PORT}`);
});

