Konge idé. Her er en komplett spesifikasjon for en super-enkel, men kraftig og customiserbar lønnings-/vakt-app med vaktkoder, oversikt og enkel deling til sjefen.

Mål

Fange timer kjapt, uten stress.

Automatisk lønnsberegning (timesats, overtid, tillegg, helligdager, natt, helg, osv.).

Vaktkoder og maler for å slippe gjentak.

Kalender + oversiktsrapporter (dag/uke/måned).

1-klikk eksport/deling (PDF/Excel/CSV) til leder/regnskap.

Fleksibel regelmotor så den funker for alle typer skift og avtaler.

1) Brukerroller

Ansatt (default): registrerer vakter, utlegg, km, ser lønn og eksporterer.

Leder (valgfritt): godkjenner, kan se team-oversikt.

Regnskap (valgfritt): får standardiserte eksportfiler.

2) Datamodell (enkelt og robust)

Bruker: navn, e-post, stilling, fagforenings-/tariff-info (valgfri), standard timesats(er), skattetrekk-prosent (kun for estimat), kontonummer (ikke nødvendig om kun tidsføring).

Arbeidsforhold: arbeidssted, kontraktstype, normalarbeidstid (eks. 37,5 t/uke), standard pauser.

Vakt: dato, start/slutt, pauser, vaktkode (ref.), prosjekt/avdeling (valgfritt), notat.

Tillegg/Overtid: genereres automatisk ut fra vaktkode + tidsrom (kveld/natt/helg/helligdag), eller legges manuelt.

Utlegg: kategori, beløp, kvittering (bilde), mva-sats (valgfritt).

Kjøregodtgjørelse: km, sats, fra-til (valgfritt).

Satstabell: timesats(er), overtidssatser (50/100 % osv.), ubekvem-tillegg (OB), helligdags-tillegg, minstelønn pr. avtale (valgfritt).

Kalender/plan: gjentakende vakter, maler.

Eksport: periode, format, status (sendt/godkjent).

3) Vaktkoder (hjertet i enkelheten)

La koder definere alt som skjer automatisk.

Eksempeloppsett:

Kode Navn Tidsvindu Sats/regel
D Dagvakt 08:00–16:00 (man–fre) Grunnsats. 30 min ubetalt pause auto.
E Kveld 16:00–22:00 Grunnsats + OB kveld (f.eks. +20 %).
N Natt 22:00–06:00 Grunnsats + OB natt (f.eks. +40 %).
L Lørdag 00:00–24:00 (lør) Grunnsats + helgetillegg (f.eks. +25 %).
S Søndag/helligdag 00:00–24:00 (søn/helligdager) Grunnsats + 100 % tilleggsregel.
O1 Overtid 50 % >9 t/dag eller >40 t/uke 50 % på overtidsandel.
O2 Overtid 100 % natt/helg/helligdag over grenser 100 % på overtidsandel.
B Beredskap/tilkall N/A Fast sats pr. time + min. 2 t ved utkalling.

Du kan lage egne koder: angi navn, beskrivelse, når koden gjelder (dager/tider), satser/tillegg, pauser, min/maks varighet, avrunding (f.eks. nærmeste 15. min).

4) Regelmotor (fleksibel, men lett å bruke)

Prioritet: Helligdag > Søndag > Natt > Kveld > Dag.

Segmentering: Appen splitter en vakt over flere tidsvinduer (f.eks. 20:00–02:00 → 2 t kveld + 4 t natt).

Overtid: daglig terskel (eks. >9 t), ukentlig (eks. >40 t), eller etter vaktkode. Støtt både påslag i % og egen overtidsats.

Ub-tillegg (OB): tidspenn + prosent eller kr/time.

Pauser: automatisk (regel) eller manuell (overstyring).

Helligdager: innebygd kalender (land kan velges) + manuell markering.

5) Tidsføring (friksjonsfritt)

3 måter å registrere:

Start/Stop-klokke (live).

Hurtigregistrering: velg vaktkode + start/slutt → ferdig.

Maler/Gjentak: “D-vakt hver man–fre 08–16 i september”.

Smart autofyll: foreslår gårsdagens vaktkode/tider, legger inn pauser.

Tillegg på stedet: +utlegg (foto av kvittering), +km, +notat.

6) Kalender & oversikter

Kalender: dag/uke/måned, fargekodet per vaktkode.

Oversiktstopp: timer (grunn/overtid), tillegg, sum kroner per dag/uke/måned.

Filter: prosjekt, sted, vaktkode, godkjenningsstatus.

Månedssammendrag: arbeidstimer, overtidsfordeling, OB-timer, utlegg, km, total brutto.

7) Deling, godkjenning og eksport

1-klikk “Send til sjef”: velg periode → generer PDF (signaturfelt), CSV/Excel (for regnskap), valgfri lenkedeling.

Standard eksportfelter (CSV/Excel):

Dato,Start,Slutt,Pause_min,Vaktkode,Grunn­timer,OT50_t,OT100_t,OB_kveld_t,OB_natt_t,
Prosjekt,Sted,Timesats,OB_sats,OT50_sats,OT100_sats,Brutto_dag,Notat

Sende-logg: tidspunkter og mottakere, “Åpnet?” (hvis lenkesporing er på).

Godkjenning: Leder kan trykke “Godkjenn”/“Be om endring” (kommentar). Lås ved godkjenning (audit-spor).

8) Skatt/feriepenger/trygd (kun estimat i appen)

Fleksible estimater: skattetrekk % eller tabell (manuelt), feriepenger %, pensjonstrekk %, fagforeningskontingent, m.m.

NB: Appen skal ikke erstatte lønnssystem – den lager korrekte timer og summer + klare eksportfiler. Estimater er til egen kontroll.

9) Utlegg, km og tillegg

Utlegg: ta bilde, velg kategori (mat, verktøy, parkering …), beløp, mva (valgfritt).

Km-godtgjørelse: sats (justerbar), fra–til (valgfritt), automatisk sum.

Andre tillegg: skiftleder, smusstillegg, beredskap, call-out (min. lønnstid).

10) Varsler & automasjon

“Glemte du å stemple ut?”

“Månedsrapport klar – vil du sende til sjef?”

Påminnelser for gjentakende vakter.

Varsel ved overtid/ukegrense.

11) Integrasjoner (nice to have)

Kalender inn/ut (Google/Apple/Outlook).

Regnskap: standard CSV/Excel + importmal for de vanligste systemene.

Fil-synk: Drive/Dropbox/OneDrive for bilag.

SSO (Apple/Google) for rask innlogging.

12) Personvern & sikkerhet

Lokal kryptering (på enheten) + kryptert sky-synk (valgfritt).

Rollebasert tilgang (leder ser kun godkjenningsdata).

Eksportable data når som helst (GDPR).

Offline-modus med senere synk.

13) Innstillinger (brukervennlig)

Vaktkoder: legg til/endre/slett, rekkefølge og farger.

Satser: grunn, OB, overtid, helligdag (prosent eller kr/time).

Regler: daglig/ukentlig terskel, auto-pauser, avrunding (5/10/15 min).

Standarder: arbeidssted, prosjekt, signatur.

Eksportmaler: velg kolonner, filnavn, logo og signaturfelt.

14) UX-flyt (enkelt)

Hjem: “Start vakt” / “Legg inn vakt”.

Velg vaktkode (D/E/N …) → tider → lagre.

Se dag/uke/måned → totaler på topp.

Send måned → velg format og mottaker.

Leder får lenke → Godkjenn → ferdig.

15) Edge-cases & smarte håndteringer

Vakten går over midnatt → automatisk splitt.

Delte pauser → støttes.

To vaktkoder samme dag → summeres korrekt.

Helligdag på en ukedag → riktig tillegg + overtid hvis terskel brutt.

Manuelle overstyringer med tydelig “⚠️ Overstyrt”.

16) MVP → Pro roadmap

MVP

Tidsføring (manuell + start/stop).

Vaktkoder med tidsvinduer/tillegg.

Overtid og OB-beregning.

Kalender og månedlig rapport.

PDF/CSV/Excel-eksport + deling.

Pro

Godkjenning/kommentarer for leder.

Utlegg/kvitteringer + km.

Helligdagskalender per land.

Automatiske påminnelser.

Import/eksport-maler til regnskapssystemer.

17) Formler (tydelige regler)

Grunn­timer = (Slutt – Start – Pauser) minus segmenter merket som overtid.

Overtid 50 % = min(antall timer over dag/uke-terskel i ikke-OB-segmenter).

Overtid 100 % = overtids­segmenter i natt/helg/helligdag (avtaleavhengig).

OB-timer = overlapp mellom vakt og definerte OB-vinduer.

Brutto dag = Grunn­timer×Grunnsats + Σ(OT×OT-sats) + Σ(OB×OB-sats) + faste tillegg.

Måned = Σ(Brutto dag) + km + utlegg.

18) Eksempel: registrering på 10 sek

Trykk + Vakt

Velg E (Kveld) → 16:00–22:00 → Lagre

Ferdig (appen legger pauser/OB automatisk)
