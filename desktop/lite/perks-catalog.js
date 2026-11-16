export const discoveryMethods = [
  ['quiet', 'Co už funguje a co ruší klid', '🍃', '100', 'Začni celkem: všimni si dobrých věcí a teprve potom konkrétního tření.', 'Co chci zachovat? Co se opakuje? Je opravdu potřeba něco měnit?'],
  ['day', 'Pozorování běžného dne', '☀️', '092', 'Zachyť konkrétní situaci při běžné činnosti.', 'Kdy a kde se to děje? Co jsem skutečně pozoroval?'],
  ['repeat', 'Opakovaná chyba', '↻', '067', 'Všimni si chyby nebo překážky, která se vrací.', 'Jak ji zopakuji? Co předchází chybě? Jaký je skutečný dopad?'],
  ['gap', 'Rozdíl mezi přáním a skutečností', '🧭', '031', 'Porovnej zamýšlený výsledek s tím, co se opravdu děje.', 'Co jsem čekal? Co nastalo? Který rozdíl je pro mě důležitý?'],
  ['friction', 'Zbytečné kroky a čekání', '⏳', '061', 'Hledej konkrétní místo, kde se ztrácí čas nebo energie.', 'Kde čekám? Co dělám opakovaně? Dá se některý krok vynechat?'],
  ['feedback', 'Zpětná vazba', '💬', '059', 'Zapiš konkrétní zkušenost někoho, koho se situace týká.', 'Co zaznělo? Je to ověřitelné? Nezaměňuji názor za skutečnost?'],
  ['resources', 'Chybějící zdroj nebo dovednost', '🧰', '087', 'Rozliš, zda chybí informace, dovednost, prostředek nebo odpočinek.', 'Co potřebuji? Co už mám? Jak mohu mezeru ověřit malým pokusem?'],
  ['experiment', 'Malý ověřovací pokus', '🔎', '090', 'Místo domýšlení vyzkoušej malý bezpečný krok.', 'Co předpokládám? Jaký malý pokus to ověří? Co ukáže, že problém není?'],
  ['chain', 'Souvislosti a návaznosti', '🔗', '034', 'Podívej se na to, co situaci předchází a co následuje.', 'Co je příčina a co důsledek? Co spolu opravdu souvisí?'],
  ['notes', 'Volná poznámka nebo otázka', '📝', '088', 'Ulož nápad, aniž bys z něj hned dělal problém nebo úkol.', 'Co mě napadlo? Chci to teď řešit, nebo to může zůstat otevřené?'],
].map(([id, name, icon, image, description, prompts]) => ({ id, name, icon, image: `./assets/problems/${image}.svg`, description, prompts }))

export const perkTemplates = [
  ['mind', 'Psychická pohoda', '🍃', '100', 'Prostor pro zastavení, souvislosti a to, co už funguje.', ['Všimnout si toho, co už funguje', 'Vybrat, čemu chci dát prostor a co může počkat', 'Uzavřít dnešní poznámku a nechat prostor odpočinku']],
  ['financial', 'Finanční svoboda', '◇', '071', 'Vlastní přehled, možnosti a dlouhodobý finanční záměr.', ['Popsat svůj záměr a výchozí situaci', 'Vybrat jeden ověřitelný krok podle vlastních možností', 'Zapsat výsledek a upravit další postup']],
  ['time', 'Časová svoboda', '◷', '068', 'Čas pro důležité věci a méně zbytečných návazností.', ['Zmapovat, kam směřuje můj čas', 'Vybrat jednu činnost ke zjednodušení', 'Ověřit změnu a zaznamenat zkušenost']],
  ['location', 'Lokalizační pohoda', '⌁', '051', 'Zázemí, prostředí a možnost zvolit si, odkud žiji a pracuji.', ['Popsat, jaké prostředí a zázemí potřebuji', 'Porovnat dostupné možnosti a omezení', 'Ověřit jeden malý krok ke vhodnějšímu zázemí']],
  ['political', 'Politická pohoda', '⚖', '026', 'Vlastní hodnoty, informovanost a hranice veřejného dění.', ['Pojmenovat své hodnoty a hranice', 'Oddělit ověřené informace od domněnek', 'Zvolit vlastní přiměřený způsob zapojení nebo odstupu']],
  ['substance', 'Látková pohoda', '🌱', '008', 'Detox management mastery: vlastní hranice, návyky a jejich souvislosti.', ['Popsat návyk, vlastní záměr a hranice', 'Zvolit zvládnutelný podpůrný krok', 'Zapsat zkušenost a co potřebuji dále ověřit']],
  ['skill', 'Skill pohoda', '✦', '081', 'Dovednosti a otevřený prostor pro budoucí aktualizace softwaru.', ['Popsat požadovanou dovednost nebo funkci', 'Připravit malý ověřitelný výstup', 'Zapsat výsledek, dokumentaci a další rozšíření']],
  ['financial-strength', 'Finanční síla', '◈', '073', 'Vlastní finanční kapacita, odolnost a prostor pro rozhodování.', ['Popsat dostupné zdroje a závazky', 'Vybrat jednu reálnou možnost posílení své situace', 'Zapsat výsledek a další ověřitelný krok']],
  ['physical-strength', 'Tělesná síla', '💪', '094', 'Tělesné schopnosti, pohyb a odpočinek podle vlastních možností.', ['Pojmenovat vlastní pohybový záměr a možnosti', 'Zvolit zvládnutelnou aktivitu a prostor pro odpočinek', 'Zapsat zkušenost a přiměřeně upravit další postup']],
  ['mental-prosperity', 'Psychická prosperita', '☀', '093', 'Prostor pro radost, rozvoj a vnitřní oporu.', ['Všimnout si, co mi přináší oporu a radost', 'Dát prostor jedné smysluplné činnosti', 'Zapsat zkušenost a to, co chci zachovat']],
  ['spiritual-prosperity', 'Duševní prosperita', '✧', '032', 'Smysl, hodnoty a vlastní způsob vnitřního rozvoje.', ['Pojmenovat, co mi dává smysl', 'Vybrat vlastní způsob zastavení nebo poznávání', 'Zapsat souvislosti, otázky a další směr']],
  ['community-prosperity', 'Komunitní prosperita', '🤝', '055', 'Vzájemnost, sdílené zázemí a přínos lidem kolem sebe.', ['Zmapovat lidi a skupiny, se kterými chci být v kontaktu', 'Domluvit jeden dobrovolný společný krok', 'Zhodnotit vzájemný přínos a další spolupráci']],
].map(([id, name, icon, image, description, workflow]) => ({ id, name, icon, image: `./assets/problems/${image}.svg`, description, workflow }))

export const findingStatuses = [['assumption', 'K ověření'], ['confirmed', 'Potvrzeno pozorováním'], ['parked', 'Teď neřeším'], ['disproved', 'Nepotvrdilo se']]

export function createPerk(template, createId = () => crypto.randomUUID(), now = () => new Date()) {
  return {
    id: createId(), templateId: template.id, name: template.name, createdAt: now().toISOString(), findingIds: [],
    reflection: '', problem: '', solution: '',
    workflow: template.workflow.map(text => ({ id: createId(), text, done: false })),
    documentation: `# ${template.name}\n\n## Záměr\n${template.description}\n\n## Výchozí situace a pozorování\n\n## Zvolený postup\n\n## Ověření výsledku\n\n## Změny a další poznatky\n`,
    automation: { trigger: '', inputs: '', actions: '', outputs: '', boundaries: '' }, issues: [],
  }
}

export function linkPerkFinding(perk, finding) {
  if (perk.findingIds.includes(finding.id)) return false
  perk.findingIds.push(finding.id)
  if (!perk.problem.trim()) perk.problem = finding.name
  return true
}

export function ensureWellbeingPerk(collection) {
  let base = collection.modules.find(module => module.templateId === 'mind')
  if (!base) { base = createPerk(perkTemplates[0]); collection.modules.unshift(base) }
  return base
}

export function filterPerkCatalog(items, query) {
  const fold = value => value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLocaleLowerCase('cs')
  const terms = fold(query).trim().split(/\s+/).filter(Boolean)
  return items.filter(item => terms.every(term => fold(`${item.name} ${item.description || ''} ${item.evidence || ''} ${(item.tags || []).join(' ')}`).includes(term)))
}
