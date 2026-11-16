import { routineWeekdays, dailyMilestones } from './strategy-catalog.js'
import { localDayKey, weekDates, routineScore, milestoneScore } from './routine-model.js'

function routineNode(tag, text, className) {
  const node = document.createElement(tag)
  if (text !== undefined) node.textContent = text
  if (className) node.className = className
  return node
}
export function renderRoutineBoard(container, slot, save, now = () => new Date()) {
  let offset = 0
  function renderBoard() {
    container.replaceChildren()
    if (!slot.schedule) return
    const schedule = slot.schedule, dates = weekDates(now(), offset)
    const toolbar = routineNode('div', undefined, 'routine-week-toolbar')
    const previous = routineNode('button', '←'), next = routineNode('button', '→'), today = routineNode('button', 'Tento týden')
    previous.type = next.type = today.type = 'button'
    previous.setAttribute('aria-label', 'Předchozí týden'); next.setAttribute('aria-label', 'Další týden')
    const display = key => `${Number(key.slice(8, 10))}.${Number(key.slice(5, 7))}.`
    toolbar.append(previous, routineNode('strong', `${display(dates[0])} – ${display(dates[6])} ${dates[6].slice(0, 4)}`), next, today)
    previous.addEventListener('click', () => { offset--; renderBoard() })
    next.addEventListener('click', () => { offset++; renderBoard() })
    today.addEventListener('click', () => { offset = 0; renderBoard() })
    const board = routineNode('div', undefined, 'routine-week-board')
    for (const day of schedule.days) {
      const date = dates[day], column = routineNode('section', undefined, 'routine-day-column')
      if (date === localDayKey(now())) column.classList.add('is-today')
      column.append(routineNode('h6', routineWeekdays[day]), routineNode('small', display(date)))
      const progress = routineNode('p', undefined, 'routine-day-progress')
      const meter = routineNode('progress'); meter.max = schedule.steps.length; meter.setAttribute('aria-label', `Splněné kroky: ${routineWeekdays[day]}`)
      function update() { const score = routineScore(schedule, date); progress.textContent = `${score.done}/${score.total} hotovo`; meter.value = score.done }
      update(); column.append(progress, meter)
      let previousRoutine = ''
      for (const step of schedule.steps) {
        if (step.routine !== previousRoutine) { column.append(routineNode('p', step.routine, 'routine-step-group')); previousRoutine = step.routine }
        const label = routineNode('label', undefined, 'routine-week-task'), checkbox = routineNode('input'), text = routineNode('span', step.text)
        checkbox.type = 'checkbox'; checkbox.checked = schedule.checks[date]?.[step.id] === true
        checkbox.setAttribute('aria-label', `${routineWeekdays[day]} ${display(date)}: ${step.text}`)
        text.classList.toggle('done', checkbox.checked)
        checkbox.addEventListener('change', () => {
          schedule.checks[date] ??= {}; schedule.checks[date][step.id] = checkbox.checked
          text.classList.toggle('done', checkbox.checked); update(); save()
        })
        label.append(checkbox, text); column.append(label)
      }
      board.append(column)
    }
    container.append(routineNode('h5', `Týdenní rutina · ${schedule.days.length} dnů týdně`, 'routine-board-title'), toolbar, board)
  }
  renderBoard()
}

export function renderDailyProgress(container, slot, save, now = () => new Date()) {
  let selectedDate = localDayKey(now())
  function renderDay() {
    container.replaceChildren()
    const toolbar = routineNode('div', undefined, 'daily-progress-toolbar'), title = routineNode('h5', 'Průběh dne')
    const label = routineNode('label', 'Datum '), date = routineNode('input'), today = routineNode('button', 'Dnes')
    date.type = 'date'; date.value = selectedDate; date.setAttribute('aria-label', 'Datum denního checklistu')
    label.append(date); today.type = 'button'
    date.addEventListener('change', () => { if (/^\d{4}-\d{2}-\d{2}$/.test(date.value)) { selectedDate = date.value; renderDay() } })
    today.addEventListener('click', () => { selectedDate = localDayKey(now()); renderDay() })
    const score = routineNode('span', undefined, 'daily-xp'), meter = routineNode('progress')
    meter.max = 5; meter.setAttribute('aria-label', 'Průběh dne: počet splněných bodů')
    function update() {
      const result = milestoneScore(slot.dayProgress?.[selectedDate])
      score.textContent = `${result.done}/5 · klidný domov`; meter.value = result.done
    }
    update(); toolbar.append(title, label, today, score)
    const list = routineNode('div', undefined, 'daily-milestones')
    for (const [key, name, icon] of dailyMilestones) {
      const item = routineNode('label', undefined, 'daily-milestone'), check = routineNode('input')
      check.type = 'checkbox'; check.checked = slot.dayProgress?.[selectedDate]?.[key] === true
      item.classList.toggle('is-complete', check.checked)
      check.addEventListener('change', () => {
        slot.dayProgress ??= {}; slot.dayProgress[selectedDate] ??= {}; slot.dayProgress[selectedDate][key] = check.checked
        item.classList.toggle('is-complete', check.checked); update(); save()
      })
      item.append(check, routineNode('span', icon, 'daily-milestone-icon'), routineNode('strong', name), routineNode('small', '+ klid'))
      list.append(item)
    }
    container.append(toolbar, meter, list)
  }
  renderDay()
}
