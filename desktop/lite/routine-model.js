import { routineTemplates } from './strategy-catalog.js'

export function localDayKey(date = new Date()) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}
export function weekDates(date = new Date(), offset = 0) {
  const monday = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 12)
  monday.setDate(monday.getDate() - (monday.getDay() + 6) % 7 + offset * 7)
  return Array.from({ length: 7 }, (_, index) => {
    const day = new Date(monday); day.setDate(day.getDate() + index); return localDayKey(day)
  })
}
export function configureRoutine(previous, templateIds, days) {
  const templates = routineTemplates.filter(template => templateIds.includes(template.id))
  const selectedDays = [...new Set(days)].sort((a, b) => a - b)
  if (!templates.length || templates.length !== new Set(templateIds).size || !selectedDays.length || !selectedDays.every(day => Number.isInteger(day) && day >= 0 && day <= 6)) throw Error('Vyber alespoň jednu rutinu a jeden den.')
  const oldSteps = new Map((previous?.steps || []).map(step => [step.id, step]))
  return {
    templateIds: templates.map(template => template.id), days: selectedDays,
    steps: templates.flatMap(template => template.steps.map((text, index) => oldSteps.get(`${template.id}-${index}`) || { id: `${template.id}-${index}`, text, routine: template.name })),
    checks: previous?.checks || {},
  }
}
export function routineScore(schedule, date) {
  const total = schedule.steps.length, done = schedule.steps.filter(step => schedule.checks[date]?.[step.id]).length
  return { done, total }
}
export function milestoneScore(progress = {}) {
  const done = ['wake', 'breakfast', 'lunch', 'dinner', 'sleep'].filter(key => progress[key] === true).length
  return { done, total: 5, xp: done * 20 }
}
