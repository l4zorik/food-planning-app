# My Meal Planner Lite

Jednoduchá osobní aplikace pro Windows: HTML/CSS/JavaScript uvnitř Electronu. Nepotřebuje React, Next.js, webový server ani internet pro běžné používání.

## Spuštění

Z kořene projektu otevřete **Start-Lite.vbs** (bez terminálu), případně pro diagnostiku:

```powershell
.\scripts\start-lite.ps1 -NoSplash
```

Spouštěč použije nainstalovaný Electron nebo ověřený lokální archiv stejné verze jako v manifestu (45.2.3). Starý runtime 39.8.10 už automaticky nepoužívá. Hash cache v `scripts/runtime-hashes.json` je místně zjištěná integrita, nikoli nezávislé ověření od vydavatele. Potvrzení načtení rozhraní nahrazuje kontrolu titulku okna a původní desetisekundový limit. Chyby mají dialog a log `.runtime/startup-error.log`; jednotlivé starty mají oddělené diagnostické logy.

Při každém startu se otevře **Co je nového**. Sekce **Vaše firma, vaše logo** dovoluje uložit název firmy a obrázek PNG/JPEG (do 5 MB). Logo se převede na PNG s nejdelší stranou nejvýše 1024 px a uloží vedle lokálních dat do `branding/`. Použije se v hlavičce, přehledu novinek a při dalším startu. Bez nastavení se používá současná značka aplikace. Značka není součástí exportu osobních dat.

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
- 20 barevných, 4 sezónní, 12 měsíčních a 24 hodinových motivů, včetně automatického přepínání podle místního času; sezóny platí pro severní polokouli.
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
