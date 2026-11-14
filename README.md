# My Meal Planner — Electron Lite

Osobní Windows aplikace je v `desktop/`, samostatná větev GitHubu: `electron-desktop`. Webový základ zůstává z větve `v0/ai-meal-plans`, commit `484eb71`.

## Spustit Lite

Dvojklik na **Start-Lite.vbs** spustí aplikaci bez terminálu, s úvodním logem. Původní `Start-Lite.cmd` předá spuštění stejnému spouštěči, při dvojkliku ale může krátce probliknout konzole. Runtime musí odpovídat verzi v `desktop/package.json`; automatický návrat ke starému preview byl odstraněn. Data vývojové verze jsou v ignorované složce `.local-data/personal-data`, mimo Git.

Při každém startu se otevře přehled **Co je nového**. V něm rozbalte **Vaše firma, vaše logo** a zadejte název firmy nebo vyberte PNG/JPEG. Značka se uloží lokálně a použije se i na úvodní obrazovce dalšího spuštění. Přehled lze zavřít tlačítkem **Pojďme plánovat**, křížkem nebo Escape a znovu otevřít z hlavičky. [Úplný seznam změn](CHANGELOG.md).

## Kde je aplikace ke stažení / instalaci

Přenosný balíček: `release/My-Meal-Planner-Lite-0.3.0-Windows.zip`. Rozbalte **celý** ZIP a spusťte `MealPlanner.exe`. Nepotřebujete Node.js ani instalaci závislostí. Samotné EXE neoddělujte od ostatních souborů. ZIP je přenosná aplikace, nikoli klasický instalátor; uživatelská data zůstávají v profilu Windows.

Přenosný balíček lze bez npm sestavit pomocí `scripts/package-lite-offline.ps1`, pokud je už připravený runtime. Klasický NSIS instalátor vytvoří níže uvedený síťový build. V tomto prostředí se jeho sestavení zastavilo na blokovaném přístupu k npm, takže soubor Setup zde zatím není.

Vývojová a přenosná verze mají oddělené datové složky. Pro přesun dat použijte **Zálohovat** ve staré verzi a **Obnovit** v nové.

Lite obsahuje týdenní plán, nákupní seznam, Keeps s poznámkami a úkoly po řádcích, import fotek/GIFů/videí, všechny Keeps na automaticky rostoucí nástěnce s přesouváním karet a bez pevných limitů velikosti, automatické ukládání, zálohy včetně médií, A4 PDF a 60 motivů. Je bez React buildu a bez síťových služeb. AI a Discover zůstávají ve webovém základu; v Lite nejsou součástí rozhraní.

Podrobný návod: [desktop/README.md](desktop/README.md).

Čtvrtá sekce **04 ERP** vedle **Keeps & poznámky** je připraveným prostorem pro budoucí řízení firmy. Obsahuje přehled plánovaných oblastí (klienti a zakázky, finance, tým a úkoly, AI asistent). Firemní evidence ani AI služby v této verzi ještě nejsou implementované.

## Vytvořit Windows EXE

S přístupem k internetu a Node.js:

```powershell
.\scripts\build-lite.ps1
```

Výsledky úspěšného sestavení: `release/My-Meal-Planner-Lite-Setup-0.3.0.exe` (instalátor se zástupcem na ploše a v nabídce Start) a `release/My-Meal-Planner-Lite-0.3.0-Portable.exe`. Stejné sestavení může spustit workflow **Build Windows Lite** na GitHub Actions; hotová EXE budou artifact úspěšného běhu. EXE nejsou commitována do zdrojových souborů.

## Ověření

```powershell
node --experimental-strip-types --test tests/themes.test.mjs tests/desktop-store.test.cjs tests/desktop-startup.test.cjs tests/keep-order.test.mjs tests/keep-actions.test.mjs tests/keep-style.test.mjs tests/keep-drag.test.mjs
```

25 automatických testů prošlo: ukládání, souběžné zápisy, přenos médií, obnova poškozených dat, motivy, startovací potvrzení, firemní značka, pořadí Keeps, velké poznámky, konverze checklistů, metadata a nabídka s editorem, formátování, kontrast barev a přesouvání s rolováním. Syntaktické kontroly desktopu prošly. Runtime 45.2.3 je připravený a přenosný ZIP sestavený. Pokus o spuštění v pracovním prostředí stále skončil pádem GPU podprocesu `0xC0000135` a rendereru `launch-failed` (49). Funkční GUI ani PDF zde tedy zatím nejsou potvrzené. Spouštěč ukládá podrobnosti do `.runtime/startup-error.log`; sandbox a webSecurity zůstávají zapnuté.

## Webový základ

Web je původní Next.js aplikace v `app/` a `components/`. Nejnovější stažená větev obsahuje Discover s resetem, A4, Keeps a AI plány. Předchozí lokální bezpečnostní nastavení zůstalo zachováno: server na localhost, opt-in analytika a kontrola TypeScriptu při buildu. `scripts/setup.ps1 -Start` připravuje webovou variantu; pro Lite není potřeba. Původní sedm binárních webových assetů zatím lokálně chybí a webové závislosti nejsou instalované kvůli síťovým omezením. Na GitHubu větev zdědí původní binární assety.
