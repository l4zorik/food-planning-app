# My Meal Planner Lite

Jednoduchá osobní aplikace pro Windows: HTML/CSS/JavaScript uvnitř Electronu. Nepotřebuje React, Next.js, webový server ani internet pro běžné používání.

## Spuštění

Z kořene projektu otevřete **Start-Lite.cmd**, případně:

```powershell
.\scripts\start-lite.ps1
```

Spouštěč použije `desktop/node_modules/electron/dist/electron.exe`, pokud je nainstalovaný. Jinak na tomto počítači umí rozbalit konkrétní již existující Electron 39.8.10 z lokální cache; hash archivu kontroluje proti místně zjištěné hodnotě. Tento hash není nezávislé ověření od vydavatele. Cache ani runtime se neposílají do Gitu. Pro nové sestavení je připnut Electron 45.2.3.

## Funkce a ukládání

- Týdenní jídelní plán, nákupní seznam a zaškrtávání položek.
- Keeps: textové zápisky, úkoly po jednotlivých řádcích, fotky, GIFy a videa.
- Zobrazení posledních 7 Keeps i všech starších karet.
- 20 barevných, 4 sezónní, 12 měsíčních a 24 hodinových motivů, včetně automatického přepínání podle místního času; sezóny platí pro severní polokouli.
- Automatické ukládání a kontrola dokončení zápisu při zavření.
- Export/obnova přenosné zálohy včetně médií a uložení aktuální sekce do A4 PDF.

Vývojová verze ukládá do `.local-data/personal-data` uvnitř tohoto checkoutu. Sestavené EXE používá datovou složku Windows účtu. Přesnou cestu ukazuje **Umístění dat**. `data.json` obsahuje obsah, `data.previous.json` předchozí zápis a `media/` kopie importovaných médií. Data ani zálohy nejsou šifrované a nejsou ukládané na GitHub.

Podporovaná média: PNG, JPEG, GIF, WebP, MP4 a WebM. Limit je 100 MB na médium, 4 MB textových dat a 100 MB souhrnných médií v přenosné záloze. U videí záleží na podpoře kodeku v Chromiu. Smazání karty nemaže fyzický soubor média automaticky.

Při poškozených datech se prázdný stav nezapíše přes původní soubor. Obnova platné zálohy vyžaduje potvrzení, ověří kontrolní součty médií a poškozený původní soubor uchová zvlášť.

AI generování a Tinder/Discover nejsou v Lite rozhraní; zůstávají v odděleném webovém základu. Do Lite se nevkládají žádné API klíče.

## EXE a GitHub

```powershell
.\scripts\build-lite.ps1
```

Vyžaduje Node.js a síť pro stažení nástrojů. První instalace vytvoří desktopový `package-lock.json`; uchovejte jej pro opakovatelné další instalace. Další běhy používají `npm ci`. Obecné instalační skripty jsou vypnuté; explicitně se spouští jen instalátor připnutého Electronu. Audit se zastaví při high/critical nálezu.

Výstup: `release/My-Meal-Planner-Lite-0.1.0-Windows.exe`. Jde o nepodepsané portable EXE. Kód je oddělený ve větvi `electron-desktop`; workflow **Build Windows Lite** umí vytvořit artifact, který lze později přiložit ke GitHub Release.

## Kontroly a bezpečnost

```powershell
node --experimental-strip-types --test tests/themes.test.mjs tests/desktop-store.test.cjs
```

11 testů prošlo. GUI smoke test `desktop/smoke.cjs` používá izolovaná testovací data v `.runtime/`, testuje vykreslení, zápis, Node izolaci, textový obsah, screenshot a PDF. Na tomto stroji zatím nedoběhl: GPU podproces Electronu padá s `0xC0000135` (chybějící DLL/podmínky běhového prostředí). Funkční okno ani export PDF tedy zatím nejsou potvrzené.

Renderer má zapnutý sandbox, context isolation a webSecurity, bez Node integration. IPC ověřuje odesílatele; preload nabízí pouze konkrétní operace nad daty a souborové dialogy. CSP a síťový filtr zakazují externí obsah, nová okna i oprávnění. Osobní data jsou ignorována Gitem.

Reference: [Electron Security](https://www.electronjs.org/docs/latest/tutorial/security), [Electron Protocol](https://www.electronjs.org/docs/latest/api/protocol), [oficiální vydání](https://releases.electronjs.org/releases/stable).
