// ====== AKTUALISIERTER index.js Code ======
console.log("TALO_KEY:", process.env.TALO_KEY ? "✅ Gefunden" : "❌ Nicht gefunden");

import express from "express";
import cors from "cors";
import bodyParser from "body-parser";

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json());

// Temporäre In-Memory-Speicherung für Lobbys { lobbyCode: peerId }
const lobbies = {};

// ===== NEUE ENDPUNKTE FÜR PARTY-MODUS =====

// Erstellt eine neue Lobby-Zuordnung
app.post("/create-lobby", (req, res) => {
    const { lobbyCode, peerId } = req.body;
    if (!lobbyCode || !peerId) {
        return res.status(400).json({ error: "lobbyCode and peerId are required." });
    }
    lobbies[lobbyCode] = peerId;
    console.log(`Lobby created: ${lobbyCode} -> ${peerId}`);

    // Lobby nach 10 Minuten automatisch löschen, um Speicher freizugeben
    setTimeout(() => {
        delete lobbies[lobbyCode];
        console.log(`Lobby ${lobbyCode} expired and was deleted.`);
    }, 600000);

    res.status(201).json({ success: true });
});

// Ruft die PeerID für einen Lobby-Code ab
app.get("/join-lobby/:lobbyCode", (req, res) => {
    const { lobbyCode } = req.params;
    const peerId = lobbies[lobbyCode];
    if (peerId) {
        res.json({ peerId });
    } else {
        res.status(404).json({ error: "Lobby not found." });
    }
});

const TALO_API = "https://api.trytalo.com/v1"; 
const TALO_KEY = process.env.TALO_KEY;
const TALO_LEADERBOARD_ID = "dg-singleplayer";
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




