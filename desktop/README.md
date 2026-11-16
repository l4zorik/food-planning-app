# My Meal Planner Lite

Jednoduchá osobní aplikace pro Windows: HTML/CSS/JavaScript uvnitř Electronu. Nepotřebuje React, Next.js, webový server ani internet pro běžné používání.

## Spuštění

Z kořene projektu otevřete **Start-Lite.vbs** (bez terminálu), případně pro diagnostiku:

```powershell
.\scripts\start-lite.ps1 -NoSplash
```

Spouštěč použije nainstalovaný Electron nebo ověřený lokální archiv stejné verze jako v manifestu (45.2.3). Starý runtime 39.8.10 už automaticky nepoužívá. Hash cache v `scripts/runtime-hashes.json` je místně zjištěná integrita, nikoli nezávislé ověření od vydavatele. Potvrzení načtení rozhraní nahrazuje kontrolu titulku okna a původní desetisekundový limit. Chyby mají dialog a log `.runtime/startup-error.log`; jednotlivé starty mají oddělené diagnostické logy.

Při každém startu se otevře hlavní obrazovka **Psychická pohoda**. Přehled **Co je nového** je dostupný tlačítkem v hlavičce. Sekce **Vaše firma, vaše logo** dovoluje uložit název firmy a obrázek PNG/JPEG (do 5 MB). Logo se převede na PNG s nejdelší stranou nejvýše 1024 px a uloží vedle lokálních dat do `branding/`. Použije se v hlavičce, přehledu novinek a při dalším startu. Bez nastavení se používá současná značka aplikace. Značka není součástí exportu osobních dat.

## Funkce a ukládání

- Čtvrtá sekce **04 ERP** vedle **Keeps & poznámky**: úvodní prostor pro budoucí AI ERP s plánovanými oblastmi řízení firmy. Evidence a AI zatím nejsou implementované.
- Týdenní jídelní plán, nákupní seznam a zaškrtávání položek.
- Pravý klik na Keep: Pin (připnout/odepnout), Check (hotové/nehotové), Convert (zápis ↔ checklist), Tag a Group. Připnuté karty jsou nahoře; přesouvání zachovává připnutí. Tagy i skupina se zobrazují pod kartou, skupiny lze filtrovat nad nástěnkou.
- Podržení pravého tlačítka asi půl sekundy otevře zvětšený editor. Název, text i jednotlivé řádky checklistu lze upravovat; vše se ukládá automaticky. Stejný editor lze otevřít i z nabídky. Escape ho zavře. Převody zachovávají přílohy.
- Velký editor: označ text a použij **B** / Ctrl+B, barvu textu nebo zvýraznění. Výběr obsahuje 20 systémových písem Windows plus původní písmo; změna platí pro celou kartu. Formátování se zobrazuje i na nástěnce a přenáší v záloze.
- Barvy karet: pravé tlačítko → **Barva** nebo výběr ve velkém editoru. Barevné karty mají černý text, **Původní** vrací vzhled podle motivu včetně bílého textu v tmavém režimu.
- Keeps: textové zápisky, úkoly po jednotlivých řádcích, fotky, GIFy a videa.
- Karty lze přerovnávat tažením za úchyt ⠿ nebo šipkami / Home / End na úchytu; pořadí se automaticky ukládá a přenáší v záloze. Během tažení funguje kolečko myši i automatické posouvání u horního a dolního okraje. Escape tažení zruší.
- Všechny Keeps jsou vidět automaticky; nástěnka přidává další řádky bez limitu počtu karet a ukazuje celkový počet. Počet karet, délka názvu a textu, velikost příloh ani záloh nemají pevný aplikační limit. Praktickou hranicí je dostupná paměť a místo na disku.
- 20 barevných, 4 sezónní, 12 měsíčních, 24 hodinových a 5 motivů Detox, včetně automatického přepínání podle místního času; sezóny platí pro severní polokouli.
- Automatické ukládání a kontrola dokončení zápisu při zavření.
- Export/obnova přenosné zálohy včetně médií a uložení aktuální sekce do A4 PDF.

Vývojová verze ukládá do `.local-data/personal-data` uvnitř tohoto checkoutu. Sestavené EXE používá datovou složku Windows účtu. Přesnou cestu ukazuje **Umístění dat**. `data.json` obsahuje obsah, `data.previous.json` předchozí zápis a `media/` kopie importovaných médií. Data ani zálohy nejsou šifrované a nejsou ukládané na GitHub.

Podporovaná média: PNG, JPEG, GIF, WebP, MP4 a WebM. Velikost médií, textových dat a záloh nemá pevný aplikační limit. Zálohy se zpracovávají v paměti a obsahují přílohy v Base64, takže dostupná RAM a limity běhového prostředí nadále určují maximální zpracovatelnou velikost. U videí záleží na podpoře kodeku v Chromiu. Smazání karty nemaže fyzický soubor média automaticky.

Při poškozených datech se prázdný stav nezapíše přes původní soubor. Obnova platné zálohy vyžaduje potvrzení, ověří kontrolní součty médií a poškozený původní soubor uchová zvlášť.

AI generování a Tinder/Discover nejsou v Lite rozhraní; zůstávají v odděleném webovém základu. Do Lite se nevkládají žádné API klíče.

## EXE a GitHub

```powershell
.\scripts\build-lite.ps1
```

Vyžaduje Node.js a síť pro stažení nástrojů. První instalace vytvoří desktopový `package-lock.json`; uchovejte jej pro opakovatelné další instalace. Další běhy používají `npm ci`. Obecné instalační skripty jsou vypnuté; explicitně se spouští jen instalátor připnutého Electronu. Audit se zastaví při high/critical nálezu.

Výstup úspěšného sestavení: `release/My-Meal-Planner-Lite-Setup-0.3.0.exe` (NSIS instalátor) a `release/My-Meal-Planner-Lite-0.3.0-Portable.exe`. Oba jsou nepodepsané. Kód je oddělený ve větvi `electron-desktop`; workflow **Build Windows Lite** umí vytvořit artifact, který lze později přiložit ke GitHub Release. V tomto prostředí přístup k npm blokuje síťové omezení; Setup soubor se zde nevytvořil.

Bez npm lze ze stávajícího runtime spustit `scripts/package-lite-offline.ps1`. Vytvoří složku s `MealPlanner.exe` a ZIP `release/My-Meal-Planner-Lite-0.3.0-Windows.zip` s kontrolním SHA-256 souborem. Rozbalte celý balíček; EXE vyžaduje sousední DLL a `resources/`. Před přechodem z vývojové verze exportujte zálohu a poté ji obnovte v přenosné verzi.

## Kontroly a bezpečnost

```powershell
node --experimental-strip-types --test tests/themes.test.mjs tests/desktop-store.test.cjs tests/desktop-startup.test.cjs
```

14 testů a syntaktická kontrola desktopu prošly. GUI smoke test `desktop/smoke.cjs` používá izolovaná data v `.runtime/`, kontroluje také otevření a zavření přehledu novinek. Na tomto stroji zůstává GUI neověřené: GPU podproces padá s `0xC0000135` a renderer hlásí `launch-failed` (49). Smoke test nyní při předčasném ukončení skutečně selže. Funkční okno ani export PDF zde zatím nejsou potvrzené.

Renderer má zapnutý sandbox, context isolation a webSecurity, bez Node integration. IPC ověřuje odesílatele; preload nabízí pouze konkrétní operace nad daty a souborové dialogy. CSP a síťový filtr zakazují externí obsah, nová okna i oprávnění. Osobní data jsou ignorována Gitem.

Reference: [Electron Security](https://www.electronjs.org/docs/latest/tutorial/security), [Electron Protocol](https://www.electronjs.org/docs/latest/api/protocol), [oficiální vydání](https://releases.electronjs.org/releases/stable).

## Management · Detox

V páté sekci vyberte problém pro jeden z pěti slotů. Otevře se modal se 100 tématy v mřížce 10 × 10, s hledáním, filtry, ikonami a vlastními offline SVG ilustracemi. Na menším displeji se počet sloupců přizpůsobí. Vlastní problém lze napsat dole v modalu. Změna tématu ponechává strategii, konkrétní plán i rutinu.

Marihuana, porno, sociální sítě, lust/modelky a přejídání mají vlastní designy karet. V kolekci **5 motivů Detox** můžete navíc nastavit odpovídající vzhled celé aplikace.

### Všech pět slotů · Strategie, rutiny a denní postup

V každém z pěti slotů otevřete modal strategií a vyberte jednu z 50 možností. Výběry fungují pro libovolný problém i vlastní téma; hlavička modalu ukazuje slot a jeho problém. Navazující modal nabízí 15 rutin, výběr jedné či více šablon a konkrétních 1–7 dnů týdně. Potvrďte **Přidat do mého týdne**. Teprve poté se strategie i plán uloží. Ruční poznámky a kroky se zachovají.

Dny mají vedle sebe vlastní checklisty s historií podle data; šipky přepínají týdny. Pod nimi je denní checklist Probuzení, Snídaně, Oběd, Večeře a Spánek; každý bod přidává klid místo XP a horní ukazatel ukazuje klidný domov. Starší bodové záznamy zůstávají v datech i záloze, jen se nezobrazují. Datum mění zobrazovaný den, **Dnes** vrací aktuální den. Obě části se automaticky ukládají a zálohují.

### Oblíbené položky v modalech

Na problému, strategii nebo rutině otevřete pravým kliknutím nabídku **Označit jako oblíbené**. Hvězdičku odeberete stejnou nabídkou. Každý modal má filtr **★ Oblíbené**. Označení se ukládá okamžitě, je společné napříč sloty a přenáší se v záloze. Rozpracovaná strategie ani vybrané rutiny se označením nemění. Nabídku otevře také Shift+F10; Escape ji zavře.

## 06 Cheats & Lifehacks

Dvacet slotů pro vlastní problémy a 49 předpřipravených životních situací s pětikrokovými checklisty. Výběr problému otevírá modal souvisejících workflow. V knihovně lze hledat podle účelu, problému, oblasti i tagu a určit cílový slot. Vlastní situace a upravitelné tagy jsou podporované.

Tagy propojují postupy i problémy mezi jednotlivými sloty. Každý slot může mít více různých workflow s vlastním průběhem. Poznámky a zaškrtnutí se zachovají při změně problému, ukládají se automaticky a přenášejí v záloze. Oblíbené označíte pravým kliknutím na kartu v modalu.

## Odměny · spodní patro Klidný domov

Přes celou šířku aplikace pod pracovní plochou je spodní patro **07 · Odměny**. Místo bodů je grounding odměna **Klidný domov**; službu, etapy, progress bar i poznámku vidíte bez otevírání čehokoliv dalšího.

Speciální služby vybírá tým aplikace. Spuštěná služba **01 Bydlení & investice do nemovitosti** vede po čtyřech etapách: **Práce → Nájem → Investiční byt → Základ projektu**, každá s vlastní rolí cesty. Ostatní služby jsou označené jako připravované.

Tlačítkem **Otevřít odměny** se otevře modal s výběrem služeb, etapami s zaškrtáváním, stavem **Klidný domov** po poslední etapě a vlastní poznámkou k cestě. Stejný modal otevřete i z pravého panelu pod **06 Moje proč**. Výběr služby, etapy i poznámka se ukládají automaticky, jsou součástí zálohy a starší zálohy bez nich fungují dál.

## Pravý panel · Moje perky

Pod motivy a kartou Jen u tebe je první modul Psychická pohoda a možnost přidat libovolný počet dalších modulů. Výběr nabízí sedm směrů: Psychická pohoda, Finanční svoboda, Časová svoboda, Lokalizační pohoda, Politická pohoda, Látková pohoda a Skill pohoda. Vlastní modul lze pojmenovat dole ve výběru.

Tři modaly: způsoby hledání → nalezené problémy a pozorování → moduly. Pozorování má vlastní evidenci a stav ověření, může zůstat otevřené nebo být propojeno s více moduly. Samostatný modul lze vytvořit i bez problému.

Editor spojuje souvislosti, situaci, řešení, checklist workflow, dokumentaci, návrh budoucí automatizace a další chyby či poznatky. Skill pohoda má prostor pro nápady budoucích aktualizací. Počet modulů, kroků ani poznatků není pevně omezen. Automatizace je zatím dokumentovaný návrh. Data jsou součástí automatického ukládání a záloh.

## Hlavní obrazovka · Psychická pohoda

Psychická pohoda je pro všechny výchozí vstup do projektu. Pole na hlavní obrazovce sdílejí data se základním modulem, další perky a šest nástrojových sekcí mají vlastní odkazy. První tlačítko navigace vrací domů. Chybějící základní modul se automaticky doplní, původní obsah ostatních modulů se zachová. Novinky se otevírají z hlavičky.
