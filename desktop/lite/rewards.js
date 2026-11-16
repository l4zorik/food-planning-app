// Grounding rewards: the bottom floor of the app. Scores are replaced by a calm home.
export const housingStages = [
  { id: 'work', icon: '💼', name: 'Práce', role: 'Uživatel', roleTag: '', text: 'První příjem, který drží bydlení pohromadě.' },
  { id: 'rent', icon: '🔑', name: 'Nájem', role: 'Nájemník', roleTag: 'crook', text: 'Bydlení v bytě – nájem uživatele.' },
  { id: 'investment', icon: '🏘️', name: 'Investiční byt', role: 'Investor', roleTag: 'mafia boss', text: 'První investiční byt.' },
  { id: 'foundation', icon: '🏠', name: 'Základ projektu', role: 'Majitel nájemních bytů', roleTag: '', text: 'Klidný domov jako základ projektu.' },
]
const mkStage = (id, icon, name, text) => ({ id, icon, name, role: '', roleTag: '', text })
export const rewardServices = [
  { id: 'housing', number: '01', icon: '🏡', status: 'active', name: 'Bydlení & investice do nemovitosti', tagline: 'Práce → nájem → investiční byt → základ projektu', description: 'Bydlení v bytě a cesta k prvnímu investičnímu bytu. Odměnou je klidný domov.', target: 'k prvnímu investičnímu bytu', calm: 'Klidný domov. Základ projektu je položený.', essence: 'Investiční portfolio nájemních bytů', stages: housingStages },
  { id: 'hygiene', number: '02', icon: '🚿', status: 'active', name: 'Hygiena & péče o sebe', tagline: 'Sprcha → nehty → vlasy → holení → praní prádla', description: 'Sprcha, stříhání nehtů a vlasů, holení tváře i praní prádla. Denní péče bez spěchu.', target: 'k upravené a čisté hygieně', calm: 'Čistě a upraveně. Hygiena drží denní rytmus.', stages: [
    mkStage('shower', '🚿', 'Sprcha', 'Denní sprcha jako pevný bod dne.'),
    mkStage('nails', '✂️', 'Nehty', 'Stříhání a úprava nehtů.'),
    mkStage('hair', '💇', 'Vlasy', 'Stříhání vlasů a celkový účes.'),
    mkStage('shave', '🪒', 'Holení tváře', 'Holení a úprava tváře.'),
    mkStage('laundry', '🧺', 'Praní prádla', 'Praní, sušení a složení prádla.'),
  ] },
  { id: 'fitness', number: '03', icon: '🏃', status: 'active', name: 'Cvičení', tagline: 'Pohyb → pravidelnost → síla → výdrž', description: 'Pravidelný pohyb a síla. Odměnou je tělo, které drží krok s projektem.', target: 'k pravidelnému cvičení', calm: 'Tělo v rytmu. Cvičení je součástí dne.', stages: [
    mkStage('movement', '🏃', 'Pohyb', 'První pravidelný pohyb v týdnu.'),
    mkStage('routine', '📆', 'Pravidelnost', 'Cvičení má své pevné dny.'),
    mkStage('strength', '💪', 'Síla', 'Síla a kondice rostou spolu.'),
    mkStage('endurance', '🔥', 'Výdrž', 'Výdrž bez vyhoření.'),
  ] },
  { id: 'dating', number: '04', icon: '💞', status: 'active', name: 'Seznamování & rodina', tagline: 'Otevřít se → seznamování → vztah → rodina', description: 'Seznamování, vztah a rodina jako vlastní cesta mimo práci a projekt.', target: 'k seznamování a rodině', calm: 'Otevřené dveře. Seznamování má svůj klidný krok.', stages: [
    mkStage('open', '🌱', 'Otevřít se', 'Otevřít se novým lidem.'),
    mkStage('meet', '🤝', 'Seznamování', 'První schůzky a rozhovory.'),
    mkStage('relationship', '❤️', 'Vztah', 'Vztah, který drží.'),
    mkStage('family', '🏡', 'Rodina', 'Rodina jako základ.'),
  ] },
  { id: 'transport', number: '05', icon: '🚗', status: 'active', name: 'Přeprava & auto', tagline: 'Řidičák → první auto → servis → spolehlivá přeprava', description: 'Vlastní auto a spolehlivá přeprava kamkoliv potřebuješ.', target: 'k vlastnímu autu', calm: 'Kola se točí. Přeprava je vyřešená.', stages: [
    mkStage('licence', '📄', 'Řidičský průkaz', 'Platný řidičský průkaz.'),
    mkStage('car', '🚗', 'První auto', 'První vlastní auto.'),
    mkStage('service', '🛠️', 'Servis & provoz', 'Servis, pojistka a pohonné hmoty v klidu.'),
    mkStage('reliable', '🛣️', 'Spolehlivá přeprava', 'Spolehlivá přeprava bez starostí.'),
  ] },
  { id: 'business', number: '06', icon: '💼', status: 'active', name: 'Business', tagline: 'Nápad → první klient → první tržba → systém', description: 'Vlastní podnikání od prvního nápadu po fungující systém.', target: 'k prvnímu systému', calm: 'Systém běží. Business drží.', stages: [
    mkStage('idea', '💡', 'Nápad', 'První nápad, který jde prodat.'),
    mkStage('client', '🤝', 'První klient', 'První platící klient.'),
    mkStage('revenue', '💰', 'První tržba', 'První opakovaná tržba.'),
    mkStage('system', '⚙️', 'Systém', 'Firma běží i bez tebe.'),
  ] },
  { id: 'education', number: '07', icon: '🎓', status: 'active', name: 'Vzdělávání', tagline: 'Kurz → certifikát → praxe → obor', description: 'Kurzy, certifikáty a praxe, které posouvají k dalšímu kroku.', target: 'k ověřené dovednosti', calm: 'Dovednost je ověřená a použitelná.', stages: [
    mkStage('course', '📚', 'Kurz', 'Dokončený kurz nebo škola.'),
    mkStage('certificate', '🎓', 'Certifikát', 'Ověřený certifikát.'),
    mkStage('practice', '🧪', 'Praxe', 'Dovednost použitá v praxi.'),
    mkStage('mastery', '🏆', 'Odborník', 'Uznávaná odbornost.'),
  ] },
  { id: 'training', number: '08', icon: '🧘', status: 'active', name: 'Training', tagline: 'Mysl → tělo → duše → víra → bůh', description: 'Pět podslužeb v jedné cestě. Kliknutím vyjedou a každá má vlastní postup.', target: 'k rovnováze mysli, těla a duše', calm: 'Rovnováha. Mysl, tělo, duše, víra i bůh drží pohromadě.', stages: [], subs: [
    { id: 'mind', icon: '🧠', name: 'Mysl', stages: [
      mkStage('focus', '🎯', 'Soustředění', 'Bloky hluboké práce bez rušení.'),
      mkStage('read', '📚', 'Čtení', 'Pravidelné čtení, které posouvá.'),
      mkStage('reflect', '✍️', 'Zápis myšlenek', 'Myšlenka zapsaná slovy.'),
      mkStage('calm', '🧘', 'Klid mysli', 'Chvíle ticha bez obrazovky.'),
    ] },
    { id: 'body', icon: '💪', name: 'Tělo', stages: [
      mkStage('move', '🏃', 'Pohyb', 'Krátký pohyb každý den.'),
      mkStage('strength', '🏋️', 'Síla', 'Trénink s odporem.'),
      mkStage('sleep', '😴', 'Spánek', 'Pravidelný a dostatečný spánek.'),
      mkStage('fuel', '🥗', 'Strava', 'Jídlo, které drží energii.'),
    ] },
    { id: 'soul', icon: '🕊️', name: 'Duše', stages: [
      mkStage('gratitude', '❤️', 'Vděčnost', 'Tři vděčnosti dne.'),
      mkStage('joy', '🎨', 'Radost', 'Činnost, která tě nabíjí.'),
      mkStage('peace', '🕊️', 'Vnitřní klid', 'Čas bez spěchu a výčitek.'),
      mkStage('bonds', '🤝', 'Vztahy', 'Čas s lidmi, na kterých záleží.'),
    ] },
    { id: 'faith', icon: '✝️', name: 'Víra', stages: [
      mkStage('word', '📖', 'Boží slovo', 'Čtení a rozjímání.'),
      mkStage('pray', '🙏', 'Modlitba', 'Chvíle modlitby bez spěchu.'),
      mkStage('sunday', '⛪', 'Společenství', 'Neděle a lidé kolem.'),
      mkStage('trust', '🌿', 'Důvěra', 'Krok vpřed i bez jistoty.'),
    ] },
    { id: 'god', icon: '🙌', name: 'Bůh', stages: [
      mkStage('surrender', '🙌', 'Odevzdání', 'Předat, co neunesu.'),
      mkStage('praise', '🎶', 'Chvála', 'Chválit i mimo dobrou chvíli.'),
      mkStage('love', '💛', 'Láska', 'Jednat s láskou k sobě i druhým.'),
      mkStage('path', '🕊️', 'Cesta', 'Rozhodovat se podle víry.'),
    ] },
  ] },
  { id: 'work', number: '09', icon: '🛠️', status: 'active', name: 'Práce', tagline: 'Odpověď → přijetí → stálé místo → povýšení', description: 'Cesta v práci od první odpovědi po povýšení.', target: 'k povýšení', calm: 'Místo drží a roste.', stages: [
    mkStage('apply', '📨', 'Odpověď', 'Odpověď na nabídku práce.'),
    mkStage('hired', '✅', 'Přijetí', 'První pracovní den.'),
    mkStage('stable', '📈', 'Stabilní místo', 'Jistý příjem každý měsíc.'),
    mkStage('promote', '🚀', 'Povýšení', 'Více zodpovědnosti a lepší plat.'),
  ] },
  { id: 'hobbies', number: '10', icon: '🎨', status: 'active', name: 'Koníčky', tagline: 'Objevit → vyzkoušet → pravidelně → mistr', description: 'Čas, který patří jen tobě: záliby a řemesla.', target: 'k vlastní zálibě', calm: 'Koníček má své místo v týdnu.', stages: [
    mkStage('discover', '🔍', 'Objevit', 'Najít, co tě baví.'),
    mkStage('try', '🧪', 'Vyzkoušet', 'Vyzkoušet první variantu.'),
    mkStage('regular', '📌', 'Pravidelně', 'Záliba má pevné dny.'),
    mkStage('mastery', '🏆', 'Mistrovství', 'Vlastní styl a řemeslo.'),
  ] },
  { id: 'ai', number: '11', icon: '🤖', status: 'premium', name: 'AI', tagline: 'Nástroje → agent → pipeline → copilot', description: 'Prémiová služba: AI jako každodenní parťák.', target: 'k vlastnímu AI parťákovi', calm: 'AI pracuje s tebou.', stages: [
    mkStage('tools', '🤖', 'Nástroje', 'První vyzkoušené AI nástroje.'),
    mkStage('agent', '🧠', 'Agent', 'Vlastní agent na opakující se kroky.'),
    mkStage('pipeline', '🔗', 'Pipeline', 'Propojené kroky bez ruční práce.'),
    mkStage('copilot', '🚀', 'Copilot', 'AI parťák na každý den.'),
  ] },
  { id: 'robotics', number: '12', icon: '🦾', status: 'premium', name: 'Robotika', tagline: 'Senzory → robot → dílna → výroba', description: 'Prémiová služba: roboti a fyzická automatizace.', target: 'k prvnímu robotovi', calm: 'Robot pracuje za tebe.', stages: [
    mkStage('sensor', '📡', 'Senzory', 'Senzory čtou okolí.'),
    mkStage('robot', '🦾', 'Robot', 'První vlastní robot.'),
    mkStage('workshop', '🔧', 'Dílna', 'Místo, kde robot vzniká.'),
    mkStage('line', '🏭', 'Výroba', 'Vlastní výrobní linka.'),
  ] },
  { id: 'automation', number: '13', icon: '⚙️', status: 'premium', name: 'Automizace', tagline: 'Spouštěč → workflow → skript → autonomie', description: 'Prémiová služba: procesy, které běží samy.', target: 'k autonomním procesům', calm: 'Procesy běží samy.', stages: [
    mkStage('trigger', '⚡', 'Spouštěč', 'Událost, která něco spustí.'),
    mkStage('flow', '🔁', 'Workflow', 'Propojené kroky v jednom tahu.'),
    mkStage('script', '📜', 'Skript', 'Vlastní skript na míru.'),
    mkStage('autonomy', '🕊️', 'Autonomie', 'Proces běží bez dohledu.'),
  ] },
  { id: 'children', number: '14', icon: '👶', status: 'active', name: 'Děti', tagline: 'Příprava → narození → první roky → společný domov', description: 'Cesta k dětem a společnému domovu.', target: 'k rodině s dětmi', calm: 'Domov je plný života.', stages: [
    mkStage('prepare', '🤰', 'Příprava', 'Příprava na příchod dítěte.'),
    mkStage('birth', '👶', 'Narození', 'První dny s miminkem.'),
    mkStage('toddler', '🧸', 'První roky', 'Krůčky, slova a objevování.'),
    mkStage('home', '🏠', 'Společný domov', 'Rodina pohromadě.'),
  ] },
  { id: 'parenting', number: '15', icon: '🌱', status: 'active', name: 'Výchova', tagline: 'Pravidla → rutina → příklad → samostatnost', description: 'Výchova, která dává dětem kořeny i křídla.', target: 'k vlastní cestě dětí', calm: 'Děti rostou v jistotě.', stages: [
    mkStage('rules', '📏', 'Pravidla', 'Jasná a férová pravidla.'),
    mkStage('routine', '⏰', 'Rutina', 'Stabilní rytmus dne.'),
    mkStage('example', '🪞', 'Příklad', 'Vede příklad, ne rozkaz.'),
    mkStage('free', '🦋', 'Samostatnost', 'Děti zvládají víc samy.'),
  ] },
]
export function ensureRewards(state) {
  if (!state.rewards || typeof state.rewards !== 'object' || Array.isArray(state.rewards)) state.rewards = {}
  const rewards = state.rewards
  if (typeof rewards.selectedService !== 'string' || !rewardServices.some(service => service.id === rewards.selectedService && service.status === 'active')) rewards.selectedService = 'housing'
  if (!rewards.tracks || typeof rewards.tracks !== 'object' || Array.isArray(rewards.tracks)) rewards.tracks = {}
  for (const service of rewardServices) {
    const saved = rewards.tracks[service.id]
    const track = rewards.tracks[service.id] = saved && typeof saved === 'object' && !Array.isArray(saved) ? saved : { stages: {}, note: '' }
    if (!track.stages || typeof track.stages !== 'object' || Array.isArray(track.stages)) track.stages = {}
    for (const stage of service.stages) if (typeof track.stages[stage.id] !== 'boolean') track.stages[stage.id] = false
    if (typeof track.note !== 'string') track.note = ''
    if (service.subs) {
      if (!track.subs || typeof track.subs !== 'object' || Array.isArray(track.subs)) track.subs = {}
      for (const sub of service.subs) {
        const savedSub = track.subs[sub.id]
        const subTrack = track.subs[sub.id] = savedSub && typeof savedSub === 'object' && !Array.isArray(savedSub) ? savedSub : { stages: {} }
        if (!subTrack.stages || typeof subTrack.stages !== 'object' || Array.isArray(subTrack.stages)) subTrack.stages = {}
        for (const stage of sub.stages) if (typeof subTrack.stages[stage.id] !== 'boolean') subTrack.stages[stage.id] = false
      }
    }
  }
  // Hmotná podstata: the tangible product of the path, the meaning of the whole floor.
  if (!rewards.essence || typeof rewards.essence !== 'object' || Array.isArray(rewards.essence)) rewards.essence = { slots: [] }
  if (!Array.isArray(rewards.essence.slots)) rewards.essence.slots = []
  rewards.essence.slots = rewards.essence.slots.filter(slot => slot && typeof slot === 'object' && !Array.isArray(slot) && typeof slot.id === 'string' && typeof slot.serviceId === 'string' && typeof slot.title === 'string')
  for (const slot of rewards.essence.slots) slot.done = slot.done === true
  for (const service of rewardServices) {
    if (!service.essence || rewards.essence.slots.some(slot => slot.serviceId === service.id)) continue
    rewards.essence.slots.push({ id: `${service.id}-essence`, serviceId: service.id, title: service.essence, done: false })
  }
  return rewards
}
export function rewardProgress(track, stages = housingStages) {
  const done = stages.filter(stage => track?.stages?.[stage.id] === true).length
  return { done, total: stages.length, percent: stages.length ? Math.round(done * 100 / stages.length) : 0 }
}
export function serviceProgress(track, service) {
  if (!service.subs?.length) return rewardProgress(track, service.stages)
  let done = 0, total = 0
  for (const sub of service.subs) {
    const subTrack = track?.subs?.[sub.id]
    done += sub.stages.filter(stage => subTrack?.stages?.[stage.id] === true).length
    total += sub.stages.length
  }
  return { done, total, percent: total ? Math.round(done * 100 / total) : 0 }
}
export function selectedRewardProgress(state) {
  const rewards = ensureRewards(state)
  const service = rewardServices.find(item => item.id === rewards.selectedService) || rewardServices[0]
  return { service, ...serviceProgress(rewards.tracks[service.id], service) }
}
function node(tag, text, className) {
  const result = document.createElement(tag)
  if (text !== undefined) result.textContent = text
  if (className) result.className = className
  return result
}
export function setupRewards({ getState, save }) {
  const $ = id => document.getElementById(id), dialog = $('reward-dialog')
  let selectedSubId = null, animateSubs = false
  function state() { const value = getState(); ensureRewards(value); return value }
  function service() { return selectedRewardProgress(state()).service }
  function track() { return state().rewards.tracks[service().id] }
  function renderFloor() {
    const current = service(), trackValue = track(), progress = serviceProgress(trackValue, current)
    $('rewards-floor-icon').textContent = current.icon
    $('rewards-floor-number').textContent = `SPECIÁLNÍ SLUŽBA ${current.number}`
    $('rewards-floor-name').textContent = current.name
    $('rewards-floor-label').textContent = `${progress.done}/${progress.total} etap · ${progress.percent} %`
    const meter = $('rewards-floor-meter'); meter.max = progress.total || 1; meter.value = progress.done
    const list = $('rewards-floor-stages'); list.replaceChildren()
    const items = current.subs
      ? current.subs.map(sub => {
          const subTrack = trackValue.subs[sub.id]
          const done = sub.stages.filter(stage => subTrack.stages[stage.id]).length
          return { icon: sub.icon, name: sub.name, detail: `${done}/${sub.stages.length} etap`, done: done === sub.stages.length }
        })
      : current.stages.map(stage => ({ icon: stage.icon, name: stage.name, detail: stage.roleTag ? `${stage.role} · ${stage.roleTag}` : stage.role || stage.name, done: trackValue.stages[stage.id] }))
    for (const item of items) {
      const entry = node('li', undefined, 'reward-floor-stage')
      entry.classList.toggle('is-done', item.done)
      const copy = node('span', undefined, 'reward-stage-copy')
      copy.append(node('strong', item.name), node('small', item.detail))
      entry.append(node('span', item.icon, 'reward-stage-icon'), copy, node('span', item.done ? '✓' : '·', 'reward-stage-mark'))
      list.append(entry)
    }
    const slots = state().rewards.essence.slots
    const slot = slots.find(item => item.serviceId === current.id) || slots[0]
    $('rewards-floor-essence').textContent = slot ? (slot.done ? `✓ ${slot.title}` : slot.title) : 'Smysl se plní postupně.'
    $('rewards-hub-summary').textContent = `${current.icon} ${current.name} · ${progress.percent} %`
  }
  function renderEssence() {
    const box = $('reward-essence'); box.replaceChildren()
    const slots = state().rewards.essence.slots
    slots.forEach((slot, index) => {
      const vendor = rewardServices.find(item => item.id === slot.serviceId)
      const card = node('div', undefined, 'reward-essence-slot')
      card.classList.toggle('is-done', slot.done)
      const left = node('span', undefined, 'reward-essence-left')
      const head = node('span', undefined, 'reward-essence-head')
      head.append(node('span', String(index + 1).padStart(2, '0'), 'reward-essence-number'), node('small', vendor ? `${vendor.icon} ${vendor.name}` : 'Služba'))
      const body = node('span', undefined, 'reward-essence-body')
      body.append(node('strong', slot.title), node('small', 'Produkt cesty · smysl všeho'))
      left.append(head, body)
      const label = node('label', undefined, 'reward-essence-check')
      const check = node('input'); check.type = 'checkbox'; check.checked = slot.done
      check.setAttribute('aria-label', `Získáno: ${slot.title}`)
      check.addEventListener('change', () => { slot.done = check.checked; save(); renderEssence(); renderFloor() })
      label.append(check, node('span', 'Získáno'))
      card.append(left, label)
      box.append(card)
    })
  }
  function renderProgress() {
    const current = service(), progress = serviceProgress(track(), current)
    $('reward-progress-label').textContent = `${progress.done}/${progress.total} etap · ${progress.percent} % ${current.target}`
    const meter = $('reward-progress-meter'); meter.max = progress.total || 1; meter.value = progress.done
    const banner = $('reward-calm-state')
    banner.hidden = progress.done < progress.total
    if (!banner.hidden) banner.textContent = current.calm
  }
  function renderSubs(current, trackValue) {
    const box = $('reward-subs')
    const enter = animateSubs; animateSubs = false
    box.replaceChildren()
    if (!current.subs?.length) { box.hidden = true; return }
    box.hidden = false
    box.classList.toggle('is-enter', enter)
    current.subs.forEach((sub, index) => {
      const subTrack = trackValue.subs[sub.id]
      const done = sub.stages.filter(stage => subTrack.stages[stage.id]).length
      const chip = node('button', undefined, 'reward-sub'); chip.type = 'button'; chip.dataset.subId = sub.id
      chip.setAttribute('aria-pressed', String(sub.id === selectedSubId))
      chip.classList.toggle('is-selected', sub.id === selectedSubId)
      if (enter) chip.style.animationDelay = `${index * 70}ms`
      chip.append(node('span', sub.icon), node('strong', sub.name), node('small', `${done}/${sub.stages.length}`))
      chip.addEventListener('click', () => { selectedSubId = sub.id; renderModal() })
      box.append(chip)
    })
  }
  function renderModal() {
    const rewards = state().rewards, current = service(), trackValue = track()
    if (current.subs?.length && !current.subs.some(sub => sub.id === selectedSubId)) selectedSubId = current.subs[0].id
    const count = $('reward-service-count'); count.replaceChildren()
    const activeCount = rewardServices.filter(item => item.status === 'active').length
    const premiumCount = rewardServices.filter(item => item.status === 'premium').length
    count.append(node('strong', String(activeCount)), node('span', premiumCount ? ` služeb spuštěno · ${premiumCount} premium` : ' služeb spuštěno'))
    const services = $('reward-services'); services.replaceChildren()
    for (const item of rewardServices) {
      const selected = rewards.selectedService === item.id
      const locked = item.status !== 'active'
      const card = node('button', undefined, 'reward-service'); card.type = 'button'; card.dataset.serviceId = item.id
      card.setAttribute('aria-pressed', String(selected))
      card.classList.toggle('is-selected', selected)
      card.classList.toggle('is-premium', item.status === 'premium')
      card.classList.toggle('is-planned', item.status === 'planned')
      card.disabled = locked
      const copy = node('span', undefined, 'reward-service-copy')
      const badge = item.status === 'premium' ? '🔒 Premium služba' : item.status === 'planned' ? 'Připravuje tým aplikace' : item.tagline
      copy.append(node('small', `SPECIÁLNÍ SLUŽBA ${item.number}`), node('strong', item.name), node('p', item.description), node('small', badge, 'reward-service-tagline'))
      card.append(node('span', item.icon, 'reward-service-icon'), copy, node('span', locked ? '🔒' : selected ? '✓' : '↗', 'reward-service-mark'))
      if (!locked) card.addEventListener('click', () => {
        if (state().rewards.selectedService === item.id) return
        state().rewards.selectedService = item.id
        animateSubs = Boolean(item.subs?.length)
        save(); renderModal(); renderFloor()
      })
      services.append(card)
    }
    renderEssence()
    renderSubs(current, trackValue)
    const sub = current.subs?.length ? current.subs.find(item => item.id === selectedSubId) : null
    $('reward-track-title').textContent = sub ? `${current.name} · ${sub.icon} ${sub.name}` : `${current.name} · ${current.tagline}`
    $('reward-track-intro').textContent = current.description
    const stages = sub ? sub.stages : current.stages
    const stageTrack = sub ? trackValue.subs[sub.id] : trackValue
    const list = $('reward-stages'); list.replaceChildren()
    for (const stage of stages) {
      const label = node('label', undefined, 'reward-stage'), check = node('input'), mark = node('span', undefined, 'reward-stage-mark')
      check.type = 'checkbox'; check.checked = stageTrack.stages[stage.id]
      check.setAttribute('aria-label', `Etapa ${stage.name}`)
      const copy = node('span', undefined, 'reward-stage-copy')
      const role = stage.roleTag ? `${stage.role} · ${stage.roleTag}` : stage.role
      copy.append(node('strong', `${stage.icon} ${stage.name}`), role ? node('small', role) : node('small', sub ? sub.name : current.name), node('p', stage.text))
      function sync() {
        label.classList.toggle('is-done', check.checked)
        mark.textContent = check.checked ? '✓' : '·'
        renderProgress(); renderFloor(); if (current.subs?.length) renderSubs(current, trackValue)
      }
      check.addEventListener('change', () => { stageTrack.stages[stage.id] = check.checked; save(); sync() })
      label.append(check, copy, mark); sync(); list.append(label)
    }
    $('reward-note').value = trackValue.note
    renderProgress()
  }
  function open() { animateSubs = true; renderModal(); if (!dialog.open) dialog.showModal() }
  for (const id of ['rewards-open', 'rewards-hub-open', 'thread-rewards-04', 'thread-rewards-06']) $(id).addEventListener('click', open)
  $('reward-close').addEventListener('click', () => dialog.close())
  $('reward-close-footer').addEventListener('click', () => dialog.close())
  dialog.addEventListener('click', event => { if (event.target === dialog) dialog.close() })
  $('reward-note').addEventListener('input', () => { track().note = $('reward-note').value; save() })
  return { render() { renderFloor(); if (dialog.open) renderModal() } }
}
