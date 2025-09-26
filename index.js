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
