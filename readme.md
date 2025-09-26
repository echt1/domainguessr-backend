Backend für Talo-Anbindung

Dieses Projekt stellt ein einfaches Node.js-Backend bereit, das als Schnittstelle zwischen Frontend (zum Beispiel Google Sites oder CrazyGames) und Talo dient. Das Backend wird auf Render gehostet.

Installation lokal:

1. Repository klonen oder Ordner herunterladen
   git clone <repo-url>
   cd <ordnername>

2. Abhängigkeiten installieren
   npm install

3. Backend starten
   npm start

Deployment auf Render:

1. Erstelle einen Account bei https://render.com

2. Lade den Ordner mit package.json und deinem Backend-Code auf GitHub hoch

3. Gehe in Render auf New -> Web Service und wähle dein GitHub-Repository aus

4. Stelle die folgenden Einstellungen ein:
   Environment: Node
   Build Command:
     npm install
   Start Command:
     npm start

5. Unter Environment Variables hinzufügen:
   TALO_KEY = dein_geheimer_talo_key

6. Klicke auf Deploy. Render baut dein Projekt und gibt dir eine öffentliche URL, zum Beispiel:
   https://dein-backend.onrender.com

Nutzung:

Dein Frontend kann über diese URL mit deinem Backend kommunizieren. Das Backend leitet Anfragen an Talo weiter und verwendet dabei den geheimen TALO_KEY, der nur im Render-Backend gespeichert ist.

Projektstruktur Beispiel:

backend/
│
├── index.js        # Startpunkt für den Server
├── package.json    # Enthält Abhängigkeiten und Startskript
├── README.md       # Diese Datei

Hinweis:

Der TALO_KEY darf niemals im Frontend stehen, sondern nur als Environment Variable auf Render. Falls du zusätzliche Variablen brauchst, kannst du sie ebenfalls unter Environment Variables in Render hinzufügen.
