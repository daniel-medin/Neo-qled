# Fortsätta arbetet med Medins Mediacenter

- Läs `STATUS.md` först. Den sammanfattar senaste godkända version, vad som har verifierats och kvarvarande frågor.
- Läs `CONNECTIONS.md` för byggning, installation, verktyg och tidigare felsökning. På Daniels dator finns de faktiska adresserna och enhets-ID:t i den Git-ignorerade `CONNECTIONS.local.md`.
- Kontrollera Git-status innan ändringar och bevara befintligt arbete. Utgå från Daniels nya uppgift; kvarvarande frågor i statusfilen är ingen beställning att fortsätta felsöka dem.
- Detta är en vanlig Samsung Tizen-webbapp. Behåll app-ID `NQLEDHOME1.Home` och paket-ID `NQLEDHOME1` vid uppdatering. Byt inte ID för att lösa ett ikoncacheproblem.
- SVT fungerar via den installerade appens HbbTV-metadata och `launchAppControl` till `org.tizen.hbbtv`. Behåll datafälten `tizenid`, `hbbtv` och `deeplink`. Ersätt inte detta med en vanlig `application.launch` eller nätverksfjärrkontroll. Se det verifierade kontraktet i `CONNECTIONS.md`.
- Gör inga timerstyrda nya appstarter när Mediacenter återupptas. HDMI-ytan får bara stängas när Mediacenter själv har öppnat den.
- Programlistan och appkopplingar sparas på TV:n i `localStorage`. Säkerhetskopiera aktuell TV-data före avinstallation eller andra åtgärder som raderar appdata. Den lokala befintliga säkerhetskopian är en äldre ögonblicksbild, inte automatiskt aktuell.
- Publicera inte lokala adresser, TV DUID, certifikat, lösenord, fjärrstyrningstoken eller användarens programlista. Behåll privata uppgifter i ignorerade lokala filer och `%LOCALAPPDATA%\NeoQled`.
- För layout och formulär räcker normalt webbläsarförhandsvisningen. Samsungs appstarter och HDMI behöver vid ändringar kontrolleras på den fysiska TV:n. Ett success-svar från API eller installerare bevisar inte att rätt bild visas.
- Startanimationen hör till appens innehåll. Samsungs appikon är statisk. `animation-preview.html` är en separat datorförhandsvisning och ska inte läggas i TV-paketet.
- Vid en ny appversion: höj `config.xml`, bygg med `python build.py`, verifiera relevanta beteenden och uppdatera `STATUS.md`, `README.md` och installationsfilnamnen i anslutningsdokumenten. Behåll tredjepartsnotiser i paketet.
- Lämna TV-appen i normal körning efter felsökning och stäng egna inspektionsanslutningar. Pusha färdiga ändringar när det ingår i Daniels uppgift eller sessionens befintliga instruktioner.
