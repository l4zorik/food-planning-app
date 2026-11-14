import { test } from 'node:test'
import assert from 'node:assert/strict'
import { randomUUID } from 'node:crypto'
import { setupManagement } from '../desktop/lite/management.js'
import { problemDocument } from './helpers/problem-dom.mjs'

test('Detox controls preserve routines across problem, strategy and active changes, and rebind after restore', () => {
  const previous = globalThis.document
  globalThis.document = problemDocument()
  const $ = document.getElementById
  try {
    let state = { management: { detox: Array.from({ length: 5 }, () => ({ active: false, problem: '', strategy: 'Nastavit hranici', plan: '', routine: [] })) } }, saves = 0
    const ui = setupManagement({ getState: () => state, save: () => { saves++ } })
    ui.render()
    assert.equal($('detox-slots').children.length, 5)
    let [heading, loop, routine] = $('detox-slots').children[0].children
    const [title, , list, form] = routine.children
    form.children[0].value = 'Ráno bez telefonu'; form.emit('submit')
    const check = list.children[0].children[0].children[0]
    check.checked = true; check.emit('change')
    loop.children[3].children[0].value = 'Můj dřívější plán'; loop.children[3].children[0].emit('input')
    const problem = loop.querySelector('.detox-problem-select')
    problem.emit('click')
    assert.equal($('problem-picker').open, true)
    assert.equal($('problem-grid').children.length, 100)
    $('problem-grid').children[0].emit('click')
    assert.equal(state.management.detox[0].problem, 'Porno')
    assert.equal(state.management.detox[0].strategy, 'Nastavit hranici')
    assert.equal(state.management.detox[0].plan, 'Můj dřívější plán')
    assert.equal($('problem-picker').open, false)
    ;[heading, loop, routine] = $('detox-slots').children[0].children
    assert.equal(document.activeElement, loop.querySelector('.detox-problem-select'))
    const active = heading.children[1].children[0]
    active.checked = true; active.emit('change'); active.checked = false; active.emit('change')
    assert.equal(state.management.detox[0].routine[0].done, true)
    assert.equal(title.children[0].textContent, 'Vlastní kroky: 1/1 hotovo')
    routine.children[4].emit('click'); assert.equal(state.management.detox[0].routine[0].done, false)
    assert.equal(state.management.detox[0].routine[0].text, 'Ráno bez telefonu')
    routine.children[2].children[0].children[1].emit('click'); assert.equal(state.management.detox[0].routine.length, 0)
    state = { management: { detox: Array.from({ length: 5 }, () => ({ active: false, problem: '', strategy: '', plan: '', routine: [{ id: randomUUID(), text: 'Obnovený krok', done: true }] })) } }
    ui.render()
    const restoredRoutine = $('detox-slots').children[0].children[2]
    assert.equal(restoredRoutine.children[2].children[0].children[0].children[0].checked, true)
    restoredRoutine.children[4].emit('click')
    assert.equal(state.management.detox[0].routine[0].done, false)
    assert.equal(state.management.detox[1].routine[0].done, true)
    assert.ok(saves >= 8)
  } finally { globalThis.document = previous }
})
