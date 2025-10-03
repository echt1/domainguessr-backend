import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import fetch from "node-fetch";

const app = express();
const PORT = process.env.PORT || 3000;

const TALO_API = "https://api.trytalo.com/v1";
const TALO_KEY = process.env.TALO_KEY;
const TALO_LEADERBOARD_ID = "dg-singleplayer";

// Debug: zeig an, ob Key geladen ist
console.log("TALO_KEY:", TALO_KEY ? "✅ Gefunden" : "❌ Nicht gefunden");
if (TALO_KEY) {
  console.log("Gesendeter Key (erste 6):", TALO_KEY.slice(0, 6) + "...");
}

app.use(cors());
app.use(bodyParser.json());

// einfacher Test-Endpunkt
app.get("/", (req, res) => {
  res.send("✅ DomainGuessr Backend läuft mit Talo-Leaderboard!");
});

// Leaderboard-Abfrage mit wählbarer Header-Variante
app.get("/leaderboard", async (req, res) => {
  if (!TALO_KEY) {
    return res.status(500).json({ error: "TALO_KEY ist auf dem Server nicht konfiguriert." });
  }

  // Schalter: true = X-Access-Token, false = Authorization: Bearer
  const USE_X_ACCESS = true;

  try {
    const headers = {
      "Content-Type": "application/json",
    };

    if (USE_X_ACCESS) {
      headers["X-Access-Token"] = TALO_KEY;
    } else {
      headers["Authorization"] = `Bearer ${TALO_KEY}`;
    }

    console.log("👉 Nutze Header:", USE_X_ACCESS ? "X-Access-Token" : "Authorization: Bearer");

    const response = await fetch(`${TALO_API}/leaderboards/${TALO_LEADERBOARD_ID}/entries`, {
      headers,
    });

    const text = await response.text();
    console.log("RAW Antwort:", text);

    let data;
    try {
      data = JSON.parse(text);
    } catch {
      data = { raw: text };
    }

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
