// Quest log, meanings of focus and the thread that ties 04 · 06 · 07 together.
import { ensureRewards, selectedRewardProgress } from './rewards.js'
export const focusCheckpoints = [
  { id: 'start', icon: '🌱', name: 'Začátek cesty', threshold: 0 }, { id: 'direction', icon: '🧭', name: 'Nalezený směr', threshold: 25 },
  { id: 'momentum', icon: '🔥', name: 'Vlastní rytmus', threshold: 50 }, { id: 'summit', icon: '🏔️', name: 'Blízko vrcholu', threshold: 75 }, { id: 'complete', icon: '🏆', name: 'Uzavřený okruh', threshold: 100 },
]
export const focusMeanings = [{ id: 'money', name: 'Peníze', icon: '💰' }, { id: 'love', name: 'Láska', icon: '❤️' }, { id: 'family', name: 'Rodina', icon: '🏡' }, { id: 'friends', name: 'Přátelé', icon: '🤝' }, { id: 'business', name: 'Business', icon: '💼' }, { id: 'health', name: 'Zdraví', icon: '🌿' }, { id: 'jesus-christ', name: 'Ježíš Kristus / Jesus Christ', icon: '✝️' }, { id: 'god', name: 'Bůh', icon: '🙏' }, { id: 'ai', name: 'AI', icon: '🤖' }]
export const defaultFocusMeaningTags = ['money', 'jesus-christ', 'love', 'god', 'ai']
export function questMeaningTags(quest, focus) {
  const tags = quest?.meaningTags?.length ? quest.meaningTags : quest?.meaning ? [quest.meaning] : focus.defaultMeaningTags || defaultFocusMeaningTags
  return [...new Set(tags)].filter(id => focusMeanings.some(meaning => meaning.id === id))
}
export function ensureLifeFocus(state) {
  if (!state.lifeFocus) {
    state.lifeFocus = { activeId: null, quests: [], defaultMeaning: 'money', defaultMeaningTags: [...defaultFocusMeaningTags], purposeVersion: 1 }
    const index = state.cheats?.slots.findIndex(slot => slot.active) ?? -1
    if (index >= 0) {
      const quest = createLifeQuest(state.cheats.slots[index].problem?.name || `Životní fokus ${index + 1}`, '', index)
      state.lifeFocus.quests.push(quest); state.lifeFocus.activeId = quest.id
    }
  }
  const active = state.lifeFocus.quests.find(quest => quest.id === state.lifeFocus.activeId)
  state.lifeFocus.defaultMeaningTags ??= [...defaultFocusMeaningTags]
  if (!state.lifeFocus.purposeVersion) {
    state.lifeFocus.defaultMeaning = 'money'; state.lifeFocus.defaultMeaningTags = [...defaultFocusMeaningTags]; state.lifeFocus.purposeVersion = 1
    if (active) { active.meaning = 'money'; active.meaningTags = [...defaultFocusMeaningTags] }
  }
  for (const quest of state.lifeFocus.quests) { quest.meaningTags = questMeaningTags(quest, state.lifeFocus); quest.meaning = quest.meaningTags[0] || null }
  for (const [index, slot] of (state.cheats?.slots || []).entries()) slot.active = active?.sourceIndex === index
  return state.lifeFocus
}
export function createLifeQuest(title, why = '', sourceIndex = null) { return { id: crypto.randomUUID(), title, why, sourceIndex, meaning: 'money', meaningTags: [...defaultFocusMeaningTags], steps: [], createdAt: new Date().toISOString() } }
// One-time seed of the current priorities: shifts and the project missions.
export function seedQuestLog(state) {
  const focus = ensureLifeFocus(state)
  if (Number.isInteger(focus.seedVersion) && focus.seedVersion >= 1) return focus
  focus.seedVersion = 1
  const addQuest = (title, why, texts) => {
    if (focus.quests.some(quest => quest.title === title)) return null
    const quest = createLifeQuest(title, why)
    quest.steps = texts.map(text => ({ id: crypto.randomUUID(), text, done: false }))
    focus.quests.push(quest)
    return quest
  }
  const shifts = addQuest('Směny 12h · 16.–22.11.', 'Priorita č. 1: směny a volno drží rytmus týdne.', [
    'Noční směna 12h · pondělí 16.11.',
    'Noční směna 12h · úterý 17.11.',
    'Volno · středa 18.11. a čtvrtek 19.11.',
    'Ranní směna 12h · pátek 20.11.',
    'Ranní směna 12h · sobota 21.11.',
    'Ranní směna 12h · neděle 22.11.',
  ])
  addQuest('Mise projektu', 'Priorita č. 2: další mise projektu od IČO po zisk.', [
    'Vyřídit IČO',
    'Business · další mise',
    'Scale tržby',
    'Maximize profit',
  ])
  if (!focus.activeId && shifts) focus.activeId = shifts.id
  return focus
}
export function lifeQuestSteps(state, quest) {
  const source = quest.sourceIndex === null ? [] : (state.cheats?.slots[quest.sourceIndex]?.workflows || []).flatMap(workflow => workflow.steps)
  return [...source, ...quest.steps]
}
export function lifeFocusProgress(state) {
  const quests = ensureLifeFocus(state).quests, steps = quests.flatMap(quest => lifeQuestSteps(state, quest))
  const done = steps.filter(step => step.done).length
  return { done, total: steps.length, percent: steps.length ? Math.round(done * 100 / steps.length) : 0 }
}
function focusNode(tag, text, className) { const node = document.createElement(tag); if (text !== undefined) node.textContent = text; if (className) node.className = className; return node }
export function setupLifeFocus({ getState, save, onSourceChange = () => {} }) {
  const $ = id => document.getElementById(id), dialog = $('quest-map-dialog')
  let zoom = 1, chosenQuest = null, meaningFilter = '', selectedMeaningTags = []
  function state() { const value = getState(); ensureLifeFocus(value); return value }
  function active() { return state().lifeFocus.quests.find(quest => quest.id === state().lifeFocus.activeId) }
  function changed() { save(); onSourceChange(); render(); if (dialog.open) renderMap() }
  function activate(id) { state().lifeFocus.activeId = id || null; ensureLifeFocus(state()); changed() }
  function render() {
    const value = state(), quest = active(), select = $('life-focus-select')
    select.replaceChildren(); const empty = focusNode('option', 'Vybrat jeden životní fokus'); empty.value = ''; select.append(empty)
    for (const item of value.lifeFocus.quests.filter(quest => !meaningFilter || questMeaningTags(quest, value.lifeFocus).includes(meaningFilter))) { const option = focusNode('option', item.title); option.value = item.id; select.append(option) }
    select.value = quest?.id || ''
    $('life-focus-title').textContent = quest?.title || 'Jedna věc, které chci dát směr.'
    $('life-focus-why').textContent = quest?.why || 'Vlastní životní fokus může být vedle práce i podnikání.'
    const meanings = questMeaningTags(quest, value.lifeFocus).map(id => focusMeanings.find(item => item.id === id))
    $('focus-meaning-title').textContent = meanings.map(item => `${item.icon} ${item.name}`).join(' + ')
    $('life-focus-tags').replaceChildren()
    for (const meaning of meanings) { const tag = focusNode('button', `#${meaning.name.split(' / ')[0]}`); tag.type = 'button'; tag.addEventListener('click', () => setMeaningFilter(meaning.id)); $('life-focus-tags').append(tag) }
    $('life-focus-meaning-filter').value = meaningFilter; $('quest-map-meaning-filter').value = meaningFilter
    $('focus-meaning-context').textContent = quest ? `Pro právě aktivní quest: ${quest.title}` : 'Výchozí smysl pro můj příští životní fokus.'
    const next = quest && lifeQuestSteps(value, quest).find(step => !step.done), box = $('life-focus-next'); box.replaceChildren()
    if (next) {
      const label = focusNode('label'), check = focusNode('input'); check.type = 'checkbox'
      check.addEventListener('change', () => { next.done = check.checked; changed() }); label.append(check, focusNode('span', next.text)); box.append(focusNode('small', 'NEJBLIŽŠÍ KROK'), label)
    } else box.append(focusNode('p', quest ? 'Teď můžeš přidat další krok nebo si ponechat prostor.' : 'Vyber „Teď řeším“ u svého problému, nebo založ vlastní quest.'))
    const progress = lifeFocusProgress(value)
    $('life-progress-label').textContent = `${progress.done}/${progress.total} kroků · ${progress.percent} %`
    $('life-progress-meter').max = progress.total || 1; $('life-progress-meter').value = progress.done
    $('life-checkpoints').replaceChildren()
    for (const checkpoint of focusCheckpoints) {
      const button = focusNode('button', checkpoint.icon); button.type = 'button'; button.title = `${checkpoint.name} · ${checkpoint.threshold} %`
      button.setAttribute('aria-label', `Otevřít checkpoint: ${checkpoint.name}`); button.classList.toggle('is-reached', progress.percent >= checkpoint.threshold)
      button.addEventListener('click', () => { openMap(); renderCheckpoint(checkpoint) }); $('life-checkpoints').append(button)
    }
    renderThreads(value, quest)
    renderSupport(value, quest)
  }
  function questProgress(value, quest) {
    if (!quest) return { done: 0, total: 0 }
    const steps = lifeQuestSteps(value, quest)
    return { done: steps.filter(step => step.done).length, total: steps.length }
  }
  function renderThreads(value, quest) {
    const reward = selectedRewardProgress(value), progress = questProgress(value, quest)
    const questText = quest ? `${quest.title} · ${progress.done}/${progress.total} kroků` : 'Zatím žádný aktivní quest'
    const meaningText = questMeaningTags(quest, value.lifeFocus).map(id => focusMeanings.find(item => item.id === id)).filter(Boolean).map(item => `${item.icon} ${item.name}`).join(' + ')
    $('quest-thread-04-quest').textContent = questText
    $('quest-thread-06-meaning').textContent = meaningText
    $('quest-thread-07-reward').textContent = `${reward.service.icon} ${reward.service.name} · ${reward.percent} %`
  }
  function renderSupport(value, quest) {
    const progress = questProgress(value, quest)
    const next = quest && lifeQuestSteps(value, quest).find(step => !step.done)
    for (const section of ['home', 'week', 'shopping', 'keeps', 'erp', 'management', 'cheats']) {
      const box = $(`quest-support-${section}`)
      const title = focusNode('strong', quest ? `🧭 ${quest.title}` : '🧭 Quest log čeká na první quest', 'quest-support-title')
      const detail = focusNode('small', quest ? `${progress.done}/${progress.total} kroků · ${next ? `nejbližší: ${next.text}` : 'všechny kroky hotové'}` : 'Otevři quest log a založ vlastní směr.', 'quest-support-detail')
      const open = focusNode('button', 'Otevřít quest log ↗'); open.type = 'button'
      open.addEventListener('click', openMap)
      box.replaceChildren(title, detail, open)
    }
  }
  function renderCheckpoint(checkpoint) {
    const progress = lifeFocusProgress(state()), panel = $('quest-map-detail'); panel.replaceChildren(focusNode('span', checkpoint.icon, 'quest-detail-icon'), focusNode('h3', checkpoint.name), focusNode('p', `Checkpoint celkového postupu: ${checkpoint.threshold} % kroků questlogu.`), focusNode('p', progress.percent >= checkpoint.threshold ? 'Tato zastávka je podle aktuálních checklistů dostupná.' : `Aktuálně: ${progress.done}/${progress.total} kroků, ${progress.percent} %.`))
  }
  function renderQuestDetail(quest) {
    chosenQuest = quest.id; const panel = $('quest-map-detail'); panel.replaceChildren(focusNode('span', '📜', 'quest-detail-icon'), focusNode('h3', quest.title), focusNode('p', quest.why || 'Můj vlastní životní směr.'))
    const tags = focusNode('div', undefined, 'quest-meaning-tags')
    for (const id of questMeaningTags(quest, state().lifeFocus)) { const meaning = focusMeanings.find(item => item.id === id), tag = focusNode('button', `${meaning.icon} #${meaning.name.split(' / ')[0]}`); tag.type = 'button'; tag.addEventListener('click', () => setMeaningFilter(id)); tags.append(tag) }
    panel.append(tags)
    const choose = focusNode('button', state().lifeFocus.activeId === quest.id ? 'Aktivní životní fokus' : 'Zvolit jako jediný fokus', 'primary'); choose.type = 'button'; choose.addEventListener('click', () => activate(quest.id)); panel.append(choose)
    for (const step of lifeQuestSteps(state(), quest)) {
      const label = focusNode('label', undefined, 'quest-detail-step'), check = focusNode('input'); check.type = 'checkbox'; check.checked = step.done
      check.addEventListener('change', () => { step.done = check.checked; changed() }); label.append(check, focusNode('span', step.text)); panel.append(label)
    }
    const form = focusNode('form', undefined, 'quest-add-step'), input = focusNode('input'), add = focusNode('button', 'Přidat krok')
    input.placeholder = 'Další malý krok…'; input.setAttribute('aria-label', 'Nový krok questu'); input.required = true
    form.addEventListener('submit', event => { event.preventDefault(); if (!input.value.trim()) return; quest.steps.push({ id: crypto.randomUUID(), text: input.value.trim(), done: false }); changed() })
    form.append(input, add); panel.append(form)
  }
  function renderMap() {
    const value = state(), progress = lifeFocusProgress(value), surface = $('quest-map-surface'); surface.replaceChildren()
    $('quest-map-summary').textContent = `Celý questlog: ${progress.done}/${progress.total} kroků · ${progress.percent} %`
    const route = focusNode('div', undefined, 'quest-map-route')
    for (const checkpoint of focusCheckpoints) {
      const button = focusNode('button', undefined, 'quest-checkpoint'); button.type = 'button'; button.classList.toggle('is-reached', progress.percent >= checkpoint.threshold)
      button.append(focusNode('span', checkpoint.icon), focusNode('strong', checkpoint.name), focusNode('small', `${checkpoint.threshold} %`))
      button.addEventListener('click', () => renderCheckpoint(checkpoint)); route.append(button)
    }
    const grid = focusNode('div', undefined, 'quest-map-quests')
    for (const quest of value.lifeFocus.quests.filter(item => !meaningFilter || questMeaningTags(item, value.lifeFocus).includes(meaningFilter))) {
      const steps = lifeQuestSteps(value, quest), done = steps.filter(step => step.done).length
      const button = focusNode('button', undefined, 'quest-map-node'); button.type = 'button'; button.dataset.questId = quest.id
      button.classList.toggle('is-active', value.lifeFocus.activeId === quest.id)
      button.append(focusNode('span', steps.length && done === steps.length ? '🏆' : '📜'), focusNode('strong', quest.title), focusNode('small', `${done}/${steps.length} kroků${value.lifeFocus.activeId === quest.id ? ' · životní fokus' : ''}`))
      button.append(focusNode('small', questMeaningTags(quest, value.lifeFocus).map(id => `#${focusMeanings.find(item => item.id === id).name.split(' / ')[0]}`).join(' '), 'quest-node-tags'))
      button.addEventListener('click', () => renderQuestDetail(quest)); grid.append(button)
    }
    surface.append(route, grid)
    surface.style.transform = `scale(${zoom})`; $('quest-map-stage').style.width = `${1000 * zoom}px`; $('quest-map-stage').style.height = `${(260 + Math.ceil(value.lifeFocus.quests.length / 3) * 160) * zoom}px`
    const visibleQuests = value.lifeFocus.quests.filter(quest => !meaningFilter || questMeaningTags(quest, value.lifeFocus).includes(meaningFilter))
    const detail = visibleQuests.find(quest => quest.id === chosenQuest) || visibleQuests.find(quest => quest.id === value.lifeFocus.activeId) || visibleQuests[0]
    if (detail) renderQuestDetail(detail); else renderCheckpoint(focusCheckpoints[0])
  }
  function openMap() { renderMap(); if (!dialog.open) dialog.showModal() }
  function setMeaningFilter(value) { meaningFilter = value; render(); if (dialog.open) renderMap() }
  for (const id of ['life-focus-meaning-filter', 'quest-map-meaning-filter']) {
    const empty = focusNode('option', 'Všechny smysly'); empty.value = ''; $(id).append(empty)
    for (const meaning of focusMeanings) { const option = focusNode('option', `${meaning.icon} ${meaning.name}`); option.value = meaning.id; $(id).append(option) }
    $(id).addEventListener('change', () => setMeaningFilter($(id).value))
  }
  $('life-focus-select').addEventListener('change', () => activate($('life-focus-select').value))
  function openMeaning() {
    selectedMeaningTags = questMeaningTags(active(), state().lifeFocus)
    $('focus-meaning-apply').disabled = !selectedMeaningTags.length
    const list = $('focus-meaning-grid'); list.replaceChildren()
    for (const meaning of focusMeanings) {
      const button = focusNode('button', undefined, 'focus-meaning-choice'); button.type = 'button'; button.dataset.meaningId = meaning.id
      button.append(focusNode('span', meaning.icon), focusNode('strong', meaning.name))
      button.setAttribute('aria-pressed', String(selectedMeaningTags.includes(meaning.id)))
      button.addEventListener('click', () => {
        selectedMeaningTags = selectedMeaningTags.includes(meaning.id) ? selectedMeaningTags.filter(id => id !== meaning.id) : [...selectedMeaningTags, meaning.id]
        for (const item of list.children) item.setAttribute('aria-pressed', String(selectedMeaningTags.includes(item.dataset.meaningId)))
        $('focus-meaning-apply').disabled = !selectedMeaningTags.length
      })
      list.append(button)
    }
    $('focus-meaning-dialog').showModal()
  }
  $('focus-meaning-open').addEventListener('click', openMeaning)
  for (const id of ['thread-meaning-04', 'thread-meaning-07']) $(id).addEventListener('click', openMeaning)
  for (const id of ['thread-quest-06', 'thread-quest-07']) $(id).addEventListener('click', openMap)
  $('focus-meaning-apply').addEventListener('click', () => {
    if (!selectedMeaningTags.length) return
    const quest = active()
    if (quest) { quest.meaningTags = [...selectedMeaningTags]; quest.meaning = selectedMeaningTags[0] }
    else { state().lifeFocus.defaultMeaningTags = [...selectedMeaningTags]; state().lifeFocus.defaultMeaning = selectedMeaningTags[0] }
    changed(); $('focus-meaning-dialog').close()
  })
  $('focus-meaning-close').addEventListener('click', () => $('focus-meaning-dialog').close())
  $('life-progress-open').addEventListener('click', openMap)
  $('quest-map-close').addEventListener('click', () => dialog.close())
  dialog.addEventListener('click', event => { if (event.target === dialog) dialog.close() })
  $('quest-map-zoom-in').addEventListener('click', () => { zoom = Math.min(1.6, zoom + .2); renderMap() })
  $('quest-map-zoom-out').addEventListener('click', () => { zoom = Math.max(.6, zoom - .2); renderMap() })
  $('quest-map-zoom-reset').addEventListener('click', () => { zoom = 1; renderMap() })
  $('life-focus-form').addEventListener('submit', event => {
    event.preventDefault(); const title = $('life-focus-new').value.trim(); if (!title) return
    const quest = createLifeQuest(title, $('life-focus-reason').value.trim()); quest.meaningTags = [...state().lifeFocus.defaultMeaningTags]; quest.meaning = quest.meaningTags[0]; state().lifeFocus.quests.push(quest); $('life-focus-new').value = ''; $('life-focus-reason').value = ''; activate(quest.id)
  })
  return { render, setLifeSlot(index, enabled) {
    const value = state(); if (!value.cheats?.slots[index]) return
    let quest = value.lifeFocus.quests.find(item => item.sourceIndex === index)
    if (enabled && !quest) { quest = createLifeQuest(value.cheats.slots[index].problem?.name || `Životní fokus ${index + 1}`, value.cheats.slots[index].notes, index); quest.meaningTags = [...value.lifeFocus.defaultMeaningTags]; quest.meaning = quest.meaningTags[0]; value.lifeFocus.quests.push(quest) }
    if (enabled) activate(quest.id)
    else if (value.lifeFocus.activeId === quest?.id) activate(null)
  } }
}
