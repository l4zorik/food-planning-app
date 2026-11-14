// Practical options, not an effectiveness ranking or a treatment protocol.
// Background: https://www.nice.org.uk/guidance/ph49/chapter/recommendations
// https://www.mayoclinic.org/diseases-conditions/compulsive-sexual-behavior/diagnosis-treatment/drc-20360453
export const strategyGroups = [
  ['environment', 'Prostředí', '🏡', '024', [
    ['Telefon mimo ložnici', 'Na noc mu vyhradím místo mimo postel.'],
    ['Zařízení ve společném prostoru', 'Vyberu si místo, kde chci zařízení používat.'],
    ['Úklid uloženého obsahu', 'Projdu obsah, který si už nechci nechávat.'],
    ['Méně automatických přístupů', 'Zruším zkratky a automatické přihlášení.'],
    ['Připravené klidné místo', 'Připravím si prostor pro jinou činnost.'],
  ]],
  ['triggers', 'Spouštěče', '🧭', '031', [
    ['Mapa spouštěčů', 'Všímám si situací, které obvykle předcházejí sledování.'],
    ['Zachytit čas a místo', 'Zapíšu si, kdy a kde se potřeba objevuje.'],
    ['Rozpoznat nudu', 'Rozliším potřebu podnětů od toho, co chci dělat.'],
    ['Rozpoznat osamělost', 'Všimnu si, kdy hledám především kontakt.'],
    ['Plán pro rizikovou chvíli', 'Dopředu si zvolím další malý krok.'],
  ]],
  ['attention', 'Pozornost', '◉', '023', [
    ['Pauza před rozhodnutím', 'Než jednám, nechám si chvíli na volbu.'],
    ['Odložení o deset minut', 'Zkusím se k rozhodnutí vrátit po krátké pauze.'],
    ['Pojmenovat nutkání', 'Všimnu si pocitu a pojmenuji ho.'],
    ['Pozorovat bez okamžité reakce', 'Chvíli sleduji, jak se pocit mění.'],
    ['Vrátit se k přítomnosti', 'Zaměřím pozornost na své okolí a další krok.'],
  ]],
  ['alternatives', 'Náhradní činnosti', '🌱', '041', [
    ['Krátká procházka', 'Mám připravenou jednoduchou trasu venku.'],
    ['Pohyb podle vlastních možností', 'Vyberu si příjemnou, zvládnutelnou aktivitu.'],
    ['Tvořivá alternativa', 'Připravím si kreslení, hudbu nebo jinou tvorbu.'],
    ['Malý praktický úkol', 'Pustím se do krátkého úkolu s jasným koncem.'],
    ['Seznam příjemných možností', 'Sepíšu si několik činností, které si mohu vybrat.'],
  ]],
  ['rhythm', 'Denní rytmus', '☀', '092', [
    ['Ranní start bez obrazovky', 'První chvíli dne věnuji běžným ranním krokům.'],
    ['Večerní odpojení', 'Naplánuji si čas na zavření obrazovek.'],
    ['Předem naplánovaný volný čas', 'Volný blok dostane konkrétní náplň.'],
    ['Pravidelné přestávky', 'Mezi úkoly zařadím krátké pauzy.'],
    ['Klidný přechod ke spánku', 'Připravím si opakovatelný večerní závěr.'],
  ]],
  ['emotions', 'Emoce', '☁', '022', [
    ['Pojmenovat aktuální emoci', 'Zapíšu, co právě prožívám.'],
    ['Jiný způsob uvolnění napětí', 'Připravím si klidnou činnost pro náročnou chvíli.'],
    ['Krátký zápis místo automatické reakce', 'Na chvíli zachytím situaci vlastními slovy.'],
    ['Laskavý vnitřní rozhovor', 'Zvolím věcný a podpůrný způsob řeči k sobě.'],
    ['Péče o základní potřeby', 'Všimnu si únavy, hladu a potřeby odpočinku.'],
  ]],
  ['values', 'Směr a hodnoty', '✨', '033', [
    ['Vlastní důvod změny', 'Pojmenuji, proč si tuto změnu vybírám.'],
    ['Malý dosažitelný cíl', 'Vyberu si něco, co zvládnu ovlivnit dnes.'],
    ['Pravidlo když–tak', 'Ke konkrétní situaci přiřadím konkrétní reakci.'],
    ['Rozhodnutí na dnešek', 'Soustředím se na dnešní volby.'],
    ['Čas pro důležitou oblast života', 'Věnuji blok času něčemu, na čem mi záleží.'],
  ]],
  ['support', 'Podpora', '🤝', '060', [
    ['Kontakt s důvěryhodným člověkem', 'Vyberu si člověka, se kterým chci být v kontaktu.'],
    ['Domluvený podpůrný check-in', 'Dobrovolně si domluvím krátké pravidelné ohlédnutí.'],
    ['Společná aktivita', 'Naplánuji si čas s někým dalším.'],
    ['Pojmenovat vlastní hranice', 'Připravím si, co chci a nechci sdílet.'],
    ['Rozhovor s odborníkem', 'Pokud chci, připravím si témata na odbornou konzultaci.'],
  ]],
  ['digital', 'Digitální hranice', '🔒', '001', [
    ['Dobrovolná blokace vybraných webů', 'Na vlastním zařízení nastavím hranici, kterou si volím.'],
    ['Omezení doporučovaného obsahu', 'Upravím sledované účty a doporučení.'],
    ['Časová okna pro internet', 'Zvolím, kdy a za jakým účelem budu online.'],
    ['Záměr před otevřením prohlížeče', 'Předem si řeknu, co chci na internetu udělat.'],
    ['Offline alternativa po ruce', 'Připravím si činnost dostupnou bez obrazovky.'],
  ]],
  ['review', 'Ohlédnutí a pokračování', '📈', '088', [
    ['Krátké denní ohlédnutí', 'Všimnu si, co dnes fungovalo.'],
    ['Týdenní revize plánu', 'Podle zkušenosti upravím další týden.'],
    ['Ocenit konkrétní malý krok', 'Všimnu si úsilí, které jsem opravdu udělal.'],
    ['Návrat po odchylce', 'Zachytím zkušenost a vyberu další krok bez trestání.'],
    ['Upravit obtížnost plánu', 'Zmenším nebo rozšířím plán podle svých možností.'],
  ]],
]

export const pornStrategies = strategyGroups.flatMap(([group, category, icon, image, entries], groupIndex) => entries.map(([name, description], index) => ({
  id: `porn-strategy-${String(groupIndex * 5 + index + 1).padStart(2, '0')}`, name, description, group, category, icon, image: `./assets/problems/${image}.svg`,
})))

export const routineTemplates = [
  ['morning', 'Ráno s vlastním záměrem', '🌅', '019', ['Nechat telefon na určeném místě', 'Pojmenovat jeden záměr pro dnešek', 'Začít první běžnou ranní činností']],
  ['evening', 'Večerní odpojení', '🌙', '018', ['Dokončit záměrnou práci na internetu', 'Odložit zařízení mimo postel', 'Vybrat klidnou činnost před spaním']],
  ['pause', 'Pauza při nutkání', '⏳', '061', ['Pojmenovat, co právě cítím', 'Dát si deset minut před rozhodnutím', 'Vybrat jednu připravenou alternativu']],
  ['trigger', 'Zápis spouštěče', '🧭', '031', ['Poznamenat čas a situaci', 'Pojmenovat emoci nebo potřebu', 'Zapsat, co chci příště zkusit']],
  ['walk', 'Krátce ven', '👟', '094', ['Vybrat krátkou dostupnou trasu', 'Projít se podle svých možností', 'Po návratu si všimnout, jak mi je']],
  ['movement', 'Pohybová pauza', '🍃', '100', ['Zvolit příjemný lehký pohyb', 'Věnovat mu krátký blok času', 'Všimnout si změny napětí']],
  ['create', 'Tvořivých deset minut', '🎨', '043', ['Připravit si pomůcky', 'Věnovat chvíli tvorbě bez hodnocení', 'Uložit výsledek a uzavřít činnost']],
  ['focus', 'Malý dokončený úkol', '📋', '067', ['Vybrat jeden malý úkol', 'Odstranit jedno rozptýlení', 'Dokončit úkol a ocenit úsilí']],
  ['connect', 'Kontakt místo izolace', '🤝', '060', ['Vybrat člověka, kterému chci napsat', 'Ozvat se způsobem, který mi vyhovuje', 'Naplánovat si další společný kontakt']],
  ['digital', 'Úklid digitálního prostoru', '🗂️', '017', ['Projít jednu oblast uloženého obsahu', 'Upravit nechtěné zkratky nebo sledování', 'Ověřit vlastní nastavení hranic']],
  ['intention', 'Internet se záměrem', '🌐', '013', ['Pojmenovat důvod otevření prohlížeče', 'Dokončit zvolenou činnost', 'Zavřít okno po splnění záměru']],
  ['care', 'Základní péče o sebe', '🪴', '043', ['Všimnout si hladu, žízně a únavy', 'Postarat se o jednu aktuální potřebu', 'Vyhradit si krátký odpočinek']],
  ['values', 'Krok k tomu, co chci', '🎯', '033', ['Přečíst si vlastní důvod změny', 'Vybrat jeden krok v důležité oblasti', 'Věnovat mu krátký soustředěný blok']],
  ['reflect', 'Ohlédnutí bez hodnocení', '📝', '088', ['Zapsat jednu věc, která se povedla', 'Popsat jednu obtížnou situaci věcně', 'Zvolit malý krok na příště']],
  ['restart', 'Nový krok po odchylce', '🌱', '041', ['Popsat, co se stalo, bez urážek vůči sobě', 'Zvolit jednu užitečnou úpravu prostředí', 'Vrátit se k příštímu plánovanému kroku']],
].map(([id, name, icon, image, steps]) => ({ id, name, icon, image: `./assets/problems/${image}.svg`, steps }))

export const routineWeekdays = ['Pondělí', 'Úterý', 'Středa', 'Čtvrtek', 'Pátek', 'Sobota', 'Neděle']
export const dailyMilestones = [
  ['wake', 'Probuzení', '🌅'], ['breakfast', 'Snídaně', '🥣'], ['lunch', 'Oběd', '🍽️'], ['dinner', 'Večeře', '🍲'], ['sleep', 'Spánek', '🌙'],
]

export function filterStrategies(query = '', group = '') {
  const fold = text => text.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()
  const terms = fold(query).trim().split(/\s+/).filter(Boolean)
  return pornStrategies.filter(item => (!group || item.group === group) && terms.every(term => fold(`${item.name} ${item.description} ${item.category}`).includes(term)))
}
