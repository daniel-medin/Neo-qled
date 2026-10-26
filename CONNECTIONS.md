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
$wgt = (Resolve-Path 'dist\MedinsMediacenter-0.6.1.wgt').Path
& $cli install $wgt --tv $tvIp --launch --json
```

Byt `.wgt`-filens versionsnummer efter att versionen höjts i `config.xml`. CLI signerar paketet med det lokala TV-certifikatet. Om installationen misslyckas: kontrollera samma nätverk, TV-IP, utvecklar-IP och att TV:n verkligen har startats om efter att utvecklarläget ändrades. En ny certifikatprofil kan behövas om TV:n eller dess DUID ändras.

## Beteende att kontrollera efter uppdatering

1. Kontrollera att **Medins Mediacenter** och den nya MM-ikonen visas.
2. Öppna Apple TV-appen från app-rutan och SVT Play. SVT-starten verifierades två gånger i version 0.5.0, med återgång till Mediacenter mellan försöken.
3. Öppna Apple TV-box (HDMI 1) och PlayStation (HDMI 2), tryck sedan Home och öppna Mediacenter igen. Appen ska stänga HDMI-ytan när den lämnas eller återfår fokus.
4. Starta om TV:n och kontrollera om appen finns kvar. Automatisk öppning av Mediacenter vid TV-start är fortfarande olöst.
5. Lägg till ett program med datum och tid, pausa det, återuppta det och starta om appen. Kontrollera att listan finns kvar. Programmen sparas i TV-appens `localStorage` under nyckeln `medins-mediacenter-watching`.

Sedan 0.4.3 är datum och tid valfria, även var för sig. Befintliga poster kan läsas utan migrering. HDMI-ytan stängs bara om Mediacenter själv har öppnat den; vanliga appstarter ska inte ändra TV-bildytan. Appstartens reserv-ID:n prövas bara vid ett uttryckligt fel från Tizen, aldrig av en timer efter att appen återupptas.

Version 0.6.0 lade till en kort MM-startanimation i HTML/CSS. I 0.6.1 åker de fyra rutorna in mot mitten, smälter ihop till en ruta och avslutas med en pop-animation på spelknappen. Den visas vid dokumentets första start, går att hoppa över med valfri knapp och avslutas vid bakgrundsläge. Den startas inte av visibilitychange eller fokus när appen återupptas. En timer på 1,6 sekunder döljer ytan även om TV:n skulle missa CSS-händelsen animationend. Inga nya paketfiler eller behörigheter behövs.

Verifierat i 0.6.0 på TV:n: introytan var synlig tidigt efter omladdning och dold efter avslutad animation; den sparade programlistan fanns kvar. Webbläsarkontrollen verifierade även hopp över med fjärrkontrollknapp, återgång utan ny animation och minskad rörelse. `animation-preview.html` ger en separat datorförhandsvisning med Spela igen-knapp och ingår inte i TV-paketet.

## SVT: verifierade felsökningsresultat

**Löst i version 0.5.0 genom HbbTV-start med appens metadata.** Mediacenter använder inget nätverksanrop, ingen lokal fjärrkontrollparkoppling och ingen dator för att starta SVT.

1. Läs `tizen.application.getAppMetaData(appId)` och hitta `http://samsung.com/tv/metadata/hbbtv.link`.
2. Skapa `ApplicationControl` med operation `http://tizen.org/appcontrol/operation/default` och tomma URI-, MIME- och kategorifält.
3. Skicka tre `ApplicationControlData`-poster: `tizenid: [appId]`, `hbbtv: [metadataLänken]`, `deeplink: ["true"]`.
4. Anropa `tizen.application.launchAppControl` med målet `org.tizen.hbbtv`.

Denna överlämning hittades i [AeroTizens implementation](https://github.com/helalaou/AeroTizen/blob/main/launcher/js/apps.js) och verifierades på den fysiska TV:n. Klick på SVT-rutan i installerad 0.5.0 gav förgrundsappen `org.tizen.hbbtv` och en aktiv sida med titeln **SVT Play** på `https://hbbtv.play.svt.se/v2/index.xhtml#/start`. Efter Home och återöppning visades Mediacenter stabilt, och ett andra klick på SVT öppnade samma startsida. Den befintliga programlistan fanns kvar och datum/tid var fortfarande valfria.

Användaren bekräftade också att SVT Play syns på TV-skärmen. Den färdiga 0.5.0-installationen körs utan Mediacenter-inspektören; SVT-starten prövades även med fjärrkontrollens OK-kommando efter normal start.

`application.info` och `application.launch` räcker för den fungerande metoden. Den installerade metadata-länken används i stället för en hårdkodad SVT-adress, så samma kod hanterar andra installerade HbbTV-appar. Normala appar behåller vanlig Tizen-start.

Tidigare försök och bakgrund, för att undvika att felsökningen upprepas:

Testat på den fysiska TV:n 26 oktober 2026:

- Installerad app: `5exPmCT0nz.svtplay`, paket `5exPmCT0nz`, version 2.0.1, butiks-ID `3201612011287`. TV4 är `wYESlsUoe4.TV4`. Apple TV har både en dummy-post och `com.samsung.tv.aria-video`; vår ruta använder det senare ID:t.
- Användaren bekräftar att SVT öppnas normalt från Samsungs startmeny. Då är den faktiska förgrundsappen `org.tizen.hbbtv`, inte den installerade SVT-postens ID.
- HbbTV-inspektören visar SVT:s sida `https://hbbtv.play.svt.se/v2/index.xhtml`. HbbTV-inspektören finns på TV:ns port `7014` när utvecklarläge är på. `/json` listar den aktiva sidan.
- `tizen.application.launch` för SVT ger en success-callback men förgrundsappen blir `com.samsung.tv.csfs`. AppControl `main`, `default`, `view` och `eden_resume` **utan de tre HbbTV-datafälten** gav ingen fungerande överlämning. Det hjälpte inte att öppna TV-bildytan först eller tillfälligt stoppa HDMI-stängningen.
- `POST http://TV_IP:8001/api/v2/applications/3201612011287` från den redan parkopplade datorn startar SVT och HbbTV-sidan. Anropet slutför inte alltid HTTP-svaret trots att appen öppnas; timeout är därför inte ett säkert tecken på misslyckad start.
- Samma POST från TV-appen till loopback eller TV:ns egen LAN-IP får HTTP 401. GET fungerar. Ingen fungerande parkoppling från TV-appen har verifierats: vanlig WebSocket fjärrstyrning får `ms.channel.timeOut`, och säker WebSocket till loopback stoppas av `ERR_CERT_AUTHORITY_INVALID`. Den öppna appkontrollkanalen ansluter men nekar start med 401.
- Experimentella nätverksstarter från 0.4.1–0.4.2 ingår inte i 0.4.3. Lösningen ska inte betraktas som klar genom att enbart läsa Tizens success-callback eller installationsverktygets text om lyckad start.

Tizen Studio finns lokalt under `%LOCALAPPDATA%\NeoQled\tizen-studio`; `tools\sdb.exe` används för anslutningen. Mediacenter kan startas i debugläge med `sdb shell 0 debug NQLEDHOME1.Home` efter att den stoppats med `sdb shell 0 was_kill NQLEDHOME1.Home`. Svaret anger en inspektionsport som kan vidarebefordras med `sdb forward tcp:9229 tcp:PORT`. Debugläget ska avslutas genom att stoppa appen och starta den normalt efter felsökning.

## Ikonen i Samsungs startmeny

TV:ns registrerade ikon lästes tillbaka från `ApplicationInfo.iconPath` i version 0.4.3 och var den nya MM-designen, medan användaren fortfarande såg den gamla ikonen i Smart Hub. Version 0.4.4 använder filnamnet `launcher-mm.png` och 117 × 117 pixlar, Samsungs utvecklarikonformat. Högupplöst original finns kvar som `icon.png`. Om Smart Hub behåller en tidigare bild behöver dess cache uppdateras; ändra inte app-ID bara för detta eftersom det skapar en andra app. Säkerhetskopiera programlistan före eventuell ren ominstallation.

En ren ominstallation av 0.4.4 utfördes 26 oktober. Den registrerade ikonens storlek verifierades till 117 × 117 och användarens programlista återställdes exakt från den lokala säkerhetskopian. Användaren bekräftade sedan att den nya ikonen syns i Smart Hub.

[Samsungs förklaring av utvecklarikonen](https://developer.samsung.com/smarttv/design/smart-tv-application-design-qa.html).

En lokal säkerhetskopia av TV-appens lagring finns i `%LOCALAPPDATA%\NeoQled\tv-storage-backup.json`. Den innehåller användarens programlista och ska inte publiceras. Felsökningsskript finns i samma lokala mapp; de ingår inte i repot.

TV:n har inte inställningen *Starta senaste appen*. *Starta med Smart Hub Home* visar Samsungs startvy, inte vår app. Samsung anger att vissa utvecklarinstallerade appar tas bort när TV:n stängs av eller kopplas från utvecklingsmiljön; verifiera därför kvarvarande installation efter omstart innan denna lösning används som permanent startvy.

För automatisk start kan en **SmartThings-rutin** undersökas i mobilappen: välj en händelse för att TV:n slås på och se om TV:ns åtgärder erbjuder *öppna app* med Medins Mediacenter. Samsung beskriver att SmartThings-rutiner kan öppna installerade TV-appar, men det är inte verifierat att en utvecklarinstallerad app syns som val på just denna modell. [Samsungs guide till rutiner](https://www.samsung.com/us/support/answer/ANS10002640/).

## Samsung-dokumentation

- [Ansluta TV:n till utvecklingsmiljön](https://developer.samsung.com/smarttv/develop/getting-started/using-sdk/tv-device.html)
- [Skärmupplösning i TV-appar](https://developer.samsung.com/smarttv/develop/guides/fundamentals/managing-screen-resolution.html)
- [Tizen TV API: TVWindow](https://developer.samsung.com/smarttv/develop/api-references/tizen-web-device-api-references/tvwindow-api.html)
- [Appar och testinstallation](https://developer.samsung.com/smarttv/develop/faq/application-testing.html)
