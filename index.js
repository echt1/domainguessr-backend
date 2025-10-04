// ====== TEMPORÄRER DEBUG-CODE ZUM HARDCODEN DES KEYS ======

import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import fetch from "node-fetch";

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json());

const TALO_API = "https://api.trytalo.com/v1";
const TALO_LEADERBOARD_ID = "dg-singleplayer";
const TALO_PLAYER_SERVICE = "domainguessr-web";

// !!! ACHTUNG: NUR ZUM TESTEN !!!
// const TALO_KEY = process.env.TALO_KEY; // Originale Zeile deaktiviert
const TALO_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOjY3NywiYXBpIjp0cnVlLCJpYXQiOjE3NTg5MDcxMzV9.XzzJG_AZ87qAAD8k6ENoHIu5QjFGlY-rRnr4yczUYcU"; // Füge den Key aus dem Text-Editor hier ein

console.log("TALO_KEY (Hardcoded Test):", TALO_KEY ? "✅ Wert vorhanden" : "❌ Wert fehlt");

// Der Rest des Codes bleibt exakt gleich...
// ... (ich lasse ihn hier weg, damit es übersichtlich bleibt, du musst nur die Zeilen oben ändern)
// Wir definieren einen eindeutigen Namen für unser Spiel als "Service"
const TALO_PLAYER_SERVICE = "domainguessr-web";

console.log("TALO_KEY:", TALO_KEY ? "✅ Gefunden" : "❌ Nicht gefunden");

app.get("/", (req, res) => {
  res.send("✅ DomainGuessr Backend läuft mit Talo-Leaderboard!");
});

app.post("/submit-score", async (req, res) => {
  const { playerId, score } = req.body;

  if (!playerId || typeof score !== "number") {
    return res.status(400).json({ error: "playerId und score erforderlich" });
  }
  if (!TALO_KEY) {
    return res.status(500).json({ error: "TALO_KEY ist nicht konfiguriert." });
  }

  try {
    // --- SCHRITT 1: Spieler bei Talo identifizieren (oder erstellen) ---
    console.log(`Identifiziere Spieler: ${playerId}`);
    const identifyResponse = await fetch(`${TALO_API}/players/identify?service=${TALO_PLAYER_SERVICE}&identifier=${encodeURIComponent(playerId)}`, {
      headers: { "Authorization": `Bearer ${TALO_KEY}` },
    });
    
    const playerData = await identifyResponse.json();
    if (!identifyResponse.ok) {
        console.error("Talo Spieler-Identifizierung Fehler:", playerData);
        throw new Error(`Spieler-Identifizierung fehlgeschlagen: ${JSON.stringify(playerData)}`);
    }

    const aliasId = playerData.alias.id;
    console.log(`Spieler identifiziert. Alias ID: ${aliasId}`);

    // --- SCHRITT 2: Score für den identifizierten Spieler einreichen ---
    const scoreResponse = await fetch(`${TALO_API}/leaderboards/${TALO_LEADERBOARD_ID}/entries`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${TALO_KEY}`,
      },
      // Wir übergeben die aliasId, die wir von Talo bekommen haben
      body: JSON.stringify({ aliasId: aliasId, score: score }),
    });

    const scoreData = await scoreResponse.json();
    if (!scoreResponse.ok) {
        console.error("Talo Score-Eintrag Fehler:", scoreData);
        throw new Error(`Score-Eintrag fehlgeschlagen: ${JSON.stringify(scoreData)}`);
    }

    console.log("Score erfolgreich eingetragen.");
    res.json({ success: true, data: scoreData });

  } catch (err) {
    console.error("Ein Fehler ist im /submit-score Prozess aufgetreten:", err.message);
    res.status(500).json({ error: "Serverfehler beim Score eintragen" });
  }
});

// Das Abrufen des Leaderboards bleibt gleich, da es keine Spieler-ID braucht.
app.get("/leaderboard", async (req, res) => {
  if (!TALO_KEY) {
    return res.status(500).json({ error: "TALO_KEY ist nicht konfiguriert." });
  }
  try {
    const response = await fetch(`${TALO_API}/leaderboards/${TALO_LEADERBOARD_ID}/entries`, {
      headers: { "Authorization": `Bearer ${TALO_KEY}` },
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

