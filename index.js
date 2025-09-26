// index.js
import express from "express";
import cors from "cors";

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Healthcheck
app.get("/", (req, res) => {
  res.send("✅ DomainGuessr Backend läuft!");
});

// Beispiel-Endpunkt: Spiel starten
app.get("/api/start", (req, res) => {
  res.json({
    message: "Spiel wurde gestartet!",
    timestamp: new Date().toISOString(),
  });
});

// Beispiel-Endpunkt: Highscore setzen
app.post("/api/highscore", (req, res) => {
  const { player, score } = req.body;
  if (!player || !score) {
    return res.status(400).json({ error: "player und score erforderlich!" });
  }
  res.json({
    message: "Highscore gespeichert!",
    player,
    score,
  });
});

// Beispiel-Endpunkt: Zufallszahl
app.get("/api/random", (req, res) => {
  const number = Math.floor(Math.random() * 100) + 1;
  res.json({ number });
});

// Start Server
app.listen(PORT, () => {
  console.log(`Backend läuft auf Port ${PORT}`);
});
