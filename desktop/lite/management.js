import { setupProblemPicker } from './problem-picker.js'
import { problemCatalog } from './problem-catalog.js'
import { setupStrategyPicker } from './strategy-picker.js'
import { configureRoutine } from './routine-model.js'
import { renderRoutineBoard, renderDailyProgress } from './routine-board.js'
import { routineTemplates } from './strategy-catalog.js'
import { setupModalFavorites } from './modal-favorites.js'

function node(tag, text, className) {
  const result = document.createElement(tag)
  if (text !== undefined) result.textContent = text
  if (className) result.className = className
  return result
}

export function setupManagement({ getState, save }) {
  const container = document.getElementById('detox-slots')
  const favorites = setupModalFavorites({ getState, save })
  const problemPicker = setupProblemPicker({ favorites, onSelect: (index, name) => {
    slots()[index].problem = name; save(); render()
    container.children[index]?.querySelector('.detox-problem-select')?.focus()
  } })
  const strategyPicker = setupStrategyPicker({ favorites, onApply: ({ index, strategy, templateIds, days }) => {
    const slot = slots()[index]
    slot.schedule = configureRoutine(slot.schedule, templateIds, days)
    slot.strategy = strategy
    if (!slot.plan.trim()) slot.plan = routineTemplates.filter(template => templateIds.includes(template.id)).map(template => template.name).join(' + ')
    save(); render()
    container.children[index]?.querySelector('.detox-strategy-select')?.focus()
  } })
  function slots() {
    const state = getState()
    state.management ??= { detox: Array.from({ length: 5 }, () => ({ active: false, problem: '', strategy: '', plan: '', routine: [] })) }
    return state.management.detox
  }
  function render() {
    problemPicker.close()
    strategyPicker.close()
    container.replaceChildren()
    slots().forEach((slot, index) => {
      const card = node('article', undefined, 'detox-slot')
      const slotProblem = problemCatalog.find(item => item.name === slot.problem)
      if (slotProblem?.design) card.dataset.design = slotProblem.design
      card.classList.toggle('is-active', slot.active)
      const heading = node('div', undefined, 'detox-slot-heading')
      const title = node('h4', `Slot ${String(index + 1).padStart(2, '0')}`)
      const activeLabel = node('label', undefined, 'detox-active'), active = node('input')
      active.type = 'checkbox'; active.checked = slot.active
      active.addEventListener('change', () => { slot.active = active.checked; card.classList.toggle('is-active', slot.active); save() })
      activeLabel.append(active, node('span', 'Tímto se chci zabývat'))
      heading.append(title, activeLabel)

      const loop = node('div', undefined, 'detox-loop')
      const problemLabel = node('div', undefined, 'detox-problem-field'), problem = node('button', undefined, 'detox-problem-select')
      problem.type = 'button'; problem.setAttribute('aria-haspopup', 'dialog')
      problem.setAttribute('aria-controls', 'problem-picker')
      problem.setAttribute('aria-label', `Vybrat problém pro slot ${index + 1}: ${slot.problem || 'zatím nevybráno'}`)
      const selectedProblem = problemCatalog.find(item => item.name === slot.problem)
      if (selectedProblem) {
        const image = node('img'); image.src = selectedProblem.image; image.alt = ''; image.width = 64; image.height = 48
        problem.append(image)
      } else { const symbol = node('span', '✳', 'detox-problem-symbol'); symbol.setAttribute('aria-hidden', 'true'); problem.append(symbol) }
      const copy = node('span', undefined, 'detox-problem-copy')
      copy.append(node('strong', slot.problem || 'Vyber, s čím máš problém'), node('small', selectedProblem?.category || (slot.problem ? 'Vlastní téma' : '100 témat · nebo napiš vlastní')))
      problem.append(copy, node('span', '↗', 'detox-problem-arrow'))
      problem.addEventListener('click', () => problemPicker.open(index, slot.problem, problem))
      problemLabel.append(node('span', 'S čím mám problém'), problem)
      const strategyLabel = node('div', undefined, 'detox-problem-field')
      const select = node('button', undefined, 'detox-problem-select detox-strategy-select')
      select.type = 'button'; select.setAttribute('aria-haspopup', 'dialog'); select.setAttribute('aria-controls', 'strategy-picker')
      select.setAttribute('aria-label', `Vybrat strategii pro slot ${index + 1}`)
      const strategyText = node('span', undefined, 'detox-problem-copy')
      strategyText.append(node('strong', slot.strategy || 'Vyber strategii'), node('small', '50 strategií → rutina → dny v týdnu'))
      select.append(node('span', '◈', 'detox-problem-symbol'), strategyText, node('span', '↗', 'detox-problem-arrow'))
      select.addEventListener('click', () => strategyPicker.open(index, slot, select))
      strategyLabel.append(node('span', 'Jakou strategii zvolím'), select)
      const planLabel = node('label', 'Můj konkrétní krok'), plan = node('textarea')
      plan.rows = 2; plan.value = slot.plan; plan.placeholder = 'Co udělám, až se problém objeví?'
      plan.addEventListener('input', () => { slot.plan = plan.value; save() })
      planLabel.append(plan)
      {
        const chooseRoutine = node('button', slot.schedule ? 'Upravit rutiny a dny v týdnu' : 'Vybrat z 15 rutin', 'detox-choose-routine')
        chooseRoutine.type = 'button'; chooseRoutine.setAttribute('aria-haspopup', 'dialog'); chooseRoutine.setAttribute('aria-controls', 'routine-picker')
        chooseRoutine.addEventListener('click', () => strategyPicker.openRoutine(index, slot, chooseRoutine))
        planLabel.append(chooseRoutine)
      }
      loop.append(node('p', 'PROBLÉM → STRATEGIE', 'eyebrow'), problemLabel, strategyLabel, planLabel)

      // The routine belongs to the slot, independently of its problem and strategy.
      const routine = node('section', undefined, 'detox-routine')
      const routineTitle = node('h5', 'Rutina'), count = node('span', undefined, 'detox-progress')
      function progress() { count.textContent = `Vlastní kroky: ${slot.routine.filter(item => item.done).length}/${slot.routine.length} hotovo` }
      progress(); routineTitle.append(count)
      const hint = node('p', 'Samostatný checklist mimo loop problému a strategie.', 'detox-hint')
      const list = node('div')
      function renderItems() {
        list.replaceChildren()
        slot.routine.forEach(item => {
          const row = node('div', undefined, 'detox-task'), label = node('label'), check = node('input'), text = node('span', item.text)
          check.type = 'checkbox'; check.checked = item.done; text.classList.toggle('done', item.done)
          check.addEventListener('change', () => { item.done = check.checked; text.classList.toggle('done', item.done); progress(); save() })
          label.append(check, text)
          const remove = node('button', '×'); remove.type = 'button'; remove.setAttribute('aria-label', `Odstranit krok: ${item.text}`)
          remove.addEventListener('click', () => { slot.routine = slot.routine.filter(task => task !== item); renderItems(); progress(); save() })
          row.append(label, remove); list.append(row)
        })
      }
      renderItems()
      const form = node('form', undefined, 'inline-form'), input = node('input'), add = node('button', 'Přidat krok')
      input.placeholder = 'Nový krok rutiny'; input.required = true; input.setAttribute('aria-label', `Nový krok rutiny ve slotu ${index + 1}`)
      add.type = 'submit'
      form.addEventListener('submit', event => {
        event.preventDefault()
        if (!input.value.trim()) return
        slot.routine.push({ id: crypto.randomUUID(), text: input.value.trim(), done: false })
        input.value = ''; renderItems(); progress(); save(); input.focus()
      })
      form.append(input, add)
      const reset = node('button', 'Odškrtnout rutinu'); reset.type = 'button'; reset.className = 'detox-reset'
      reset.addEventListener('click', () => { slot.routine.forEach(item => { item.done = false }); renderItems(); progress(); save() })
      routine.append(routineTitle, hint, list, form, reset)
      const weekly = node('div', undefined, 'routine-schedule')
      renderRoutineBoard(weekly, slot, save)
      const daily = node('section', undefined, 'daily-progress')
      renderDailyProgress(daily, slot, save)
      routine.append(weekly)
      card.append(heading, loop, routine, daily); container.append(card)
    })
  }
  return { render }
}
