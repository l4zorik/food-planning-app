import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFile, mkdtemp, rm } from 'node:fs/promises'
import { join } from 'node:path'
import { tmpdir } from 'node:os'
import { pornStrategies, routineTemplates, strategyGroups, filterStrategies } from '../desktop/lite/strategy-catalog.js'
import { configureRoutine, weekDates, localDayKey, routineScore, milestoneScore } from '../desktop/lite/routine-model.js'
import { setupStrategyPicker } from '../desktop/lite/strategy-picker.js'
import { renderRoutineBoard, renderDailyProgress } from '../desktop/lite/routine-board.js'
import { setupManagement } from '../desktop/lite/management.js'
import { DataStore, validateState } from '../desktop/store.cjs'
import { problemDocument } from './helpers/problem-dom.mjs'

function withDocument(callback) {
  const previous = globalThis.document
  globalThis.document = problemDocument()
  try { callback(document.getElementById) } finally { globalThis.document = previous }
}
const emptySlot = () => ({ active: true, problem: 'Porno', strategy: '', plan: '', routine: [] })

test('50 distinct strategies, 15 practical routines and their images are available offline', async () => {
  assert.equal(pornStrategies.length, 50); assert.equal(routineTemplates.length, 15); assert.equal(strategyGroups.length, 10)
  for (const list of [pornStrategies, routineTemplates]) {
    assert.equal(new Set(list.map(item => item.id)).size, list.length)
    assert.equal(new Set(list.map(item => item.name)).size, list.length)
    await Promise.all(list.map(item => readFile(new URL(`../desktop/lite/${item.image}`, import.meta.url))))
  }
  assert.ok(routineTemplates.every(item => item.steps.length >= 3 && item.steps.every(text => typeof text === 'string' && text)))
  assert.equal(filterStrategies('TELEFON')[0].name, 'Telefon mimo ložnici')
  assert.equal(filterStrategies('', 'digital').length, 5)
  assert.equal(filterStrategies('nenalezeno').length, 0)
})

test('two dialogs stage changes until confirmation; cancel and back preserve the saved choice', () => withDocument($ => {
  const results = [], ui = setupStrategyPicker({ onApply: value => results.push(value) }), slot = emptySlot()
  const trigger = document.createElement('button')
  ui.open(2, slot, trigger)
  assert.equal($('strategy-grid').children.length, 50)
  $('strategy-grid').children[0].emit('click')
  assert.equal($('strategy-picker').open, false); assert.equal($('routine-picker').open, true)
  assert.equal($('routine-template-grid').children.length, 15); assert.equal(results.length, 0)
  $('routine-back').emit('click')
  assert.equal($('strategy-picker').open, true); assert.equal($('routine-picker').open, false)
  $('strategy-grid').children[1].emit('click'); $('routine-close').emit('click')
  assert.equal(results.length, 0); assert.equal(slot.strategy, '')
  ui.open(2, slot, trigger); $('strategy-grid').children[0].emit('click')
  $('routine-frequency').value = '7'; $('routine-frequency').emit('change')
  $('routine-apply').emit('click')
  assert.equal(results.length, 1); assert.equal(results[0].index, 2)
  assert.equal(results[0].days.length, 7); assert.deepEqual(results[0].templateIds, ['pause'])
  assert.equal(results[0].strategy, 'Telefon mimo ložnici')
  ui.open(0, slot, trigger); $('strategy-picker').emit('cancel')
  assert.equal($('strategy-picker').open, false); assert.equal(results.length, 1)
}))

test('routine selection supports multiple templates and requires at least one template and day', () => withDocument($ => {
  let applied
  const ui = setupStrategyPicker({ onApply: value => { applied = value } })
  ui.openRoutine(0, emptySlot(), document.createElement('button'))
  $('routine-template-grid').children[2].emit('click') // Unselect default pause.
  assert.equal($('routine-apply').disabled, true)
  $('routine-apply').emit('click'); assert.equal(applied, undefined)
  $('routine-template-grid').children[0].emit('click')
  $('routine-template-grid').children[1].emit('click')
  for (const day of [0, 2, 4]) $('routine-days').children[day].emit('click')
  assert.equal($('routine-apply').disabled, true)
  $('routine-days').children[6].emit('click'); $('routine-apply').emit('click')
  assert.deepEqual(applied.templateIds, ['morning', 'evening']); assert.deepEqual(applied.days, [6])
}))

test('weekly configuration preserves dated checks and step edits, including year and daylight-saving boundaries', () => {
  const first = configureRoutine(undefined, ['pause'], [4, 0, 0])
  first.checks['2026-12-28'] = { 'pause-0': true }; first.steps[0].text = 'Vlastní upravený krok'
  const updated = configureRoutine(first, ['pause', 'evening'], [1, 3])
  assert.equal(updated.checks['2026-12-28']['pause-0'], true); assert.equal(updated.steps.find(step => step.id === 'pause-0').text, 'Vlastní upravený krok')
  assert.equal(routineScore(updated, '2026-12-28').done, 1); assert.equal(routineScore(updated, '2027-01-04').done, 0)
  assert.deepEqual(weekDates(new Date(2027, 0, 1)), ['2026-12-28','2026-12-29','2026-12-30','2026-12-31','2027-01-01','2027-01-02','2027-01-03'])
  assert.equal(weekDates(new Date(2026, 2, 29), 1)[0], '2026-03-30')
  assert.equal(localDayKey(new Date(2026, 10, 14, 0, 1)), '2026-11-14')
  assert.throws(() => configureRoutine(undefined, [], [0])); assert.throws(() => configureRoutine(undefined, ['pause'], [])); assert.throws(() => configureRoutine(undefined, ['pause'], [7]))
})

test('weekly columns, date history and daily XP stay independent, without earning points twice', () => withDocument($ => {
  let saves = 0
  const slot = emptySlot(); slot.schedule = configureRoutine(undefined, ['pause'], [0, 4])
  const now = () => new Date(2026, 11, 28, 12), board = document.createElement('div')
  renderRoutineBoard(board, slot, () => saves++, now)
  assert.equal(board.querySelector('.routine-week-board').children.length, 2)
  const check = board.querySelector('.routine-week-task').children[0]
  check.checked = true; check.emit('change')
  assert.equal(slot.schedule.checks['2026-12-28']['pause-0'], true)
  board.querySelector('.routine-week-toolbar').children[2].emit('click')
  assert.equal(board.querySelector('.routine-week-task').children[0].checked, false)
  board.querySelector('.routine-week-toolbar').children[0].emit('click')
  assert.equal(board.querySelector('.routine-week-task').children[0].checked, true)
  const daily = document.createElement('div')
  renderDailyProgress(daily, slot, () => saves++, now)
  for (const item of daily.querySelector('.daily-milestones').children) { item.children[0].checked = true; item.children[0].emit('change'); item.children[0].emit('change') }
  assert.equal(milestoneScore(slot.dayProgress['2026-12-28']).xp, 100)
  const date = daily.querySelector('input'); date.value = '2026-12-29'; date.emit('change')
  assert.ok(daily.querySelector('.daily-milestones').children.every(item => !item.children[0].checked))
  assert.equal(milestoneScore(slot.dayProgress['2026-12-29']).xp, 0)
  assert.equal(slot.schedule.checks['2026-12-28']['pause-0'], true)
  assert.ok(saves > 0)
}))

test('management applies the flow to the intended slot and keeps hand-written routines and notes', () => withDocument($ => {
  const state = { management: { detox: Array.from({ length: 5 }, emptySlot) } }
  state.management.detox[3].plan = 'Moje původní poznámka'
  state.management.detox[3].routine = [{ id: 'manual', text: 'Můj krok', done: true }]
  const ui = setupManagement({ getState: () => state, save() {} }); ui.render()
  $('detox-slots').children[3].querySelector('.detox-strategy-select').emit('click')
  $('strategy-grid').children[0].emit('click'); $('routine-apply').emit('click')
  const slot = state.management.detox[3]
  assert.equal(slot.strategy, 'Telefon mimo ložnici'); assert.equal(slot.schedule.days.length, 3)
  assert.equal(slot.plan, 'Moje původní poznámka'); assert.equal(slot.routine[0].done, true)
  assert.equal(state.management.detox[0].schedule, undefined)
  assert.equal($('detox-slots').children[3].querySelector('.routine-week-board').children.length, 3)
}))

test('all five different slots expose problem, strategy and routine modals and keep plans independent', () => withDocument($ => {
  const names = ['Marihuana', 'Sociální sítě', 'Lust a modelky', 'Přejídání', 'Moje vlastní téma']
  const state = { management: { detox: names.map(problem => ({ ...emptySlot(), problem })) } }
  const ui = setupManagement({ getState: () => state, save() {} }); ui.render()
  for (let index = 0; index < 5; index++) {
    let card = $('detox-slots').children[index]
    card.querySelector('.detox-problem-select').emit('click')
    assert.equal($('problem-picker').open, true); $('problem-close').emit('click')
    card.querySelector('.detox-strategy-select').emit('click')
    assert.equal($('strategy-picker').open, true)
    assert.ok($('strategy-context').textContent.includes(names[index]))
    $('strategy-grid').children[index].emit('click')
    assert.equal($('routine-picker').open, true)
    assert.ok($('routine-context').textContent.includes(`SLOT 0${index + 1}`))
    $('routine-frequency').value = String(index + 1); $('routine-frequency').emit('change')
    $('routine-apply').emit('click')
    assert.equal(state.management.detox[index].schedule.days.length, index + 1)
    assert.equal(state.management.detox[index].problem, names[index])
    for (let previous = 0; previous < index; previous++) assert.equal(state.management.detox[previous].schedule.days.length, previous + 1)
    card = $('detox-slots').children[index]
    card.querySelector('.detox-choose-routine').emit('click')
    assert.equal($('routine-picker').open, true); $('routine-close').emit('click')
    assert.equal(card.querySelector('.routine-week-board').children.length, index + 1)
  }
}))

test('weekly routines and daily progress survive restart and backup, while malformed data is rejected', async t => {
  const roots = await Promise.all([0, 1].map(() => mkdtemp(join(tmpdir(), 'weekly-detox-'))))
  t.after(async () => { await Promise.all(roots.map(root => rm(root, { recursive: true, force: true }))) })
  const [first, second] = roots.map(root => new DataStore(root)); await first.init(); await second.init()
  const state = { management: { detox: Array.from({ length: 5 }, emptySlot) } }, slot = state.management.detox[0]
  slot.strategy = pornStrategies[0].name; slot.schedule = configureRoutine(undefined, ['morning', 'pause'], [0, 2, 6])
  slot.schedule.checks['2026-11-14'] = { 'pause-0': true }; slot.dayProgress = { '2026-11-14': { wake: true, breakfast: false } }
  await first.save(state); assert.deepEqual(await new DataStore(roots[0]).load(), state)
  await second.restore(await first.backup()); assert.deepEqual(await second.load(), state)
  for (const change of [
    value => { value.schedule.days = [7] }, value => { value.schedule.days = [0, 0] }, value => { value.schedule.steps[0].text = 42 },
    value => { value.schedule.checks['2026-02-30'] = {} }, value => { value.dayProgress['2026-11-14'].wake = 'yes' },
    value => { value.dayProgress['2026-11-14'].unknown = true },
  ]) { const bad = structuredClone(state); change(bad.management.detox[0]); assert.throws(() => validateState(bad), /Invalid/) }
  assert.doesNotThrow(() => validateState({ management: { detox: Array.from({ length: 5 }, emptySlot) } }))
})
