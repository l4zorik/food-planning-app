// Grounding rewards: the bottom floor of the app. Scores are replaced by a calm home.
export const housingStages = [
  { id: 'work', icon: '💼', name: 'Práce', role: 'Uživatel', roleTag: '', text: 'První příjem, který drží bydlení pohromadě.' },
  { id: 'rent', icon: '🔑', name: 'Nájem', role: 'Nájemník', roleTag: 'crook', text: 'Bydlení v bytě – nájem uživatele.' },
  { id: 'investment', icon: '🏘️', name: 'Investiční byt', role: 'Investor', roleTag: 'mafia boss', text: 'První investiční byt.' },
  { id: 'foundation', icon: '🏠', name: 'Základ projektu', role: 'Majitel nájemních bytů', roleTag: '', text: 'Klidný domov jako základ projektu.' },
]
export const rewardServices = [
  { id: 'housing', number: '01', icon: '🏡', status: 'active', name: 'Bydlení & investice do nemovitosti', tagline: 'Práce → nájem → investiční byt → základ projektu', description: 'Bydlení v bytě a cesta k prvnímu investičnímu bytu. Odměnou je klidný domov.', target: 'k prvnímu investičnímu bytu', calm: 'Klidný domov. Základ projektu je položený.', stages: housingStages },
  { id: 'hygiene', number: '02', icon: '🚿', status: 'active', name: 'Hygiena & péče o sebe', tagline: 'Sprcha → nehty → vlasy → holení → praní prádla', description: 'Sprcha, stříhání nehtů a vlasů, holení tváře i praní prádla. Denní péče bez spěchu.', target: 'k upravené a čisté hygieně', calm: 'Čistě a upraveně. Hygiena drží denní rytmus.', stages: [
    { id: 'shower', icon: '🚿', name: 'Sprcha', role: '', roleTag: '', text: 'Denní sprcha jako pevný bod dne.' },
    { id: 'nails', icon: '✂️', name: 'Nehty', role: '', roleTag: '', text: 'Stříhání a úprava nehtů.' },
    { id: 'hair', icon: '💇', name: 'Vlasy', role: '', roleTag: '', text: 'Stříhání vlasů a celkový účes.' },
    { id: 'shave', icon: '🪒', name: 'Holení tváře', role: '', roleTag: '', text: 'Holení a úprava tváře.' },
    { id: 'laundry', icon: '🧺', name: 'Praní prádla', role: '', roleTag: '', text: 'Praní, sušení a složení prádla.' },
  ] },
  { id: 'fitness', number: '03', icon: '🏃', status: 'active', name: 'Cvičení', tagline: 'Pohyb → pravidelnost → síla → výdrž', description: 'Pravidelný pohyb a síla. Odměnou je tělo, které drží krok s projektem.', target: 'k pravidelnému cvičení', calm: 'Tělo v rytmu. Cvičení je součástí dne.', stages: [
    { id: 'movement', icon: '🏃', name: 'Pohyb', role: '', roleTag: '', text: 'První pravidelný pohyb v týdnu.' },
    { id: 'routine', icon: '📆', name: 'Pravidelnost', role: '', roleTag: '', text: 'Cvičení má své pevné dny.' },
    { id: 'strength', icon: '💪', name: 'Síla', role: '', roleTag: '', text: 'Síla a kondice rostou spolu.' },
    { id: 'endurance', icon: '🔥', name: 'Výdrž', role: '', roleTag: '', text: 'Výdrž bez vyhoření.' },
  ] },
  { id: 'dating', number: '04', icon: '💞', status: 'active', name: 'Seznamování & rodina', tagline: 'Otevřít se → seznamování → vztah → rodina', description: 'Seznamování, vztah a rodina jako vlastní cesta mimo práci a projekt.', target: 'k seznamování a rodině', calm: 'Otevřené dveře. Seznamování má svůj klidný krok.', stages: [
    { id: 'open', icon: '🌱', name: 'Otevřít se', role: '', roleTag: '', text: 'Otevřít se novým lidem.' },
    { id: 'meet', icon: '🤝', name: 'Seznamování', role: '', roleTag: '', text: 'První schůzky a rozhovory.' },
    { id: 'relationship', icon: '❤️', name: 'Vztah', role: '', roleTag: '', text: 'Vztah, který drží.' },
    { id: 'family', icon: '🏡', name: 'Rodina', role: '', roleTag: '', text: 'Rodina jako základ.' },
  ] },
  { id: 'transport', number: '05', icon: '🚗', status: 'active', name: 'Přeprava & auto', tagline: 'Řidičák → první auto → servis → spolehlivá přeprava', description: 'Vlastní auto a spolehlivá přeprava kamkoliv potřebuješ.', target: 'k vlastnímu autu', calm: 'Kola se točí. Přeprava je vyřešená.', stages: [
    { id: 'licence', icon: '📄', name: 'Řidičský průkaz', role: '', roleTag: '', text: 'Platný řidičský průkaz.' },
    { id: 'car', icon: '🚗', name: 'První auto', role: '', roleTag: '', text: 'První vlastní auto.' },
    { id: 'service', icon: '🛠️', name: 'Servis & provoz', role: '', roleTag: '', text: 'Servis, pojistka a pohonné hmoty v klidu.' },
    { id: 'reliable', icon: '🛣️', name: 'Spolehlivá přeprava', role: '', roleTag: '', text: 'Spolehlivá přeprava bez starostí.' },
  ] },
]
export function ensureRewards(state) {
  if (!state.rewards || typeof state.rewards !== 'object' || Array.isArray(state.rewards)) state.rewards = {}
  const rewards = state.rewards
  if (typeof rewards.selectedService !== 'string' || !rewardServices.some(service => service.id === rewards.selectedService)) rewards.selectedService = 'housing'
  if (!rewards.tracks || typeof rewards.tracks !== 'object' || Array.isArray(rewards.tracks)) rewards.tracks = {}
  for (const service of rewardServices) {
    const saved = rewards.tracks[service.id]
    const track = rewards.tracks[service.id] = saved && typeof saved === 'object' && !Array.isArray(saved) ? saved : { stages: {}, note: '' }
    if (!track.stages || typeof track.stages !== 'object' || Array.isArray(track.stages)) track.stages = {}
    for (const stage of service.stages) if (typeof track.stages[stage.id] !== 'boolean') track.stages[stage.id] = false
    if (typeof track.note !== 'string') track.note = ''
  }
  return rewards
}
export function rewardProgress(track, stages = housingStages) {
  const done = stages.filter(stage => track?.stages?.[stage.id] === true).length
  return { done, total: stages.length, percent: Math.round(done * 100 / stages.length) }
}
export function selectedRewardProgress(state) {
  const rewards = ensureRewards(state)
  const service = rewardServices.find(item => item.id === rewards.selectedService) || rewardServices[0]
  return { service, ...rewardProgress(rewards.tracks[service.id], service.stages) }
}
function node(tag, text, className) {
  const result = document.createElement(tag)
  if (text !== undefined) result.textContent = text
  if (className) result.className = className
  return result
}
export function setupRewards({ getState, save }) {
  const $ = id => document.getElementById(id), dialog = $('reward-dialog')
  function state() { const value = getState(); ensureRewards(value); return value }
  function service() { return selectedRewardProgress(state()).service }
  function track() { return state().rewards.tracks[service().id] }
  function renderFloor() {
    const current = service(), progress = rewardProgress(track(), current.stages)
    $('rewards-floor-icon').textContent = current.icon
    $('rewards-floor-number').textContent = `SPECIÁLNÍ SLUŽBA ${current.number}`
    $('rewards-floor-name').textContent = current.name
    $('rewards-floor-label').textContent = `${progress.done}/${progress.total} etap · ${progress.percent} %`
    const meter = $('rewards-floor-meter'); meter.max = progress.total || 1; meter.value = progress.done
    const list = $('rewards-floor-stages'); list.replaceChildren()
    for (const stage of current.stages) {
      const done = track().stages[stage.id]
      const item = node('li', undefined, 'reward-floor-stage')
      item.classList.toggle('is-done', done)
      const copy = node('span', undefined, 'reward-stage-copy')
      copy.append(node('strong', stage.name), node('small', stage.roleTag ? `${stage.role} · ${stage.roleTag}` : stage.role || stage.name))
      item.append(node('span', stage.icon, 'reward-stage-icon'), copy, node('span', done ? '✓' : '·', 'reward-stage-mark'))
      list.append(item)
    }
    $('rewards-hub-summary').textContent = `${current.icon} ${current.name} · ${progress.percent} %`
  }
  function renderProgress() {
    const current = service(), progress = rewardProgress(track(), current.stages)
    $('reward-progress-label').textContent = `${progress.done}/${progress.total} etap · ${progress.percent} % ${current.target}`
    const meter = $('reward-progress-meter'); meter.max = progress.total || 1; meter.value = progress.done
    const banner = $('reward-calm-state')
    banner.hidden = progress.done < progress.total
    if (!banner.hidden) banner.textContent = current.calm
  }
  function renderModal() {
    const rewards = state().rewards, current = service()
    const count = $('reward-service-count'); count.replaceChildren()
    count.append(node('strong', String(rewardServices.filter(item => item.status === 'active').length)), node('span', ' služeb spuštěno'))
    const services = $('reward-services'); services.replaceChildren()
    for (const item of rewardServices) {
      const selected = rewards.selectedService === item.id
      const card = node('button', undefined, 'reward-service'); card.type = 'button'; card.dataset.serviceId = item.id
      card.setAttribute('aria-pressed', String(selected))
      card.classList.toggle('is-selected', selected)
      card.classList.toggle('is-planned', item.status === 'planned')
      card.disabled = item.status === 'planned'
      const copy = node('span', undefined, 'reward-service-copy')
      copy.append(node('small', `SPECIÁLNÍ SLUŽBA ${item.number}`), node('strong', item.name), node('p', item.description), node('small', item.status === 'planned' ? 'Připravuje tým aplikace' : item.tagline, 'reward-service-tagline'))
      card.append(node('span', item.icon, 'reward-service-icon'), copy, node('span', selected ? '✓' : '↗', 'reward-service-mark'))
      if (item.status !== 'planned') card.addEventListener('click', () => {
        if (state().rewards.selectedService === item.id) return
        state().rewards.selectedService = item.id; save(); renderModal(); renderFloor()
      })
      services.append(card)
    }
    $('reward-track-title').textContent = `${current.name} · ${current.tagline}`
    $('reward-track-intro').textContent = current.description
    const list = $('reward-stages'); list.replaceChildren()
    for (const stage of current.stages) {
      const label = node('label', undefined, 'reward-stage'), check = node('input'), mark = node('span', undefined, 'reward-stage-mark')
      check.type = 'checkbox'; check.checked = track().stages[stage.id]
      check.setAttribute('aria-label', `Etapa ${stage.name}`)
      const copy = node('span', undefined, 'reward-stage-copy')
      const role = stage.roleTag ? `${stage.role} · ${stage.roleTag}` : stage.role
      copy.append(node('strong', `${stage.icon} ${stage.name}`), role ? node('small', role) : node('small', current.name), node('p', stage.text))
      function sync() {
        label.classList.toggle('is-done', check.checked)
        mark.textContent = check.checked ? '✓' : '·'
        renderProgress(); renderFloor()
      }
      check.addEventListener('change', () => { track().stages[stage.id] = check.checked; save(); sync() })
      label.append(check, copy, mark); sync(); list.append(label)
    }
    $('reward-note').value = track().note
    renderProgress()
  }
  function open() { renderModal(); if (!dialog.open) dialog.showModal() }
  for (const id of ['rewards-open', 'rewards-hub-open', 'thread-rewards-04', 'thread-rewards-06']) $(id).addEventListener('click', open)
  $('reward-close').addEventListener('click', () => dialog.close())
  $('reward-close-footer').addEventListener('click', () => dialog.close())
  dialog.addEventListener('click', event => { if (event.target === dialog) dialog.close() })
  $('reward-note').addEventListener('input', () => { track().note = $('reward-note').value; save() })
  return { render() { renderFloor(); if (dialog.open) renderModal() } }
}
