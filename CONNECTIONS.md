# TV-anslutning och uppdatering

Dokumenterat 26 oktober 2026 för att kunna uppdatera Medins Mediacenter senare. Den här publika guiden använder platshållare för lokala adresser och enhets-ID. Datorns `CONNECTIONS.local.md` innehåller uppgifterna för Daniels TV och är undantagen från Git.

## Enheter och portar

| Del | Värde |
| --- | --- |
| TV | Samsung TQ75QN70FAUXXC, Tizen 9.0 |
| TV:ns lokala IP | `TV_IP` |
| Datorns lokala IP vid utvecklarinställning | `PC_IP` |
| TV:ns utvecklarport | TCP `26101` |
| TV:ns lokala API och fjärrstyrning | TCP `8001` och `8002` |
| App-ID | `NQLEDHOME1.Home` |
| Paket-ID | `NQLEDHOME1` |
| TV DUID | Läses från den anslutna TV:n av installationsverktyget |
| Apple TV-box | HDMI 1 |
| PlayStation | HDMI 2 |

IP-adresserna är DHCP-adresser och kan ändras. Kontrollera dem på TV:n och datorn om anslutningen slutar fungera. TV:ns `VIDEOSOURCE`-API ger typ och portnummer, men inte ett pålitligt namn på ansluten HDMI-enhet; därför är HDMI-mappningen avsiktligt explicit i `app.js`.

## Utvecklarläge och verktyg

Utvecklarläge är aktiverat på TV:n med datorns IP som utvecklar-IP. Vid ändring av datorns IP behöver den uppdateras i TV:ns utvecklarinställning. En full strömomstart har tidigare behövts för att öppna port 26101.

Installationsverktyg: [Apps2Samsung CLI 3.0.0-beta](https://github.com/Apps2Samsung/Apps2Samsung) finns lokalt i `%LOCALAPPDATA%\NeoQled\tools\Apps2Samsung-cli-v3.0.0-beta\apps2samsung-cli.exe`. Det är ett tredjepartsverktyg. TV-certifikatet ligger under `%APPDATA%\Apps2Samsung\Certificate` och fjärrstyrningens parkoppling under `%LOCALAPPDATA%\NeoQled\tv-pairing.json`. **Lägg aldrig certifikat, lösenord eller fjärrstyrningstoken i projektet.**

## Uppdatera appen

Kör i projektmappen i PowerShell:

```powershell
python build.py
$tvIp = 'TV_IP' # Ersätt med TV:ns lokala IP-adress
$cli = Join-Path $env:LOCALAPPDATA 'NeoQled\tools\Apps2Samsung-cli-v3.0.0-beta\apps2samsung-cli.exe'
$wgt = (Resolve-Path 'dist\MedinsMediacenter-0.4.0.wgt').Path
& $cli install $wgt --tv $tvIp --launch --json
```

Byt `.wgt`-filens versionsnummer efter att versionen höjts i `config.xml`. CLI signerar paketet med det lokala TV-certifikatet. Om installationen misslyckas: kontrollera samma nätverk, TV-IP, utvecklar-IP och att TV:n verkligen har startats om efter att utvecklarläget ändrades. En ny certifikatprofil kan behövas om TV:n eller dess DUID ändras.

## Beteende att kontrollera efter uppdatering

1. Kontrollera att **Medins Mediacenter** och den nya MM-ikonen visas.
2. Öppna Apple TV-appen från app-rutan och SVT Play. Apple TV fungerade i version 0.2; SVT har ännu inte fungerat från Mediacenter.
3. Öppna Apple TV-box (HDMI 1) och PlayStation (HDMI 2), tryck sedan Home och öppna Mediacenter igen. Appen ska stänga HDMI-ytan när den lämnas eller återfår fokus.
4. Starta om TV:n och kontrollera om appen finns kvar. Automatisk öppning av Mediacenter vid TV-start är fortfarande olöst.
5. Lägg till ett program med datum och tid, pausa det, återuppta det och starta om appen. Kontrollera att listan finns kvar. Programmen sparas i TV-appens `localStorage` under nyckeln `medins-mediacenter-watching`.

TV:n har inte inställningen *Starta senaste appen*. *Starta med Smart Hub Home* visar Samsungs startvy, inte vår app. Samsung anger att vissa utvecklarinstallerade appar tas bort när TV:n stängs av eller kopplas från utvecklingsmiljön; verifiera därför kvarvarande installation efter omstart innan denna lösning används som permanent startvy.

För automatisk start kan en **SmartThings-rutin** undersökas i mobilappen: välj en händelse för att TV:n slås på och se om TV:ns åtgärder erbjuder *öppna app* med Medins Mediacenter. Samsung beskriver att SmartThings-rutiner kan öppna installerade TV-appar, men det är inte verifierat att en utvecklarinstallerad app syns som val på just denna modell. [Samsungs guide till rutiner](https://www.samsung.com/us/support/answer/ANS10002640/).

## Samsung-dokumentation

- [Ansluta TV:n till utvecklingsmiljön](https://developer.samsung.com/smarttv/develop/getting-started/using-sdk/tv-device.html)
- [Skärmupplösning i TV-appar](https://developer.samsung.com/smarttv/develop/guides/fundamentals/managing-screen-resolution.html)
- [Tizen TV API: TVWindow](https://developer.samsung.com/smarttv/develop/api-references/tizen-web-device-api-references/tvwindow-api.html)
- [Appar och testinstallation](https://developer.samsung.com/smarttv/develop/faq/application-testing.html)
