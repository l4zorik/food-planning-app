import { pornStrategies, strategyGroups, routineTemplates, routineWeekdays, filterStrategies } from './strategy-catalog.js'
import { setupFavoriteMenu } from './modal-favorites.js'

function strategyNode(tag, text, className) {
  const node = document.createElement(tag)
  if (text !== undefined) node.textContent = text
  if (className) node.className = className
  return node
}
export function setupStrategyPicker({ onApply, favorites }) {
  const $ = id => document.getElementById(id)
  const first = $('strategy-picker'), second = $('routine-picker')
  let draft = null, stage = null, opener = null, category = ''
  let favoriteStrategies = false, favoriteRoutines = false
  const strategyMenu = setupFavoriteMenu(first, favorites, 'strategies')
  const routineMenu = setupFavoriteMenu(second, favorites, 'routines')
  const strategyFavoriteFilter = strategyNode('button', '★ Oblíbené')
  strategyFavoriteFilter.type = 'button'
  strategyFavoriteFilter.addEventListener('click', () => { favoriteStrategies = !favoriteStrategies; renderStrategies() })
  function close() {
    strategyMenu.close(); routineMenu.close()
    stage = null; draft = null
    if (first.open) first.close()
    if (second.open) second.close()
  }
  function cancel() { close(); if (opener?.isConnected) opener.focus() }
  function illustration(item) {
    const art = strategyNode('span', undefined, 'problem-art'), image = strategyNode('img')
    image.src = item.image; image.alt = ''; image.loading = 'lazy'; image.width = 160; image.height = 112
    art.append(image, strategyNode('span', item.icon, 'problem-icon')); return art
  }
  function renderStrategies() {
    strategyMenu.close()
    const grid = $('strategy-grid'), results = filterStrategies($('strategy-search').value, category).filter(item => !favoriteStrategies || favorites?.has('strategies', item.id))
    grid.replaceChildren()
    for (const item of results) {
      const button = strategyNode('button', undefined, 'problem-tile strategy-tile')
      button.type = 'button'; button.title = item.description; button.dataset.strategyId = item.id
      button.setAttribute('aria-label', `${item.name}. ${item.description}`)
      button.setAttribute('aria-pressed', String(item.name === draft?.strategy))
      button.append(illustration(item), strategyNode('span', item.name, 'problem-name'))
      button.addEventListener('click', () => toRoutine(item.name))
      strategyMenu.attach(button, item.id, () => {
        renderStrategies(); return Array.from(grid.children).find(tile => tile.dataset.strategyId === item.id) || strategyFavoriteFilter
      })
      grid.append(button)
    }
    $('strategy-results').textContent = `${results.length} z 50 strategií`
    $('strategy-empty').hidden = results.length > 0
    $('strategy-empty').textContent = favoriteStrategies ? 'Žádné oblíbené strategie pro tento výběr. Označ kartu pravým kliknutím nebo vypni filtr Oblíbené.' : 'Nic jsme nenašli. Zkus jiné slovo nebo napiš vlastní strategii.'
    for (const button of $('strategy-filters').children) button.setAttribute('aria-pressed', String(button.dataset.category === category))
    strategyFavoriteFilter.setAttribute('aria-pressed', String(favoriteStrategies))
    grid.parentElement.scrollTop = 0
  }
  function renderRoutineSelection() {
    routineMenu.close()
    $('routine-strategy-name').textContent = draft.strategy
    $('routine-template-grid').replaceChildren()
    const visibleTemplates = routineTemplates.filter(item => !favoriteRoutines || favorites?.has('routines', item.id))
    $('routine-favorites').setAttribute('aria-pressed', String(favoriteRoutines))
    $('routine-empty').hidden = visibleTemplates.length > 0
    for (const template of visibleTemplates) {
      const button = strategyNode('button', undefined, 'routine-template')
      button.type = 'button'; button.dataset.templateId = template.id
      button.setAttribute('aria-pressed', String(draft.templates.has(template.id)))
      const copy = strategyNode('span', undefined, 'routine-template-copy')
      copy.append(strategyNode('strong', template.name), strategyNode('small', template.steps.join(' → ')))
      button.append(illustration(template), copy, strategyNode('span', draft.templates.has(template.id) ? '✓' : '+', 'routine-template-check'))
      button.addEventListener('click', () => {
        if (draft.templates.has(template.id)) draft.templates.delete(template.id)
        else draft.templates.add(template.id)
        renderRoutineSelection()
        Array.from($('routine-template-grid').children).find(item => item.dataset.templateId === template.id)?.focus()
      })
      routineMenu.attach(button, template.id, () => {
        renderRoutineSelection(); return Array.from($('routine-template-grid').children).find(tile => tile.dataset.templateId === template.id) || $('routine-favorites')
      })
      $('routine-template-grid').append(button)
    }
    $('routine-days').replaceChildren()
    routineWeekdays.forEach((name, day) => {
      const button = strategyNode('button', name.slice(0, 2), 'routine-day-choice')
      button.type = 'button'; button.setAttribute('aria-label', name); button.setAttribute('aria-pressed', String(draft.days.has(day)))
      button.addEventListener('click', () => {
        if (draft.days.has(day)) draft.days.delete(day); else draft.days.add(day)
        renderRoutineSelection(); $('routine-days').children[day].focus()
      })
      $('routine-days').append(button)
    })
    $('routine-frequency').value = String(draft.days.size)
    const stepCount = routineTemplates.filter(item => draft.templates.has(item.id)).reduce((total, item) => total + item.steps.length, 0)
    $('routine-summary').textContent = `${draft.templates.size} rutin · ${draft.days.size} dnů týdně · ${stepCount * draft.days.size} kroků v týdnu`
    $('routine-apply').disabled = !draft.templates.size || !draft.days.size
  }
  function toRoutine(name) {
    if (!draft || !name.trim()) return
    draft.strategy = name.trim(); stage = 'routine'
    if (first.open) first.close()
    renderRoutineSelection(); second.showModal(); $('routine-back').focus()
  }
  function begin(index, slot, trigger) {
    close(); opener = trigger
    const context = `SLOT ${String(index + 1).padStart(2, '0')} · ${slot.problem || 'Vlastní téma'}`
    $('strategy-context').textContent = context; $('routine-context').textContent = context
    draft = { index, strategy: slot.strategy || '', templates: new Set(slot.schedule?.templateIds || ['pause']), days: new Set(slot.schedule?.days || [0, 2, 4]) }
  }
  for (const [id, name, icon] of [['', 'Všechny', '▦'], ...strategyGroups]) {
    const button = strategyNode('button', `${icon} ${name}`)
    button.type = 'button'; button.dataset.category = id
    button.addEventListener('click', () => { category = id; renderStrategies() })
    $('strategy-filters').append(button)
  }
  if (favorites) $('strategy-filters').append(strategyFavoriteFilter)
  $('routine-favorites').addEventListener('click', () => { favoriteRoutines = !favoriteRoutines; renderRoutineSelection() })
  $('strategy-search').addEventListener('input', renderStrategies)
  $('strategy-custom').addEventListener('submit', event => { event.preventDefault(); toRoutine($('strategy-custom-input').value) })
  $('routine-frequency').addEventListener('change', () => {
    if (!draft) return
    const count = Number($('routine-frequency').value)
    if (!Number.isInteger(count) || count < 1 || count > 7) return
    const days = [...draft.days].sort((a, b) => a - b).slice(0, count)
    for (let day = 0; days.length < count && day < 7; day++) if (!days.includes(day)) days.push(day)
    draft.days = new Set(days); renderRoutineSelection()
  })
  $('routine-back').addEventListener('click', () => {
    if (!draft) return
    stage = 'strategy'; second.close(); renderStrategies(); first.showModal(); $('strategy-search').focus()
  })
  $('routine-apply').addEventListener('click', () => {
    if (!draft || !draft.templates.size || !draft.days.size) return
    const result = { index: draft.index, strategy: draft.strategy, templateIds: [...draft.templates], days: [...draft.days] }
    close(); onApply(result)
  })
  for (const [dialog, name] of [[first, 'strategy'], [second, 'routine']]) {
    dialog.addEventListener('cancel', event => { event.preventDefault(); cancel() })
    dialog.addEventListener('click', event => { if (event.target === dialog) cancel() })
    dialog.addEventListener('close', () => { if (stage === name) cancel() })
  }
  $('strategy-close').addEventListener('click', cancel)
  $('routine-close').addEventListener('click', cancel)
  return {
    open(index, slot, trigger) {
      begin(index, slot, trigger); category = ''; $('strategy-search').value = ''; $('strategy-custom-input').value = ''
      stage = 'strategy'; renderStrategies(); first.showModal(); $('strategy-search').focus()
    },
    openRoutine(index, slot, trigger) { begin(index, slot, trigger); toRoutine(slot.strategy || 'Vlastní strategie') },
    close,
  }
}
