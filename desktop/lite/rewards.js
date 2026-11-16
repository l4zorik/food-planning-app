// Grounding rewards: the bottom floor of the app. Scores are replaced by a calm home.
export const rewardServices = [
  { id: 'housing', number: '01', icon: '🏡', status: 'active', name: 'Bydlení & investice do nemovitosti', tagline: 'Práce → nájem → investiční byt → základ projektu', description: 'Bydlení v bytě a cesta k prvnímu investičnímu bytu. Odměnou je klidný domov.' },
  { id: 'service-02', number: '02', icon: '◽', status: 'planned', name: 'Speciální služba 02', tagline: 'Vybírá tým aplikace', description: 'Službu připravuje tým aplikace. Její postup se objeví na tomto patře.' },
  { id: 'service-03', number: '03', icon: '◽', status: 'planned', name: 'Speciální služba 03', tagline: 'Vybírá tým aplikace', description: 'Službu připravuje tým aplikace. Její postup se objeví na tomto patře.' },
]
export const housingStages = [
  { id: 'work', icon: '💼', name: 'Práce', role: 'Uživatel', roleTag: '', text: 'První příjem, který drží bydlení pohromadě.' },
  { id: 'rent', icon: '🔑', name: 'Nájem', role: 'Nájemník', roleTag: 'crook', text: 'Bydlení v bytě – nájem uživatele.' },
  { id: 'investment', icon: '🏘️', name: 'Investiční byt', role: 'Investor', roleTag: 'mafia boss', text: 'První investiční byt.' },
  { id: 'foundation', icon: '🏠', name: 'Základ projektu', role: 'Majitel nájemních bytů', roleTag: '', text: 'Klidný domov jako základ projektu.' },
]
export function ensureRewards(state) {
  if (!state.rewards || typeof state.rewards !== 'object' || Array.isArray(state.rewards)) state.rewards = {}
  const rewards = state.rewards
  if (typeof rewards.selectedService !== 'string' || !rewardServices.some(service => service.id === rewards.selectedService)) rewards.selectedService = 'housing'
  if (!rewards.tracks || typeof rewards.tracks !== 'object' || Array.isArray(rewards.tracks)) rewards.tracks = {}
  const saved = rewards.tracks.housing
  const track = rewards.tracks.housing = saved && typeof saved === 'object' && !Array.isArray(saved) ? saved : { stages: {}, note: '' }
  if (!track.stages || typeof track.stages !== 'object' || Array.isArray(track.stages)) track.stages = {}
  for (const stage of housingStages) if (typeof track.stages[stage.id] !== 'boolean') track.stages[stage.id] = false
  if (typeof track.note !== 'string') track.note = ''
  return rewards
}
export function rewardProgress(track, stages = housingStages) {
  const done = stages.filter(stage => track?.stages?.[stage.id] === true).length
  return { done, total: stages.length, percent: Math.round(done * 100 / stages.length) }
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
  function track() { return state().rewards.tracks.housing }
  function service() { return rewardServices.find(item => item.id === state().rewards.selectedService) || rewardServices[0] }
  function renderFloor() {
    const current = service(), progress = rewardProgress(track())
    $('rewards-floor-icon').textContent = current.icon
    $('rewards-floor-number').textContent = `SPECIÁLNÍ SLUŽBA ${current.number}`
    $('rewards-floor-name').textContent = current.name
    $('rewards-floor-label').textContent = `${progress.done}/${progress.total} etap · ${progress.percent} %`
    const meter = $('rewards-floor-meter'); meter.max = progress.total || 1; meter.value = progress.done
    const list = $('rewards-floor-stages'); list.replaceChildren()
    for (const stage of housingStages) {
      const done = track().stages[stage.id]
      const item = node('li', undefined, 'reward-floor-stage')
      item.classList.toggle('is-done', done)
      const copy = node('span', undefined, 'reward-stage-copy')
      copy.append(node('strong', stage.name), node('small', stage.roleTag ? `${stage.role} · ${stage.roleTag}` : stage.role))
      item.append(node('span', stage.icon, 'reward-stage-icon'), copy, node('span', done ? '✓' : '·', 'reward-stage-mark'))
      list.append(item)
    }
    $('rewards-hub-summary').textContent = `${current.icon} ${current.name} · ${progress.percent} %`
  }
  function renderProgress() {
    const progress = rewardProgress(track())
    $('reward-progress-label').textContent = `${progress.done}/${progress.total} etap · ${progress.percent} % k prvnímu investičnímu bytu`
    const meter = $('reward-progress-meter'); meter.max = progress.total || 1; meter.value = progress.done
    const banner = $('reward-calm-state')
    banner.hidden = progress.done < progress.total
    if (!banner.hidden) banner.textContent = '🏡 Klidný domov. Základ projektu je položený.'
  }
  function renderModal() {
    const rewards = state().rewards, current = service()
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
    $('reward-track-title').textContent = `${current.name} · cesta k prvnímu investičnímu bytu`
    $('reward-track-intro').textContent = current.tagline
    const list = $('reward-stages'); list.replaceChildren()
    for (const stage of housingStages) {
      const label = node('label', undefined, 'reward-stage'), check = node('input'), mark = node('span', undefined, 'reward-stage-mark')
      check.type = 'checkbox'; check.checked = track().stages[stage.id]
      check.setAttribute('aria-label', `Etapa ${stage.name}`)
      const copy = node('span', undefined, 'reward-stage-copy')
      const role = stage.roleTag ? `${stage.role} · ${stage.roleTag}` : stage.role
      copy.append(node('strong', `${stage.icon} ${stage.name}`), node('small', role), node('p', stage.text))
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
  $('rewards-open').addEventListener('click', open)
  $('rewards-hub-open').addEventListener('click', open)
  $('reward-close').addEventListener('click', () => dialog.close())
  $('reward-close-footer').addEventListener('click', () => dialog.close())
  dialog.addEventListener('click', event => { if (event.target === dialog) dialog.close() })
  $('reward-note').addEventListener('input', () => { track().note = $('reward-note').value; save() })
  return { render() { renderFloor(); if (dialog.open) renderModal() } }
}
