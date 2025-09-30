<!DOCTYPE html>
<html lang="de">
<head>
  <meta charset="UTF-8">
  <title>DomainGuessr</title>
  <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;600&display=swap" rel="stylesheet">
  
  <style>
    :root { --accent-color: #FFD700; --bg-color: #02133E; --button-color: #0A2A6A; --button-hover: #1A4A9A; --sub-button: #072051; }
    body { background-color: var(--bg-color); color: white; font-family: 'Poppins', sans-serif; text-align: center; padding: 20px; margin: 0; display: flex; justify-content: center; align-items: center; min-height: 100vh; box-sizing: border-box; }
    .container { width: 100%; max-width: 500px; }
    .hidden { display: none; }
    #logo { max-width: 280px; margin-bottom: 20px; }
    .button-group { margin-bottom: 10px; }
    button { padding: 12px 25px; width: 220px; margin: 5px; background-color: var(--button-color); border: none; color: white; border-radius: 8px; cursor: pointer; font-size: 1.1rem; font-family: 'Poppins', sans-serif; transition: background-color 0.2s; }
    button:hover { background-color: var(--button-hover); }
    button:disabled { background-color: #555; cursor: not-allowed; }
    .sub-button { width: 180px; font-size: 0.9rem; padding: 8px 20px; background-color: var(--sub-button); }
    #domain, #endlessDomain { font-size: 2.5rem; font-weight: 600; margin: 15px 0; color: var(--accent-color); min-height: 48px; }
    input { padding: 10px; font-size: 1.1rem; border-radius: 8px; border: none; text-align: center; width: 280px; font-family: 'Poppins', sans-serif; }
    .home-button { background: none; border: none; color: white; font-size: 1.5rem; cursor: pointer; position: absolute; top: 20px; left: 20px; }
    #player-stats { margin-bottom: 15px; }
    #xp-bar-container { width: 80%; max-width: 300px; height: 20px; background-color: var(--sub-button); border-radius: 10px; margin: 5px auto; overflow: hidden; }
    #xp-bar { width: 0%; height: 100%; background-color: var(--accent-color); border-radius: 10px; transition: width 0.5s ease; }
    #xp-text { font-size: 0.8rem; }
  </style>
</head>

<body>
  <div class="container">
    <div id="mainMenu">
      <img src="https://i.imgur.com/QnBLIYi.png" alt="Logo" id="logo">
      <div class="button-group">
          <button onclick="startSingleplayer()">Singleplayer</button><br>
          <button class="sub-button" onclick="startEndlessMode()">Endlos</button>
      </div>
      <div class="button-group">
          <button onclick="alert('Multiplayer kommt bald!')">Multiplayer</button><br>
          <button class="sub-button" onclick="alert('Party-Modus kommt bald!')">Party</button>
      </div>
      <div class="button-group">
          <button onclick="showLeaderboard()">Leaderboard</button>
      </div>
    </div>

    <div id="game" class="hidden">
      <div id="player-stats">
        <div id="level-text">Level 1</div>
        <div id="xp-bar-container"><div id="xp-bar"></div></div>
        <div id="xp-text">0 / 100 XP</div>
      </div>
      <h2 id="roundInfo"></h2>
      <div id="domain"></div>
      <input id="guess" type="text" placeholder="Antwort eingeben...">
      <button onclick="skipDomain()">Skip</button>
    </div>
    
    <div id="endlessGame" class="hidden">
      <button class="home-button" onclick="backToMenu()">&#x1F3E0;</button>
      <h2>Endlos-Modus</h2>
      <div id="endlessDomain"></div>
      <input id="endlessGuess" type="text" placeholder="Antwort eingeben...">
      <div id="endlessAnswerFlash" style="margin-top: 15px; color: var(--accent-color); font-size: 1.2rem; min-height: 20px;"></div>
      <div id="endlessScore" style="margin-top: 20px; font-size: 1.2rem;"></div>
      <button id="endlessSkipBtn" style="margin-top: 10px;">Skip</button>
    </div>

    <div id="gameOver" class="hidden">
      <h2>Runde beendet!</h2>
      <p id="finalScore"></p>
      <p id="xpGained"></p>
      <input id="username" placeholder="Dein Name für das Leaderboard">
      <button id="submitScoreBtn" onclick="submitScore()">Score hochladen</button>
      <button onclick="backToMenu()">Zurück zum Menü</button>
    </div>

    <div id="leaderboard" class="hidden">
      <h2>Leaderboard</h2>
      <ul id="leaderboardList" style="list-style: none; padding: 0; max-width: 400px; margin: 20px auto;"></ul>
      <button onclick="backToMenu()">Zurück zum Menü</button>
    </div>
  </div>

<script>
const backendUrl = "https://domainguessr-backend.onrender.com";
const domains = [ /* DEINE RIESIGE DOMAIN-LISTE HIER */ 
    {tld: ".de", answers: ["deutschland", "germany"], difficulty: 1},{tld: ".com", answers: ["kommerziell", "commercial"], difficulty: 1},{tld: ".org", answers: ["organisation", "organization"], difficulty: 1},{tld: ".net", answers: ["netzwerk", "network"], difficulty: 1},{tld: ".uk", answers: ["vereinigtes königreich", "united kingdom", "england", "uk"], difficulty: 1},{tld: ".us", answers: ["usa", "vereinigte staaten", "united states", "america"], difficulty: 1},{tld: ".fr", answers: ["frankreich", "france"], difficulty: 1},{tld: ".it", answers: ["italien", "italy"], difficulty: 1},{tld: ".es", answers: ["spanien", "spain"], difficulty: 1},{tld: ".cn", answers: ["china"], difficulty: 1},{tld: ".jp", answers: ["japan"], difficulty: 2},{tld: ".ca", answers: ["kanada", "canada"], difficulty: 2},{tld: ".au", answers: ["australien", "australia"], difficulty: 2},{tld: ".ch", answers: ["schweiz", "switzerland"], difficulty: 2},{tld: ".at", answers: ["österreich", "austria"], difficulty: 2},{tld: ".nl", answers: ["niederlande", "netherlands", "holland"], difficulty: 2},{tld: ".ru", answers: ["russland", "russia"], difficulty: 2},{tld: ".in", answers: ["indien", "india"], difficulty: 2},{tld: ".br", answers: ["brasilien", "brazil"], difficulty: 2},{tld: ".gov", answers: ["regierung", "government"], difficulty: 2},{tld: ".pl", answers: ["polen", "poland"], difficulty: 3},{tld: ".se", answers: ["schweden", "sweden"], difficulty: 3},{tld: ".no", answers: ["norwegen", "norway"], difficulty: 3},{tld: ".dk", answers: ["dänemark", "denmark"], difficulty: 3},{tld: ".be", answers: ["belgien", "belgium"], difficulty: 3},{tld: ".pt", answers: ["portugal"], difficulty: 3},{tld: ".gr", answers: ["griechenland", "greece"], difficulty: 3},{tld: ".ie", answers: ["irland", "ireland"], difficulty: 3},{tld: ".mx", answers: ["mexiko", "mexico"], difficulty: 3},{tld: ".za", answers: ["südafrika", "south africa"], difficulty: 3},{tld: ".hr", answers: ["kroatien", "croatia"], difficulty: 4},{tld: ".sg", answers: ["singapur", "singapore"], difficulty: 4},{tld: ".ae", answers: ["vereinigte arabische emirate", "uae", "emirates"], difficulty: 4},{tld: ".kr", answers: ["südkorea", "south korea", "korea"], difficulty: 4},{tld: ".fi", answers: ["finnland", "finland"], difficulty: 4},{tld: ".cz", answers: ["tschechien", "czech", "czechia"], difficulty: 4},{tld: ".hu", answers: ["ungarn", "hungary"], difficulty: 4},{tld: ".ro", answers: ["rumänien", "romania"], difficulty: 4},{tld: ".ar", answers: ["argentinien", "argentina"], difficulty: 4},{tld: ".cl", answers: ["chile"], difficulty: 4},{tld: ".mk", answers: ["mazedonien", "north macedonia"], difficulty: 5},{tld: ".vu", answers: ["vanuatu"], difficulty: 5},{tld: ".uz", answers: ["usbekistan", "uzbekistan"], difficulty: 5},{tld: ".si", answers: ["slowenien", "slovenia"], difficulty: 5},{tld: ".is", answers: ["island", "iceland"], difficulty: 5},{tld: ".lu", answers: ["luxemburg", "luxembourg"], difficulty: 5},{tld: ".ee", answers: ["estland", "estonia"], difficulty: 5},{tld: ".lv", answers: ["lettland", "latvia"], difficulty: 5},{tld: ".lt", answers: ["litauen", "lithuania"], difficulty: 5},{tld: ".bg", answers: ["bulgarien", "bulgaria"], difficulty: 5}
];

let gameState = {};
const allScreens = ["mainMenu", "game", "gameOver", "leaderboard", "endlessGame"];
let playerState = { level: 1, xp: 0 };

function getXpForNextLevel(level) { return Math.floor(100 * Math.pow(1.15, level - 1)); }
function loadPlayerState() { const savedState = localStorage.getItem('domainGuessrPlayerState'); if (savedState) playerState = JSON.parse(savedState); updatePlayerUI(); }
function savePlayerState() { localStorage.setItem('domainGuessrPlayerState', JSON.stringify(playerState)); }
function addXp(amount) { playerState.xp += amount; const neededXp = getXpForNextLevel(playerState.level); if (playerState.xp >= neededXp) { playerState.level++; playerState.xp -= neededXp; } savePlayerState(); updatePlayerUI(); }
function updatePlayerUI() { const neededXp = getXpForNextLevel(playerState.level); const xpPercentage = (playerState.xp / neededXp) * 100; document.getElementById('level-text').textContent = `Level ${playerState.level}`; document.getElementById('xp-text').textContent = `${playerState.xp} / ${neededXp} XP`; document.getElementById('xp-bar').style.width = `${xpPercentage}%`; }
function showScreen(screenId) { allScreens.forEach(id => document.getElementById(id).classList.add("hidden")); document.getElementById(screenId).classList.remove("hidden"); }

function startSingleplayer() { gameState = { round: 0, score: 0, xpThisRound: 0, recentDomains: [], current: {} }; loadPlayerState(); showScreen("game"); nextDomain(); }
function getDomainPool() { const level = playerState.level; if (level <= 5) return domains.filter(d => d.difficulty === 1); if (level <= 10) return domains.filter(d => d.difficulty <= 2); if (level <= 15) return domains.filter(d => d.difficulty >= 2 && d.difficulty <= 3); if (level <= 20) return domains.filter(d => d.difficulty >= 3 && d.difficulty <= 4); return domains.filter(d => d.difficulty >= 4); }
function nextDomain() { if (gameState.round >= 10) { endGame(); return; } const pool = getDomainPool(); let candidate; do { candidate = pool[Math.floor(Math.random() * pool.length)]; } while (gameState.recentDomains.includes(candidate.tld)); gameState.current = candidate; gameState.recentDomains.push(gameState.current.tld); document.getElementById("domain").textContent = gameState.current.tld; document.getElementById("guess").value = ""; document.getElementById("roundInfo").textContent = `Frage ${gameState.round + 1}/10`; gameState.round++; }
document.getElementById("guess").addEventListener("input", () => { const guess = document.getElementById("guess").value.trim().toLowerCase(); if (gameState.current.answers.some(a => guess.includes(a))) { const xpGained = gameState.current.difficulty * 10; addXp(xpGained); gameState.xpThisRound += xpGained; gameState.score += gameState.current.difficulty * 100; nextDomain(); } });
function skipDomain() { nextDomain(); }
function endGame() { showScreen("gameOver"); document.getElementById("finalScore").textContent = `Dein Score: ${gameState.score}`; document.getElementById("xpGained").textContent = `Du hast ${gameState.xpThisRound} XP verdient!`; document.getElementById("submitScoreBtn").disabled = false; document.getElementById("submitScoreBtn").textContent = "Score hochladen"; }

function startEndlessMode() { gameState = { score: 0, correctCount: 0, recent: [], current: {} }; showScreen("endlessGame"); document.getElementById("endlessScore").textContent = "Score: 0"; nextEndlessDomain(); }
function nextEndlessDomain() { document.getElementById("endlessGuess").value = ""; document.getElementById("endlessAnswerFlash").style.display = "none"; let candidate; do { candidate = domains[Math.floor(Math.random() * domains.length)]; } while (gameState.recent.includes(candidate.tld)); gameState.current = candidate; gameState.recent.push(gameState.current.tld); if (gameState.recent.length > 50) gameState.recent.shift(); document.getElementById("endlessDomain").textContent = gameState.current.tld; }
document.getElementById("endlessGuess").addEventListener("input", () => { const guess = document.getElementById("endlessGuess").value.trim().toLowerCase(); if (gameState.current.answers.some(a => guess.includes(a))) { gameState.correctCount++; const streakBonus = Math.floor(gameState.correctCount / 10); gameState.score += 10 + streakBonus; document.getElementById("endlessScore").textContent = "Score: " + gameState.score; nextEndlessDomain(); } });
document.getElementById("endlessSkipBtn").addEventListener("click", () => { const flash = document.getElementById("endlessAnswerFlash"); flash.textContent = "Antwort: " + gameState.current.answers[0]; flash.style.display = "block"; setTimeout(() => nextEndlessDomain(), 1200); });

function backToMenu() { showScreen("mainMenu"); }

async function submitScore() {
    const username = document.getElementById("username").value.trim() || "Gast";
    const submitButton = document.getElementById("submitScoreBtn");
    submitButton.disabled = true;
    submitButton.textContent = "Lade hoch...";
    
    // HIER IST DER FIX: /submit-score und { playerId, score }
    try {
        const response = await fetch(`${backendUrl}/submit-score`, { 
            method: "POST", 
            headers: {"Content-Type": "application/json"}, 
            body: JSON.stringify({ playerId: username, score: gameState.score })
        });
        if (!response.ok) throw new Error(`Server antwortete mit Status: ${response.status}`);
        showLeaderboard();
    } catch (error) {
        console.error("Fehler beim Senden des Scores:", error);
        alert("Score konnte nicht hochgeladen werden. Ist der Server online? Bitte versuche es später erneut.");
        submitButton.disabled = false;
        submitButton.textContent = "Score hochladen";
    }
}

async function showLeaderboard() {
    showScreen("leaderboard");
    const list = document.getElementById("leaderboardList");
    list.innerHTML = "<li>Lade Leaderboard...</li>";
    try {
        const res = await fetch(`${backendUrl}/leaderboard`);
        if (!res.ok) throw new Error("Antwort vom Server nicht OK");
        const data = await res.json();
        
        // HIER IST DER FIX: Anpassung an die Talo-Datenstruktur
        list.innerHTML = "";
        if (data.scores && data.scores.length > 0) {
            data.scores.slice(0, 10).forEach((entry, i) => {
              const li = document.createElement("li");
              // Talo gibt den Namen unter entry.player.id oder einem ähnlichen Feld zurück
              li.textContent = `${entry.rank}. ${entry.player.id} – ${entry.score}`;
              list.appendChild(li);
            });
        } else {
            list.innerHTML = "<li>Noch keine Scores auf dem Leaderboard!</li>";
        }
    } catch (error) { 
        console.error("Fehler beim Abrufen des Leaderboards:", error);
        list.innerHTML = "<li>Leaderboard konnte nicht geladen werden.</li>"; 
    }
}
window.onload = loadPlayerState;
</script>
</body>
</html>
