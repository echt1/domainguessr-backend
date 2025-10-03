console.log("TALO_KEY:", process.env.TALO_KEY ? "✅ Gefunden" : "❌ Nicht gefunden");

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

console.log("Gesendeter Key (erste 6):", TALO_KEY ? TALO_KEY.slice(0, 6) + "..." : "❌ Keiner");

function getHeaders(type = "bearer") {
  if (type === "bearer") {
    return {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${TALO_KEY}`
    };
  } else if (type === "x-access") {
    return {
      "Content-Type": "application/json",
      "X-Access-Token": TALO_KEY
    };
  } else {
    return {
      "Content-Type": "application/json",
      "X-API-Key": TALO_KEY
    };
  }
}

app.get("/", (req, res) => {
  res.send("✅ DomainGuessr Backend läuft mit Talo-Leaderboard!");
});

// === SCORE EINTRAGEN ===
app.post("/submit-score", async (req, res) => {
  const { playerId, score } = req.body;

  if (!playerId || typeof score !== "number") {
    return res.status(400).json({ error: "playerId (string) und score (number) erforderlich" });
  }
  if (!TALO_KEY) {
    return res.status(500).json({ error: "TALO_KEY ist auf dem Server nicht konfiguriert." });
  }

  try {
    // Erst Bearer probieren
    let response = await fetch(`${TALO_API}/leaderboards/${TALO_LEADERBOARD_ID}/entries`, {
      method: "POST",
      headers: getHeaders("bearer"),
      body: JSON.stringify({ playerId, score }),
    });

    if (!response.ok) {
      console.warn("👉 Bearer fehlgeschlagen, versuche X-Access-Token...");
      response = await fetch(`${TALO_API}/leaderboards/${TALO_LEADERBOARD_ID}/entries`, {
        method: "POST",
        headers: getHeaders("x-access"),
        body: JSON.stringify({ playerId, score }),
      });
    }

    if (!response.ok) {
      console.warn("👉 X-Access-Token fehlgeschlagen, versuche X-API-Key...");
      response = await fetch(`${TALO_API}/leaderboards/${TALO_LEADERBOARD_ID}/entries`, {
        method: "POST",
        headers: getHeaders("x-api"),
        body: JSON.stringify({ playerId, score }),
      });
    }

    const data = await response.json();
    if (!response.ok) throw new Error(JSON.stringify(data));
    res.json({ success: true, data });
  } catch (err) {
    console.error("Fehler beim Score eintragen:", err.message);
    res.status(500).json({ error: "Serverfehler beim Score eintragen" });
  }
});

// === LEADERBOARD ABRUFEN ===
app.get("/leaderboard", async (req, res) => {
  if (!TALO_KEY) {
    return res.status(500).json({ error: "TALO_KEY ist auf dem Server nicht konfiguriert." });
  }

  try {
    let response = await fetch(`${TALO_API}/leaderboards/${TALO_LEADERBOARD_ID}/entries`, {
      headers: getHeaders("bearer"),
    });

    if (!response.ok) {
      console.warn("👉 Bearer fehlgeschlagen, versuche X-Access-Token...");
      response = await fetch(`${TALO_API}/leaderboards/${TALO_LEADERBOARD_ID}/entries`, {
        headers: getHeaders("x-access"),
      });
    }

    if (!response.ok) {
      console.warn("👉 X-Access-Token fehlgeschlagen, versuche X-API-Key...");
      response = await fetch(`${TALO_API}/leaderboards/${TALO_LEADERBOARD_ID}/entries`, {
        headers: getHeaders("x-api"),
      });
    }

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
