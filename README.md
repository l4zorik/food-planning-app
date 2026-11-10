# My Meal Planner — Electron Lite

Osobní Windows aplikace je v `desktop/`, samostatná větev GitHubu: `electron-desktop`. Webový základ zůstává z větve `v0/ai-meal-plans`, commit `484eb71`.

## Spustit Lite

Dvojklik na **Start-Lite.cmd**. Spouštěč preferuje nainstalovaný Electron; na tomto počítači umí použít také již uloženou offline cache. Data vývojové verze jsou v ignorované složce `.local-data/personal-data`, mimo Git.

Lite obsahuje týdenní plán, nákupní seznam, Keeps s poznámkami a úkoly po řádcích, import fotek/GIFů/videí, posledních 7 nebo všechny Keeps, automatické ukládání, zálohy včetně médií, A4 PDF a 60 motivů. Je bez React buildu a bez síťových služeb. AI a Discover zůstávají ve webovém základu; v Lite nejsou součástí rozhraní.

Podrobný návod: [desktop/README.md](desktop/README.md).

## Vytvořit Windows EXE

S přístupem k internetu a Node.js:

```powershell
.\scripts\build-lite.ps1
```

Výsledek: `release/My-Meal-Planner-Lite-0.1.0-Windows.exe`. Stejné sestavení může spustit workflow **Build Windows Lite** na GitHub Actions; hotové EXE bude artifact úspěšného běhu. EXE není commitováno do zdrojových souborů.

## Ověření

```powershell
node --experimental-strip-types --test tests/themes.test.mjs tests/desktop-store.test.cjs
```

11 automatických testů prošlo: ukládání po restartu, souběžné zápisy, přenos médií v záloze, validace a obnova poškozených dat a všechny motivy. Skutečný pokus o spuštění v pracovním prostředí skončil pádem GPU podprocesu Electronu `0xC0000135`; funkční GUI ani PDF v Electronu zde zatím potvrzené nejsou. Sandbox a webSecurity zůstávají zapnuté. Pro lokální zkoušku byl použit Electron 39.8.10 z existující cache; nové balíčky mají připnutý Electron 45.2.3.

## Webový základ

Web je původní Next.js aplikace v `app/` a `components/`. Nejnovější stažená větev obsahuje Discover s resetem, A4, Keeps a AI plány. Předchozí lokální bezpečnostní nastavení zůstalo zachováno: server na localhost, opt-in analytika a kontrola TypeScriptu při buildu. `scripts/setup.ps1 -Start` připravuje webovou variantu; pro Lite není potřeba. Původní sedm binárních webových assetů zatím lokálně chybí a webové závislosti nejsou instalované kvůli síťovým omezením. Na GitHubu větev zdědí původní binární assety.
