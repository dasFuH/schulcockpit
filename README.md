# 🎒 Schul-Cockpit

Ein einfaches, mobile-first Tool, das einer Schülerin hilft, den Schulalltag zu
strukturieren: **Hausaufgaben** rechtzeitig erledigen, **Klassenarbeiten**
gezielt vorbereiten und täglich den Überblick über **Unterrichtsinhalte**
behalten.

Die App ist bewusst **kein Kontrollsystem**. Die Schüleransicht steht im
Mittelpunkt; Eltern sehen nur einen groben Überblick.

---

## ✨ Funktionen (MVP)

- **Login** mit zwei Rollen: Schüler:in (Vollzugriff) & Eltern (nur Überblick)
- **Registrierung** für Schülerkonten und **Nutzerverwaltung** für verknüpfte Elternkonten
- **Fächerverwaltung** mit Farben
- **Hausaufgaben**: Fach, Abgabedatum, Aufwand, Status (offen/angefangen/erledigt),
  „Ich brauche Hilfe", Foto-/Datei-Anhang
- **Tagesnotizen**: Thema, Verständnis-Ampel (🟢🟡🔴), Unklarheiten, KA-Relevanz
- **Klassenarbeiten**: Datum, Themen, Materialien, Lernstatus
- **Dashboard**: Was ist heute/morgen/diese Woche fällig? Überfällig? Anstehende
  Arbeiten? Gelbe/rote Themen?
- **Wochencheck** (für Sonntagabend): offene Aufgaben, kommende Abgaben & Arbeiten,
  unklare Themen + konkreter Lernplan-Vorschlag
- **Datei-Uploads** in lokalen Storage (geschützt ausgeliefert)

---

## 🧱 Tech-Stack

| Bereich        | Technologie                          |
| -------------- | ------------------------------------ |
| Framework      | Next.js 15 (App Router, TypeScript)  |
| UI             | Tailwind CSS (mobile-first)          |
| Datenbank      | PostgreSQL 16                        |
| ORM            | Prisma 6                             |
| Auth           | Cookie-Session (JWT via `jose`) + bcrypt |
| Uploads        | Lokaler Storage (`/uploads`)         |
| Deployment     | Docker Compose + Caddy (HTTPS)       |

---

## 📂 Projektstruktur

```
.
├─ prisma/
│  ├─ schema.prisma         # Datenmodell
│  ├─ migrations/           # SQL-Migrationen
│  └─ seed.ts               # Demo-Daten
├─ src/
│  ├─ app/
│  │  ├─ (app)/             # Eingeloggte Seiten (Dashboard, HA, Notizen, …)
│  │  ├─ login/             # Login-Seite
│  │  ├─ registrieren/      # Registrierung für Schülerkonten
│  │  ├─ actions/           # Server Actions (CRUD)
│  │  └─ api/files/         # Geschützte Datei-Auslieferung
│  ├─ components/           # UI-Bausteine + Formulare
│  └─ lib/                  # prisma, auth, dates, queries, upload, validation
├─ docker-compose.yml
├─ Dockerfile
├─ Caddyfile
└─ scripts/                 # backup.sh / restore.sh
```

---

## 🚀 Lokal starten

### Variante A: Datenbank in Docker, App lokal (schnellste Entwicklung)

```bash
# 1) Env vorbereiten
cp .env.example .env
#   AUTH_SECRET setzen, z. B.:
#   openssl rand -base64 32   ->  in .env eintragen

# 2) Nur die Datenbank starten
docker compose up -d db

# 3) Abhängigkeiten + Migration + Seed
npm install
npm run prisma:deploy       # wendet die Migration an
npm run db:seed             # legt Demo-Konten & Beispieldaten an

# 4) Dev-Server
npm run dev
# -> http://localhost:3000
```

> Stelle sicher, dass `DATABASE_URL` in `.env` auf `localhost:5432` zeigt
> (so steht es in `.env.example`).

### Variante B: Alles in Docker

```bash
cp .env.example .env        # AUTH_SECRET setzen!
docker compose up --build
# Migrationen laufen automatisch beim Start.
# Optional Demo-Daten: SEED_ON_START=true in .env setzen.
# -> http://localhost:3000
```

### Demo-Logins (nach Seed)

| Rolle      | E-Mail                     | Passwort      |
| ---------- | -------------------------- | ------------- |
| Schülerin  | `schuelerin@cockpit.local` | `schueler123` |
| Eltern     | `eltern@cockpit.local`     | `eltern123`   |

---

## 🌐 Deployment auf einem VPS

1. **Projekt auf den Server** bringen (git clone / scp) und `.env` anlegen:
   ```bash
   cp .env.example .env
   # AUTH_SECRET (zufällig), POSTGRES_PASSWORD,
   # APP_DOMAIN=cockpit.deine-domain.de, ACME_EMAIL=… setzen
   ```
2. **DNS**: A-Record von `APP_DOMAIN` auf die Server-IP zeigen lassen.
3. **Starten** inkl. Caddy (automatisches HTTPS):
   ```bash
   docker compose --profile proxy up -d --build
   ```
   Caddy holt automatisch ein Let's-Encrypt-Zertifikat.

   Wenn du Host-Ports ändern musst, ändere nur die linke Seite des Port-Mappings
   über `.env`, z. B. `WEB_PORT=8080`. Der Web-Container hört intern weiterhin
   auf `3000`, deshalb muss das effektive Mapping `8080:3000` sein. Caddy proxyt
   im Compose-Netz ebenfalls weiter auf `web:3000`.

   Für öffentliches HTTPS mit Let's Encrypt müssen `HTTP_PORT=80` und
   `HTTPS_PORT=443` von außen erreichbar sein.

   Wenn der Start auf dem VPS fehlschlägt, zuerst diese Diagnose ausführen:
   ```bash
   docker compose --profile proxy ps
   docker compose logs --no-color --tail=120 db web caddy
   docker compose exec db psql -U "$POSTGRES_USER" -d "$POSTGRES_DB" -c 'SELECT 1;'
   ```
   Häufige Ursache: Das Volume `db_data` wurde schon mit einem alten
   `POSTGRES_PASSWORD` initialisiert. PostgreSQL übernimmt ein später geändertes
   Passwort aus `.env` nicht automatisch. Dann entweder das alte Passwort wieder
   eintragen oder die Daten sichern und die DB gezielt neu initialisieren.
4. Erstkonto anlegen: einmalig `SEED_ON_START=true` setzen **oder** Seed manuell
   ausführen:
   ```bash
   docker compose exec web npx tsx prisma/seed.ts
   ```
   > Ändere danach die Demo-Passwörter (oder lege eigene Nutzer an).

Hinter Caddy kannst du in `docker-compose.yml` die `ports`-Freigabe von `web`
und `db` entfernen, damit nur 80/443 nach außen offen sind.

---

## 💾 Backup & Restore

```bash
# Backup (DB-Dump + Uploads-Archiv nach ./backups)
./scripts/backup.sh

# Automatisch per Cron (täglich 3 Uhr):
0 3 * * * cd /opt/schulcockpit && ./scripts/backup.sh >> backups/backup.log 2>&1

# Wiederherstellen
./scripts/restore.sh backups/db_JJJJMMTT_HHMMSS.sql.gz
```

---

## 🔧 Nützliche Befehle

```bash
npm run dev             # Entwicklung
npm run build           # Produktions-Build (inkl. prisma generate)
npm run prisma:studio   # Daten im Browser ansehen
npm run prisma:migrate  # neue Migration während der Entwicklung
npm run db:seed         # Demo-Daten neu einspielen
```

---

## 🏷️ Versionierung

Die aktuelle App-Version steht in `package.json`. Release-Regeln sind in
`RELEASE.md` dokumentiert, veröffentlichte Änderungen in `CHANGELOG.md`.

---

## 🧭 Rollen & Datenschutz-Idee

- **Schüler:in** hat den vollen Funktionsumfang und gestaltet ihre Ansicht selbst.
- **Schüler:in** kann im Bereich „Nutzer" eigene Kontodaten pflegen und Elternkonten anlegen.
- **Eltern** sehen nur: Anzahl offener Aufgaben, anstehende Klassenarbeiten,
  rote Themen und wo Hilfe gewünscht ist – **keine** Detailtexte, keine
  Bearbeitung. Elternkonten werden explizit einem Schülerkonto zugeordnet.

---

## 🛣️ Nicht im MVP (später möglich)

Push-Benachrichtigungen, native App, KI-Lernplan-Agenten, MinIO/S3, Redis,
feingranulare Elternkontrolle. Das Datenmodell (`Lernaufgabe`) ist bereits für
einen späteren automatischen **Lernplan** vorbereitet.
