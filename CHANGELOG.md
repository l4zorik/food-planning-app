## 2026-11-14 · 06 Cheats & Lifehacks

- Šestá sekce, 20 slotů pro životní situace a 49 workflow v sedmi oblastech.
- Dva modaly: výběr problému a knihovna workflow s hledáním podle účelu, problému, oblasti a tagů.
- Každý postup má vlastní pětikrokový checklist. Do slotu lze přidat více různých postupů.
- Upravitelné tagy propojují související workflow i problémy v dalších slotech.
- Vlastní situace, poznámky, označení Teď řeším a oblíbené přes pravé tlačítko.
- Automatické ukládání a zálohy s podporou starších dat.

## 2026-11-14 · Výběrové modaly ve všech slotech

- Problém, strategie a rutina se vybírají z modalů ve všech pěti slotech, včetně vlastních témat.
- Hlavička strategií a rutin zobrazuje aktuální slot a problém.
- Původní strategie, poznámky, oblíbené a samostatné týdenní plány zůstávají zachované.

## 2026-11-14 · Oblíbené v modalech

- Kontextová nabídka pravého tlačítka u problémů, strategií a rutin: označit / odebrat z oblíbených.
- Hvězdičky, samostatné filtry Oblíbené, klávesová nabídka Shift+F10 a zavírání Escape.
- Ukládání a přenos v záloze, nezávisle na rozpracovaných volbách a plánech.

## 2026-11-14 · Porno: strategie, týdenní rutiny a denní XP

- 50 strategií s hledáním, filtry, ikonami a lokálními obrázky.
- Dva navazující modaly: strategie, potom výběr z 15 rutin a 1–7 konkrétních dnů týdně. Uložení až po potvrzení.
- Checklisty dnů vedle sebe, přepínání týdnů a historie odškrtnutí podle data.
- Denní checklist Probuzení, Snídaně, Oběd, Večeře, Spánek; 20 XP za bod, maximálně 100 XP za datum.
- Rozšířené zálohy a validace se zachováním starších dat, ručních poznámek i checklistů.

## 2026-11-14 · Obrázkový výběr problémů a designy

- Modal se 100 tématy, mřížkou 10 × 10, hledáním bez diakritiky, deseti filtry a vlastním tématem.
- 100 vlastních lokálních SVG ilustrací a ikony, bez síťových požadavků.
- Pět designů karet i celé aplikace: Botanical, Velvet, Signal, Muse a Balance.
- Celkem 65 motivů; nové motivy se přenášejí v záloze.
- Zachování strategie, plánu a checklistu při výběru nového problému.
- 35 automatických testů, syntaktické kontroly a validace všech 100 SVG prošly. Vizuální kontrolu zablokoval timeout místního Chrome rendereru.

## 2026-11-14 · Plynulé spuštění

- Jediná úvodní obrazovka v Electronu; odstraněno druhé okno PowerShell spouštěče.
- Hlavní okno se zobrazí po načtení dat a prvním vykreslení. Splash se odstraní před aktivací aplikace.
- Potvrzení spouštěči až po zobrazení hlavního okna; regresní testy obou pořadí načítání a vykreslení.

## 2026-11-14 · Management / Detox

- Pátá sekce 05 Management, část a) Detox s pěti sloty.
- Označení problému, výběr nebo vlastní text problému, strategie a konkrétní krok.
- Pod každým slotem nezávislý checklist rutiny s přidáváním, mazáním a odškrtnutím všech kroků.
- Automatické ukládání, záloha a obnova včetně zpětné kompatibility starších dat.

# Novinky

## Připravované změny

- Přesouvání Keeps s kolečkem myši a automatickým posouváním u okrajů okna.
- Zvětšený editor s tučným textem, barvou textu, zvýrazněním a 20 písmy Windows.
- Barvy karet v kontextové nabídce i editoru; černý text na barevných kartách a zachování motivu u původní barvy.

- Kontextová nabídka Keeps: připnutí, dokončení, převod zápis/checklist, tagy a skupiny s filtrem.
- Podržení pravého tlačítka otevře zvětšený editor s automatickým ukládáním; přílohy zůstávají zachované při převodech.

- Keeps lze přesouvat tažením i klávesnicí; pořadí zůstane uložené po restartu i v záloze.
- Odstraněny pevné limity délky Keeps, 4 MB textových dat, 100 MB příloh a 180 MB záloh. Praktickou hranicí zůstávají prostředky počítače.

- Keeps zobrazují všechny karty bez dosavadního omezení na posledních 7. Nástěnka automaticky roste o další řádky a ukazuje celkový počet.

## 0.3.0 — 13. listopadu 2026

- Čtvrtá sekce **04 ERP** hned vedle **Keeps & poznámky**.
- Samostatná úvodní stránka pro budoucí AI ERP s plánovanými oblastmi obchodu, financí, provozu a AI asistenta.
- Firemní evidence ani AI služby zatím nejsou implementovány; jde o základ pro další rozvoj.

## 0.2.1 — 13. listopadu 2026

- Název zálohy se při každém exportu počítá z aktuálního místního data počítače místo UTC.
- Ukládací dialog dostává celou cestu s aktuálním názvem, aby nepřebíral starý název zálohy.

## 0.2.0 — 13. listopadu 2026

- Spouštěč `Start-Lite.vbs` bez terminálu, s úvodním logem a průběhem načítání.
- Vlastní název firmy a logo PNG/JPEG v přehledu novinek; značka se uchová pro další spuštění.
- Přehled změn při každém startu a tlačítko **Co je nového** pro opětovné otevření.
- Runtime odpovídá verzi v manifestu; starý offline preview se už automaticky nepoužívá.
- Start potvrzuje načtené rozhraní a opakované spuštění přepíná do stávajícího okna.
- Chyby spouštění mají dialog a diagnostický soubor; běhové soubory dostávají oprávnění pro čtení sandboxem.
- Konfigurace NSIS instalátoru a portable EXE; samostatný offline skript vytváří přenosnou složku a ZIP.

Klasický instalátor vyžaduje úspěšné sestavení pomocí `scripts/build-lite.ps1` s přístupem k síti. Přenosný ZIP lze vytvořit ze stávajícího runtime pomocí `scripts/package-lite-offline.ps1`.
