# Lønns- og Vaktapp

En mobil- og webvennlig app for vaktregistrering og lønnsberegning med adminpanel.

## Prosjektstruktur

```
agentmodus-lonn/
├── backend/                        # FastAPI backend (Python)
│   ├── app/
│   │   ├── main.py                 # FastAPI app + oppstart
│   │   ├── config.py               # Innstillinger (.env)
│   │   ├── database.py             # SQLAlchemy + SQLite
│   │   ├── models/                 # Databasemodeller
│   │   │   ├── user.py
│   │   │   ├── wage_settings.py
│   │   │   ├── shift_template.py
│   │   │   ├── shift.py
│   │   │   └── month_summary.py
│   │   ├── schemas/                # Pydantic-skjemaer (API-validering)
│   │   ├── routers/                # API-endepunkter
│   │   │   ├── auth.py
│   │   │   ├── users.py
│   │   │   ├── wage_settings.py
│   │   │   ├── shift_templates.py
│   │   │   ├── shifts.py
│   │   │   ├── calculator.py
│   │   │   ├── import_data.py
│   │   │   ├── export.py
│   │   │   └── admin.py
│   │   ├── services/               # Forretningslogikk
│   │   │   ├── wage_engine.py      # Lønnskalkulator
│   │   │   ├── export_service.py   # PDF, Excel, CSV
│   │   │   ├── import_service.py   # Import fra Excel/CSV
│   │   │   └── holiday_service.py  # Norske helligdager
│   │   ├── middleware/
│   │   │   └── auth.py             # JWT-autentisering
│   │   └── utils/
│   │       ├── security.py         # Passord-hashing, JWT
│   │       └── time_utils.py       # Tids-hjelp-funksjoner
│   ├── requirements.txt
│   └── .env.example
│
└── frontend/                       # React + TypeScript frontend
    ├── src/
    │   ├── App.tsx                  # Router og autentiserings-guards
    │   ├── main.tsx
    │   ├── index.css                # Tailwind + globale stiler
    │   ├── api/                     # API-kall til backend
    │   │   ├── client.ts            # Axios-klient med JWT
    │   │   ├── auth.ts
    │   │   ├── shifts.ts
    │   │   ├── shiftTemplates.ts
    │   │   ├── wageSettings.ts
    │   │   ├── calculator.ts
    │   │   └── admin.ts
    │   ├── components/
    │   │   ├── layout/              # Navigasjon og layout
    │   │   │   ├── BottomNav.tsx
    │   │   │   ├── Layout.tsx
    │   │   │   └── AdminLayout.tsx
    │   │   ├── calendar/            # Kalender-komponenter
    │   │   │   ├── ShiftChip.tsx
    │   │   │   └── AddShiftModal.tsx
    │   │   └── ui/                  # Gjenbrukbare UI-komponenter
    │   │       ├── Button.tsx
    │   │       ├── Input.tsx
    │   │       ├── Modal.tsx
    │   │       └── Card.tsx
    │   ├── pages/
    │   │   ├── auth/                # Innlogging og registrering
    │   │   ├── CalendarPage.tsx
    │   │   ├── TimerPage.tsx
    │   │   ├── ShiftCodesPage.tsx
    │   │   ├── CalculatorPage.tsx
    │   │   ├── ProfilePage.tsx
    │   │   ├── ImportPage.tsx
    │   │   ├── ExportPage.tsx
    │   │   └── admin/               # Adminpanel
    │   ├── store/                   # Zustand state management
    │   │   ├── authStore.ts
    │   │   └── timerStore.ts
    │   ├── types/                   # TypeScript-typer
    │   └── utils/                   # Hjelpefunksjoner
    ├── package.json
    ├── vite.config.ts
    ├── tailwind.config.js
    └── tsconfig.json
```

## Funksjonalitet

### Bruker
- Registrering og innlogging (JWT, GDPR-samtykke)
- Profil med arbeidssted, stilling, ansettelsestype
- **Lønnsinnstillinger**: timesats, kveld/natt/helg/helligdagstillegg, overtid (dag/uke-terskel), pause, skatt, feriepenger
- **Kalender**: månedsoversikt med fargede vaktkoder, legg til/rediger/slett vakter
- **Vaktkoder**: forhåndsdefinerte vaktsett med farge, kode, start/slutt og pause
- **Timer**: Start/Stop-klokke som lagrer vakt automatisk med vaktkode og notat
- **Import**: Excel (.xlsx) og CSV med navnefilter og forhåndsvisning
- **Lønnskalkulator**: beregning per måned med timefordeling og historikk
- **Eksport**: PDF, Excel og CSV-rapporter for valgt måned
- **GDPR**: eksport og sletting av egne data

### Administrator
- Dashboard med bruker- og vaktstatistikk
- Brukerliste med søk (navn, e-post, arbeidssted)
- Se brukerdetaljer, deaktivere og slette brukere
- Lesetilgang til profil – ingen tilgang til lønnssdata

## Oppstart

### Backend

```bash
cd backend
cp .env.example .env          # Rediger innstillinger om nødvendig
pip install -r requirements.txt
uvicorn app.main:app --reload
```

- API: `http://localhost:8000`
- Swagger-dokumentasjon: `http://localhost:8000/docs`
- Standard admin opprettes automatisk: `admin@lonnapp.no` / `Admin1234!`

### Frontend

```bash
cd frontend
npm install
npm run dev
```

- Appen: `http://localhost:5173`

## Teknologi

| Del | Teknologi |
|---|---|
| Backend | FastAPI, SQLAlchemy, SQLite |
| Auth | JWT (python-jose), bcrypt (passlib) |
| Helligdager | holidays (Python) |
| PDF-eksport | reportlab |
| Excel | openpyxl |
| Frontend | React 18, TypeScript, Vite |
| Styling | Tailwind CSS |
| State | Zustand |
| Routing | React Router v6 |
| HTTP-klient | Axios |
