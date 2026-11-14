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
