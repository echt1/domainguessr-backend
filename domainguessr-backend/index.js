// index.js
import express from "express";
import fetch from "node-fetch";

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3000;
const TALO_API = "https://api.talo.dev"; // Beispiel-Endpunkt
const API_KEY = process.env.TALO_KEY;

// Root-Route (Test)
app.get("/", (req, res) => {
  res.send("✅ DomainGuessr Backend läuft!");
});

// Beispiel: Spieler registrieren / einloggen
app.post("/login", async (req, res) => {
  const { username } = req.body;

  try {
    const response = await fetch(`${TALO_API}/players`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ username }),
    });

    const data = await response.json();
    res.json(data);
  } catch (err) {
    console.error("Fehler bei /login:", err);
    res.status(500).json({ error: "Serverfehler" });
  }
});

app.listen(PORT, () => console.log(`🚀 Backend läuft auf Port ${PORT}`));
