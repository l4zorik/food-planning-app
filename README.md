# My Meal Planner — Electron Lite

Osobní Windows aplikace je v `desktop/`, samostatná větev GitHubu: `electron-desktop`. Webový základ zůstává z větve `v0/ai-meal-plans`, commit `484eb71`.

## Spustit Lite

Dvojklik na **Start-Lite.vbs** spustí aplikaci bez terminálu, s úvodním logem. Původní `Start-Lite.cmd` předá spuštění stejnému spouštěči, při dvojkliku ale může krátce probliknout konzole. Runtime musí odpovídat verzi v `desktop/package.json`; automatický návrat ke starému preview byl odstraněn. Data vývojové verze jsou v ignorované složce `.local-data/personal-data`, mimo Git.

Spouštění používá jedinou úvodní obrazovku přímo v Electronu. Hlavní okno se zobrazí až po načtení dat a prvním vykreslení; úvodní obrazovka se předtím automaticky odstraní. Skrytý PowerShell spouštěč už nevytváří další okno.

Po spuštění se všem otevře hlavní obrazovka **Psychická pohoda**, základní baterie projektu. Přehled **Co je nového** otevřete tlačítkem v hlavičce. V něm rozbalte **Vaše firma, vaše logo** a zadejte název firmy nebo vyberte PNG/JPEG. Značka se uloží lokálně a použije se i na úvodní obrazovce dalšího spuštění. Přehled lze zavřít tlačítkem **Zpět do mého prostoru**, křížkem nebo Escape a znovu otevřít z hlavičky. [Úplný seznam změn](CHANGELOG.md).

## Kde je aplikace ke stažení / instalaci

Přenosný balíček: `release/My-Meal-Planner-Lite-0.3.0-Windows.zip`. Rozbalte **celý** ZIP a spusťte `MealPlanner.exe`. Nepotřebujete Node.js ani instalaci závislostí. Samotné EXE neoddělujte od ostatních souborů. ZIP je přenosná aplikace, nikoli klasický instalátor; uživatelská data zůstávají v profilu Windows.

Přenosný balíček lze bez npm sestavit pomocí `scripts/package-lite-offline.ps1`, pokud je už připravený runtime. Klasický NSIS instalátor vytvoří níže uvedený síťový build. V tomto prostředí se jeho sestavení zastavilo na blokovaném přístupu k npm, takže soubor Setup zde zatím není.

Vývojová a přenosná verze mají oddělené datové složky. Pro přesun dat použijte **Zálohovat** ve staré verzi a **Obnovit** v nové.

Lite obsahuje týdenní plán, nákupní seznam, Keeps s poznámkami a úkoly po řádcích, import fotek/GIFů/videí, všechny Keeps na automaticky rostoucí nástěnce s přesouváním karet a bez pevných limitů velikosti, automatické ukládání, zálohy včetně médií, A4 PDF a 65 motivů. Je bez React buildu a bez síťových služeb. AI a Discover zůstávají ve webovém základu; v Lite nejsou součástí rozhraní.

Podrobný návod: [desktop/README.md](desktop/README.md).

Čtvrtá sekce **04 ERP** vedle **Keeps & poznámky** je připraveným prostorem pro budoucí řízení firmy. Obsahuje přehled plánovaných oblastí (klienti a zakázky, finance, tým a úkoly, AI asistent). Firemní evidence ani AI služby v této verzi ještě nejsou implementované.

Pátá sekce **05 Management** obsahuje **a) Detox**: pět slotů pro vlastní nebo nabízený problém, označení, čím se chcete zabývat, výběr strategie a konkrétní krok. Pod každým slotem je samostatná rutina s přidáváním, mazáním a odškrtáváním kroků. Změna problému, strategie ani označení slotu rutinu nemaže a neresetuje; tlačítko **Odškrtnout rutinu** umožňuje checklist použít znovu. Management se ukládá automaticky a je součástí zálohy. Starší zálohy bez Managementu fungují dál. Změna je ve zdrojové Lite aplikaci spouštěné přes Start-Lite.vbs; dříve sestavené ZIPy ji neobsahují.

Výběr problému ve slotu otevře obrázkový modal se **100 tématy v mřížce 10 × 10**. Na menší obrazovce se počet sloupců zmenší. Každé téma má ikonu a vlastní lokální SVG ilustraci, hledání funguje i bez diakritiky a témata lze filtrovat podle deseti oblastí. Můžete zadat i vlastní problém. Jde o výběr témat, nikoli statistický žebříček.

Pět témat má vlastní design karty: **Marihuana · Botanical, Porno · Velvet, Sociální sítě · Signal, Lust a modelky · Muse, Přejídání · Balance**. Motiv celé aplikace vyberete v **Jakou máš náladu? → Kolekce motivů → 5 motivů Detox**. Motiv se ukládá a přenáší v záloze; výběr tématu ve slotu nemění motiv celé aplikace automaticky. Ilustrace jsou v `desktop/lite/assets/problems/` a lze je znovu vytvořit příkazem `node scripts/generate-problem-art.mjs`. Provoz nepotřebuje síť ani externí obrázkové služby.

Ve všech pěti slotech, pro libovolný problém včetně vlastního tématu, otevře pole **Jakou strategii zvolím** modal s **50 strategiemi** a obrázky, hledáním a deseti oblastmi. Po výběru navazuje druhý modal: **15 předpřipravených rutin**, jedna nebo více vybraných rutin a **1–7 konkrétních dnů v týdnu**. Plán se uloží až tlačítkem **Přidat do mého týdne**. Zavření nebo Escape rozpracovanou volbu zruší; zpět se lze vrátit na strategie.

V části **Rutina** se zvolené dny zobrazují vedle sebe, každý s vlastním checklistem. Šipky přepínají týdny. Odškrtnutí se ukládá podle data, změna šablon zachovává historii i původní ruční kroky. Pole **Můj konkrétní krok** ponechává vaše poznámky; prázdné pole se při potvrzení doplní názvy rutin. Nový výběr upraví aktivní týdenní plán.

Pod rutinou je **Průběh dne**: Probuzení, Snídaně, Oběd, Večeře, Spánek. Každý bod přidává klid místo bodů, už se nezobrazují XP. Starší bodové záznamy zůstávají v datech i záloze, jen se nezobrazují; opakované zaškrtnutí nic nenásobí. Datum umožňuje zobrazit předchozí den; tlačítko **Dnes** vrací aktuální místní datum. Týdenní checklisty a denní body jsou nezávislé, automaticky uložené a součástí zálohy. Starší zálohy bez těchto polí fungují dál.

Strategie jsou výběr praktických možností, nikoli žebříček účinnosti. Kontext pro jejich přípravu: [NICE – změna chování a malé kroky](https://www.nice.org.uk/guidance/ph49/chapter/recommendations), [Mayo Clinic – práce se spouštěči a vlastními hranicemi](https://www.mayoclinic.org/diseases-conditions/compulsive-sexual-behavior/diagnosis-treatment/drc-20360453).

V modalech problémů, strategií a rutin klikněte na kartu **pravým tlačítkem → Označit jako oblíbené**. Hvězdička odliší oblíbenou kartu a filtr **★ Oblíbené** zobrazí pouze označené položky; u problémů a strategií funguje společně s hledáním a kategorií. Opětovná nabídka umožňuje **Odebrat z oblíbených**. Nabídku otevřete i pomocí **Shift+F10** nebo klávesy kontextové nabídky. Escape nejprve zavře nabídku. Označení se ukládá okamžitě a je společné napříč sloty, pro problémy, strategie a rutiny samostatně. Neruší rozpracovanou volbu ani nemění plán a přenáší se v záloze.

Šestá sekce **06 Cheats & Lifehacks** nabízí **20 slotů** a **49 životních situací s workflow**, rozdělených do sedmi oblastí: bydlení a základy, práce, vzdělání, peníze, podnikání, vztahy, směr a každodennost. Každý postup obsahuje účel, tagy a pět konkrétních kroků. Jde o připravený výběr situací, nikoli statistické pořadí nejčastějších problémů.

Ve slotu otevřete **Vybrat můj problém**. Po zvolení situace se otevřou související workflow; lze zadat i vlastní situaci s tagy. Knihovna má samostatné hledání **účelu a problému**, obecné hledání bez diakritiky, oblast, tag a filtr souvisejících postupů. Z hlavního tlačítka lze procházet všech 49 workflow a zvolit cílový slot. Každý slot může mít více různých checklistů; přidání stejného workflow podruhé zachová stávající odškrtnutí.

Kliknutí na tag otevře odpovídající workflow. Společné tagy také zobrazí související problémy v ostatních slotech a odkaz na ně. Tagy problému lze upravit, účel a poznámky mají vlastní pole. Změna problému zachovává přidané postupy i splněné kroky. V obou nových modalech fungují **oblíbené přes pravý klik**. Celá sekce je součástí automatického ukládání a zálohy, starší zálohy bez ní jsou dál podporované.

Pro obecný postup u ztráty bydlení a hledání práce byly ověřeny informace veřejných institucí: [MPSV – místní sociální služby a sociální pracovníci](https://mpsv.gov.cz/pro-klienty-/-pecujici-osoby), [MPSV – pracovní a rekvalifikační poradenství](https://mpsv.gov.cz/mam-praci-studenti-ostatni-poradenstvi). Konkrétní podmínky služby se ověřují přímo u jejího poskytovatele.

Pod oběma pravými kartami **Tvůj prostor / Jen u tebe** je nový prostor **Moje perky**. Začíná modulem **Psychická pohoda**; tlačítko **Přidat modul** otevře výběr sedmi směrů: Psychická pohoda, Finanční svoboda, Časová svoboda, Lokalizační pohoda, Politická pohoda, Látková pohoda a Skill pohoda. Lze přidávat i vlastní moduly a více modulů stejného směru, bez pevného počtu.

Tři propojené modaly vedou od **způsobů hledání** přes **nalezené problémy a pozorování** k **výsledným modulům**. Deset metod nabízí konkrétní otázky; hledání lze přeskočit a poznatek nemusí být problém ani úkol. Záznam má vlastní pozorování, tagy a stav **K ověření / Potvrzeno pozorováním / Teď neřeším / Nepotvrdilo se**. Může zůstat nepropojený nebo souviset s více moduly. Z otevřeného modulu jej připojíte tlačítkem **Připojit pozorování**.

Každý perk má vlastní souvislosti a poznámky, výchozí situaci, řešení, upravitelný checklist workflow a dokumentaci technického postupu. Návrh automatizace obsahuje spouštěč, vstupy, kroky, výstupy a hranice; jde o uloženou přípravu pro vyšší verzi, nikoliv spouštění automatických akcí. Nové chyby, poznatky a otevřené otázky nemají pevný počet. **Skill pohoda** označuje tuto část jako nápady na budoucí aktualizace softwaru. Moduly, pozorování, dokumentace i návrhy se ukládají automaticky a přenášejí v záloze; starší zálohy zůstávají podporované.

**Psychická pohoda je výchozí hlavní obrazovka pro všechny**, také po načtení starších dat. Základní modul se doplní, pokud chybí; existující zápisy ani další moduly se nepřepisují. Pole **Co už je v pořádku a co chci zachovat?** a **Čemu chci dát prostor?** sdílejí přímo souvislosti a řešení základního modulu. Hlavní obrazovka nabízí další perky a odkazy na všech šest nástrojových sekcí. Domů se vrátíte prvním tlačítkem **Psychická pohoda** v navigaci. Symbol baterie je označením základu projektu, bez hodnocení psychického stavu. Novinky se otevírají ručně z hlavičky.

Přes celou šířku aplikace dole je spodní patro **07 · Odměny** s grounding odměnou **Klidný domov** místo bodů. Speciální služby vybírá tým aplikace; první spuštěná služba je **Bydlení & investice do nemovitosti** s vlastním progress barem po etapách **Práce → Nájem → Investiční byt → Základ projektu**. Stejná cesta je i v modalu odměn s etapami, klidovým stavem a vlastní poznámkou; odkaz najdete i v pravém panelu pod **06 Moje proč**. Služba, etapy i poznámka se ukládají automaticky a přenášejí v záloze, starší zálohy bez nich fungují dál.

## Vytvořit Windows EXE

S přístupem k internetu a Node.js:

```powershell
.\scripts\build-lite.ps1
```

Výsledky úspěšného sestavení: `release/My-Meal-Planner-Lite-Setup-0.3.0.exe` (instalátor se zástupcem na ploše a v nabídce Start) a `release/My-Meal-Planner-Lite-0.3.0-Portable.exe`. Stejné sestavení může spustit workflow **Build Windows Lite** na GitHub Actions; hotová EXE budou artifact úspěšného běhu. EXE nejsou commitována do zdrojových souborů.

## Ověření

```powershell
node --experimental-strip-types --test tests/themes.test.mjs tests/desktop-store.test.cjs tests/desktop-startup.test.cjs tests/keep-order.test.mjs tests/keep-actions.test.mjs tests/keep-style.test.mjs tests/keep-drag.test.mjs tests/management.test.mjs tests/problem-picker.test.mjs tests/strategy-routine.test.mjs tests/modal-favorites.test.mjs tests/lifehacks.test.mjs tests/perks.test.mjs tests/home.test.mjs
```

62 automatických testů prošlo (včetně slotů Detoxu, nezávislé rutiny, ukládání a obnovy): ukládání, souběžné zápisy, přenos médií, obnova poškozených dat, motivy, startovací potvrzení, firemní značka, pořadí Keeps, velké poznámky, konverze checklistů, metadata a nabídka s editorem, formátování, kontrast barev a přesouvání s rolováním. Syntaktické kontroly desktopu prošly. Runtime 45.2.3 je připravený a přenosný ZIP sestavený. Pokus o spuštění v pracovním prostředí stále skončil pádem GPU podprocesu `0xC0000135` a rendereru `launch-failed` (49). Funkční GUI ani PDF zde tedy zatím nejsou potvrzené. Spouštěč ukládá podrobnosti do `.runtime/startup-error.log`; sandbox a webSecurity zůstávají zapnuté.

## Webový základ

Web je původní Next.js aplikace v `app/` a `components/`. Nejnovější stažená větev obsahuje Discover s resetem, A4, Keeps a AI plány. Předchozí lokální bezpečnostní nastavení zůstalo zachováno: server na localhost, opt-in analytika a kontrola TypeScriptu při buildu. `scripts/setup.ps1 -Start` připravuje webovou variantu; pro Lite není potřeba. Původní sedm binárních webových assetů zatím lokálně chybí a webové závislosti nejsou instalované kvůli síťovým omezením. Na GitHubu větev zdědí původní binární assety.
