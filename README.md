# Medins Mediacenter

En personlig startvy för Samsung Tizen TV med nio appar och två HDMI-ingångar. Den visar bara valen du själv vill ha, utan rekommendationer eller reklambanners. Appen är byggd som en lokal Tizen-webbapp.

![Förhandsvisning](preview.png)

## Rutor

SVT Play, Netflix, TV4 Play, HBO Max, Prime Video, Disney+, YouTube, Apple TV och Spotify. **Apple TV-boxen sitter på HDMI 1 och PlayStation på HDMI 2.** Apple TV-rutan bland apparna öppnar Samsungs Apple TV-app; Apple TV-boxen har en egen HDMI-ruta.

Appen hämtar TV:ns lista över installerade appar. Om ett namn inte matchas kan rutan kopplas manuellt till en installerad app. Valet sparas lokalt på TV:n.

## Vi tittar på

Knappen **Vad vi tittar på** öppnar ett formulär för programnamn, app, datum och tid. Programmen sorteras efter datum under ingångarna. Välj ett program för att öppna dess app, använd pausknappen för att flytta det till **Pausade**, eller krysset för att radera det. I Pausade kan ett program återupptas eller raderas. Listorna sparas lokalt på TV:n. En programrad öppnar appen, inte automatiskt ett visst avsnitt eller en direktsänd kanal inne i appen.

## Bygg och installera

`python build.py` skapar `dist/MedinsMediacenter-0.4.0.wgt`. Paketet är osignerat tills installationsverktyget signerar det. Se [CONNECTIONS.md](CONNECTIONS.md) för TV-anslutning, certifikatplats, installationskommando och hur en uppdatering görs.

Den lokala filen `CONNECTIONS.local.md` sparar Daniels faktiska nätverksadresser och TV-ID. Den och genererade installationspaket är undantagna från Git.

Förhandsgranska genom att öppna `index.html` i en webbläsare. Då visas exempelappar och ingen TV styrs.

## Kända begränsningar

- **SVT Play** kan hittas av TV:n, men TV:n kastar tillbaka användaren till Smart Hub efter start från Mediacenter. AppControl-reservförsöket i version 0.3 orsakade dessutom att Mediacenter kastades ut vid återöppning. Den kedjan togs bort i 0.3.1; version 0.4 gör bara ett SVT-startförsök. En fungerande väg till SVT återstår att hitta.
- **Automatisk start vid påslagning** är inte löst. Den här TV:n visar inte inställningen *Starta senaste appen*. En installerad Tizen-app kan inte själv ersätta Samsungs systemstartvy. SmartThings-rutin som öppnar appen är en möjlig väg att pröva, men den är inte verifierad på denna TV.
- Tizen-TV-appar ritas i **1920 × 1080 logiska pixlar** och skalas upp av TV:n även på en 4K-panel. Logotyperna är högupplösta PNG-filer; appen kan inte ändra TV:ns systemupplösning.

## Filer

- `app.js`: appar, HDMI-ingångar, fjärrkontroll och startlogik.
- `styles.css`: rutnätets utseende.
- `config.xml`: namn, version, ID och Tizen-behörigheter.
- `make_icon.py`: genererar den egna MM-ikonen i `icon.png`.
- `assets/logos/`: lokala app- och enhetslogotyper. Källor: [Dashboard Icons](https://github.com/homarr-labs/dashboard-icons) och [Simple Icons](https://github.com/simple-icons/simple-icons). Varumärkena tillhör respektive ägare.

För ändringar: höj versionen i `config.xml`, kör `python build.py`, installera det nya paketet och testa på TV:n. Behåll `NQLEDHOME1.Home` och `NQLEDHOME1` om installationen ska uppdatera samma app och behålla lokala appkopplingar.
