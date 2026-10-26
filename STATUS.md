# Återstartspunkt: Medins Mediacenter

Senast uppdaterad: **26 oktober 2026**.

## Senast godkända läge

- Appversion **0.6.1**, installerad på TV:n och avläst via installationsverktygets appförteckning.
- Kod finns på `main` i [daniel-medin/Neo-qled](https://github.com/daniel-medin/Neo-qled).
- Senaste appändring: `d0b1224`, fyra MM-rutor som smälter ihop till en spelknapp. Senare dokumentationscommits kan ligga efter den.
- Daniel bekräftade att han är nöjd. Ingen implementation eller felsökning pågår vid denna överlämning.
- TV-appen lämnades i normal körning, utan Mediacenter-inspektören.

## Detta finns och har kontrollerats

| Del | Aktuellt läge och verifiering |
| --- | --- |
| Startvy | Reklamfritt rutnät för nio val: SVT Play, Netflix, TV4 Play, HBO Max, Prime Video, Disney+, YouTube, Apple TV och Spotify. De sju vanliga appvalen fungerade i det första TV-testet; Apple TV och SVT verifierades separat efter sina rättningar. |
| SVT | Fungerar sedan 0.5.0. Två starter via HbbTV, återgång till Mediacenter och ny öppning kontrollerades på TV:n. Daniel bekräftade SVT-bilden. Kontraktet med metadata och tre datafält finns i `CONNECTIONS.md`. |
| HDMI | Apple TV-box på **HDMI 1**, PlayStation på **HDMI 2**. Separata rutor från Samsung-apparna. Mappningen bekräftad av Daniel. |
| Vi tittar på | Programnamn och app med valfritt datum och tid, aktiva och pausade listor, återuppta och radera. Daniel bekräftade formuläret på TV:n. Valfria fält testades i webbläsare och avlästes på TV:n. |
| Sparade data | TV:ns programlista bevarades vid uppdateringarna. Vid ren ominstallation av 0.4.4 återställdes den exakt från lokal säkerhetskopia. |
| Ikon | Ny statisk MM-ikon, `launcher-mm.png` (117 × 117). Daniel bekräftade att den syns efter ren ominstallation. Högupplöst original är `icon.png`. |
| Animation | 0.6.1: fyra rutor åker in mot mitten, blir en ruta med spelknapp och poppar till. Cirka 1,3 sekunder, går att hoppa över, startar inte om vid vanlig återgång. Den första animationens visning och avslut kontrollerades på TV:n; den slutliga sammansmältningen granskades i webbläsarens bildrutor och installerades på TV:n. |
| Datorförhandsvisning | Öppna `animation-preview.html` och använd **Spela igen**. `index.html` visar själva appen med exempelappar. Datorförhandsvisningen styr inte TV:n. |

## Kvarvarande frågor – inga aktiva uppdrag

- Automatisk öppning av Mediacenter när TV:n slås på är **inte löst**. Denna TV visar inte *Starta senaste appen*. SmartThings-rutin är ett möjligt, oprövat spår.
- Att utvecklarinstallationen ligger kvar efter en full kallomstart är inte separat verifierat. Dokumentationen skiljer på installerad app och permanent ersättning av Samsungs startvy.
- HDMI-återgången efter Home har rättats i koden och kontrollerats med simulerade TV-API:er; ett separat fysiskt sluttest efter den sista rättningen har inte bekräftats. Gör det om kommande arbete berör den funktionen.
- Gränssnittet ritas i 1920 × 1080 logiska pixlar och skalas upp av TV:n. Det är inte ett separat 4K-gränssnitt.

## Nästa gång projektet öppnas

1. Läs denna fil och `CONNECTIONS.md`. Läs även `CONNECTIONS.local.md` om den finns på datorn.
2. Kör `git status` och hämta aktuell `origin/main`. Dokumentationen och appen kan ha ändrats efter denna ögonblicksbild.
3. Vid TV-arbete: kontrollera TV:ns och datorns aktuella IP; de kan ändras via DHCP. Använd befintliga certifikat och parkopplingar på den här datorn.
4. Följ Daniels nya önskemål. Upprepa inte de gamla SVT-nätverksförsöken; den fungerande lösningen använder Tizens HbbTV-start.

## Var uppgifterna finns

| Fil/plats | Innehåll |
| --- | --- |
| `README.md` | Funktioner, förhandsvisning och översikt. |
| `CONNECTIONS.md` | Publik installationsguide, verktygsplatser, exakta app-ID:n, HbbTV-kontrakt och felsökningshistorik. |
| `CONNECTIONS.local.md` | Faktiska IP-adresser och TV DUID. Finns lokalt och är undantagen från Git. |
| `%LOCALAPPDATA%\NeoQled` | Lokala verktyg, SDK, felsökningsskript, fjärrstyrningsparkoppling och en lagringssäkerhetskopia från utvecklingen. |
| `%APPDATA%\Apps2Samsung\Certificate` | Befintligt signeringsmaterial; ska inte publiceras. |
| `THIRD_PARTY_NOTICES.md` | Licensnotiser för HbbTV-starten och logotypkällor. Ingår i TV-paketet. |

På en annan dator följer koden och den publika dokumentationen med från GitHub. De privata anslutningsuppgifterna, certifikaten, parkopplingen och lokala verktygen behöver tas med eller sättas upp separat.
