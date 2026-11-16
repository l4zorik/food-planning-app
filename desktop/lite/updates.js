// Each shipped build carries its own offline update log.
export const release = {
  version: '0.3.1', date: '2026-11-16',
  notes: [
    { title: 'Pět služeb odměn', text: 'Katalog odměn má pět spuštěných služeb: 01 Bydlení & investice, 02 Hygiena & péče o sebe (sprcha, nehty, vlasy, holení, praní prádla), 03 Cvičení, 04 Seznamování & rodina a 05 Přeprava & auto. Každá služba má vlastní etapy, progress bar i klidový stav; vybraná služba se ukládá automaticky.' },
    { title: 'Quest log · vlákno 04 ↔ 06 ↔ 07', text: 'Quest log, Moje proč a Odměny spojuje jedno vlákno: každý roh ukazuje společnou řádku a odkazy na zbývající dva. Quest log se při prvním spuštění jednou doplní aktuálními prioritami – směny 16.–22.11. a mise projektu od IČO po maximize profit. Existující questy se nepřepíšou.' },
    { title: 'Všech sedm sekcí podporuje quest log', text: 'Psychická pohoda, Týdenní plán, Nákupní seznam, Keeps & poznámky, ERP, Management i Cheats & Lifehacks mají podpůrnou lištu s aktivním questem, nejbližším krokem a tlačítkem do quest logu. AI kontext přikládá přehled všech sekcí, quest logu i odměn; zaškrtnutí je ve výchozím stavu zapnuté.' },
    { title: 'Odměny · spodní patro Klidný domov', text: 'Přes celou šířku aplikace dole přibylo patro odměn. Místo bodů je grounding odměna: klidný domov. Služba, postup i poznámka se ukládají automaticky a přenášejí v záloze; starší zálohy fungují dál.' },
    { title: 'Bydlení & investice do nemovitosti · první služba', text: 'Speciální služby vybírá tým aplikace. Spuštěná služba 01 vede po etapách Práce → Nájem → Investiční byt → Základ projektu vlastním progress barem. Další služby jsou připravované. Modal otevřete i z pravého panelu pod 06 Moje proč.' },
    { title: 'Průběh dne · klid místo bodů', text: 'Pod rutinou zůstává pět bodů: Probuzení, Snídaně, Oběd, Večeře a Spánek. Místo XP se ukazuje klidný domov a každý bod přidává klid. Staré záznamy XP zůstávají v datech i záloze, jen se nezobrazují.' },
    { title: 'Psychická pohoda · nový hlavní prostor', text: 'Po spuštění se všem otevře Psychická pohoda jako základní baterie projektu. Zápisy na hlavní obrazovce jsou propojené se základním modulem. Další perky i všech šest nástrojových sekcí jsou dostupné přímo odtud. Přehled novinek otevřete z hlavičky.' },
    { title: 'Moje perky · celek pod pravým panelem', text: 'Pod kartami Tvůj prostor a Jen u tebe najdete první modul Psychická pohoda. Další moduly lze přidávat bez pevného počtu: Finanční svoboda, Časová svoboda, Lokalizační pohoda, Politická pohoda, Látková pohoda, Skill pohoda i vlastní směry.' },
    { title: 'Pozorování → souvislosti → modul', text: 'Tři propojené modaly nabízejí způsoby hledání, vlastní nalezené problémy a výsledné perky. Pozorování může být k ověření, potvrzené, odložené nebo nepotvrzené. Jeden záznam lze propojit s více moduly.' },
    { title: 'Dokumentace a prostor pro další rozvoj', text: 'Každý modul spojuje výchozí situaci, řešení, vlastní workflow, technickou dokumentaci a návrh budoucí automatizace. Chyby a poznatky nemají pevný počet; Skill pohoda má prostor pro nápady na další aktualizace. Vše se automaticky ukládá a zálohuje.' },
    { title: '06 Cheats & Lifehacks', text: 'Nová sekce s 20 sloty pro vaše problémy a knihovnou 49 plánovacích workflow. Hledejte podle účelu, problému, oblasti a tagů. Každý postup má pět konkrétních kroků, vlastní odškrtnutí a automatické ukládání.' },
    { title: 'Problémy propojené tagy', text: 'Výběr životní situace nabídne související workflow. Společné tagy také propojí vaše problémy napříč sloty. Můžete zadat vlastní situaci, upravit její tagy a přidat více postupů do jednoho slotu. Oblíbené fungují i v nových modalech.' },
    { title: 'Výběrové modaly ve všech pěti slotech', text: 'Výběr problémů, 50 strategií a 15 rutin je dostupný v každém slotu, pro libovolné i vlastní téma. Hlavička ukazuje aktuální slot a problém; každý slot má svůj plán, dny a checklisty.' },
    { title: 'Oblíbené v modalech', text: 'Pravým kliknutím na problém, strategii nebo rutinu otevřete nabídku Označit jako oblíbené. Karty dostanou hvězdičku a v každém výběru je filtr Oblíbené. Stejnou nabídkou označení odeberete. Oblíbené se ukládají samostatně a přenášejí v záloze.' },
    { title: 'Porno · Strategie → rutina → týden', text: 'Vyberte z 50 strategií. Druhý modal nabídne 15 předpřipravených rutin a výběr 1–7 dnů v týdnu. Checklisty vybraných dnů se zobrazí vedle sebe a uchovávají odškrtnutí podle data. Ruční poznámky a vlastní kroky zůstávají zachované.' },
    { title: 'Detox · 100 témat v obrázkové mřížce', text: 'Výběr problému otevírá modal s mřížkou 10 × 10, ikonami a 100 lokálními ilustracemi. Témata můžete hledat, filtrovat podle deseti oblastí nebo napsat vlastní. Menší obrazovky mají méně sloupců.' },
    { title: 'Pět nových designů Detox', text: 'Marihuana · Botanical, Porno · Velvet, Sociální sítě · Signal, Lust a modelky · Muse a Přejídání · Balance. Karty mají vlastní vizuální styl; v nabídce vzhledu můžete vybrat také motiv celé aplikace. Celkem je k dispozici 65 motivů.' },
    { title: 'Plynulé spuštění po aktualizaci', text: 'Jedna úvodní obrazovka se automaticky zavře před zobrazením připravené aplikace. Hlavní okno čeká na načtení dat i první vykreslení, bez dalšího klikání.' },
    { title: '05 Management · a) Detox', text: 'Pět slotů pro výběr a označení problémů, strategii a konkrétní krok. Pod každým slotem je samostatný checklist rutiny, který zůstává zachovaný při změně problému i strategie. Vše se ukládá automaticky a přenáší v záloze.' },
    { title: 'Keeps · Písmo, zvýraznění a barvy', text: 'Velký editor nabízí tučné písmo, barvu textu, zvýraznění a 20 písem. V nabídce pravého tlačítka najdete barvy karty s černým textem. Volba Původní vrátí vzhled podle motivu. Formátování i barvy zůstávají uložené a přenášejí se v záloze.' },
    { title: 'Keeps · Rolování při přesouvání', text: 'Při tažení karty můžete rolovat kolečkem myši. Přiblížení k hornímu nebo dolnímu okraji okna nástěnku automaticky posouvá. Escape přesouvání zruší.' },
    { title: 'Keeps · Akce pravým tlačítkem', text: 'Pravým kliknutím připnete kartu, označíte ji jako hotovou, převedete zápis na checklist nebo přidáte tagy a skupinu. Podržení pravého tlačítka otevře velký editor s automatickým ukládáním. Skupiny lze filtrovat nad nástěnkou.' },
    { title: 'Keeps · Volná nástěnka', text: 'Všechny karty jsou vidět bez omezení na posledních sedm. Přesuňte je tažením za úchyt ⠿ nebo šipkami na klávesnici; pořadí se automaticky uloží. Texty, přílohy a zálohy nemají pevné aplikační limity velikosti.' },
    { title: '04 ERP · Prostor pro řízení firmy', text: 'Vedle Keeps & poznámky najdete novou sekci ERP. Připravuje prostor pro budoucí firemní evidenci a AI asistenta.' },
    { title: 'Záloha s aktuálním datem', text: 'Název zálohy se při každém exportu vytvoří z aktuálního místního data počítače. Dialog navrhne nový název místo názvu předchozí zálohy.' },
    { title: 'Příjemnější první dojem', text: 'Úvodní obrazovka s logem a průběhem spouštění. Zástupce Start-Lite.vbs otevírá aplikaci bez terminálu.' },
    { title: 'Vaše značka na prvním místě', text: 'Nastavte název firmy a vlastní logo. Při příštím spuštění vás přivítá vaše značka.' },
    { title: 'Přehled novinek v hlavičce', text: 'Všechny změny najdete pod tlačítkem Co je nového. Po spuštění vás přivítá hlavní obrazovka Psychická pohoda.' },
    { title: 'Lepší kontrola spouštění', text: 'Start čeká na načtení rozhraní. Opakované spuštění přepne do otevřeného okna; chyby mají vlastní dialog a uloženou diagnostiku.' },
  ],
}

export async function setupUpdates(api) {
  const $ = id => document.getElementById(id)
  const dialog = $('updates-dialog')
  $('release-version').textContent = release.version
  $('release-date').dateTime = release.date
  $('release-date').textContent = new Intl.DateTimeFormat('cs-CZ', { day: 'numeric', month: 'long', year: 'numeric' }).format(new Date(release.date + 'T12:00:00'))
  for (const [index, note] of release.notes.entries()) {
    const item = document.createElement('li')
    const number = document.createElement('span'); number.className = 'release-number'; number.textContent = String(index + 1).padStart(2, '0')
    const copy = document.createElement('div')
    const title = document.createElement('h4'); title.textContent = note.title
    const text = document.createElement('p'); text.textContent = note.text
    copy.append(title, text); item.append(number, copy); $('release-notes').append(item)
  }
  function applyBrand(brand) {
    $('business-name').value = brand.name
    $('header-brand-name').textContent = brand.name
    document.title = brand.name + ' · Meal Planner Lite'
    for (const id of ['header-brand-mark', 'updates-brand-mark']) {
      const mark = $(id)
      mark.textContent = '◒'
      if (brand.logo) {
        const image = document.createElement('img'); image.src = brand.logo; image.alt = brand.name
        image.addEventListener('error', () => { mark.textContent = '◒' }, { once: true })
        mark.replaceChildren(image)
      }
    }
  }
  async function saveBrand(chooseLogo) {
    const buttons = [$('save-business-name'), $('choose-business-logo')]
    buttons.forEach(button => { button.disabled = true })
    try {
      const brand = await api.saveBrand($('business-name').value, chooseLogo)
      if (brand) { applyBrand(brand); $('brand-feedback').textContent = 'Uloženo. Vaše značka se objeví i při příštím startu.' }
    } catch (error) { $('brand-feedback').textContent = error.message }
    finally { buttons.forEach(button => { button.disabled = false }) }
  }
  $('save-business-name').addEventListener('click', () => saveBrand(false))
  $('choose-business-logo').addEventListener('click', () => saveBrand(true))
  $('open-updates').addEventListener('click', () => { if (!dialog.open) dialog.showModal() })
  for (const id of ['continue-startup', 'close-updates']) $(id).addEventListener('click', () => dialog.close())
  try { applyBrand(await api.loadBrand()) }
  catch { $('brand-feedback').textContent = 'Značku se nepodařilo načíst. Můžete ji nastavit znovu.' }
}
