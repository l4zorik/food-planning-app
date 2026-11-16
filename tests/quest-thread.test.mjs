import { test } from 'node:test'
import assert from 'node:assert/strict'
import { seedQuestLog, setupLifeFocus } from '../desktop/lite/life-focus.js'
import { setupRewards } from '../desktop/lite/rewards.js'
import { validateState } from '../desktop/store.cjs'
import { problemDocument } from './helpers/problem-dom.mjs'

function withDocument(callback) {
  const previous = globalThis.document
  globalThis.document = problemDocument()
  try { callback(document.getElementById) } finally { globalThis.document = previous }
}

test('the quest log seed adds the current shifts and project missions exactly once', () => {
  const state = {}
  const focus = seedQuestLog(state)
  assert.equal(focus.seedVersion, 1)
  assert.equal(focus.quests.length, 2)
  const [shifts, missions] = focus.quests
  assert.equal(shifts.title, 'Směny 12h · 16.–22.11.')
  assert.deepEqual(shifts.steps.map(step => step.text), [
    'Noční směna 12h · pondělí 16.11.',
    'Noční směna 12h · úterý 17.11.',
    'Volno · středa 18.11. a čtvrtek 19.11.',
    'Ranní směna 12h · pátek 20.11.',
    'Ranní směna 12h · sobota 21.11.',
    'Ranní směna 12h · neděle 22.11.',
  ])
  assert.equal(missions.title, 'Mise projektu')
  assert.deepEqual(missions.steps.map(step => step.text), ['Vyřídit IČO', 'Business · další mise', 'Scale tržby', 'Maximize profit'])
  assert.equal(focus.activeId, shifts.id)
  seedQuestLog(state)
  assert.equal(focus.quests.length, 2)
  assert.doesNotThrow(() => validateState(structuredClone(state)))
  // Existing quests and an existing active focus are never overwritten.
  const existing = { lifeFocus: { activeId: 'x', quests: [{ id: 'x', title: 'Můj quest', why: '', sourceIndex: null, meaning: 'money', meaningTags: ['money'], steps: [], createdAt: '2026-11-14T10:00:00.000Z' }], defaultMeaning: 'money', defaultMeaningTags: ['money'], purposeVersion: 1 } }
  seedQuestLog(existing)
  assert.equal(existing.lifeFocus.quests[0].title, 'Můj quest')
  assert.equal(existing.lifeFocus.quests.length, 3)
  assert.equal(existing.lifeFocus.activeId, 'x')
  assert.doesNotThrow(() => validateState(structuredClone(existing)))
})

test('04, 06 and 07 share one quest thread and every section supports the quest log', () => withDocument($ => {
  const state = {}
  seedQuestLog(state)
  const ui = setupLifeFocus({ getState: () => state, save() {} })
  ui.render()
  assert.equal($('quest-thread-04-quest').textContent, 'Směny 12h · 16.–22.11. · 0/6 kroků')
  assert.ok($('quest-thread-06-meaning').textContent.includes('Peníze'))
  assert.ok($('quest-thread-07-reward').textContent.includes('Bydlení & investice do nemovitosti · 0 %'))
  for (const section of ['home', 'week', 'shopping', 'keeps', 'erp', 'management', 'cheats']) {
    const box = $(`quest-support-${section}`)
    assert.equal(box.children.length, 3)
    assert.ok(box.children[0].textContent.includes('Směny 12h · 16.–22.11.'))
    assert.ok(box.children[1].textContent.includes('0/6 kroků · nejbližší: Noční směna 12h · pondělí 16.11.'))
    assert.equal(box.children[2].textContent, 'Otevřít quest log ↗')
  }
  // Each corner links to the other two.
  $('thread-meaning-04').emit('click'); assert.equal($('focus-meaning-dialog').open, true); $('focus-meaning-close').emit('click')
  $('thread-quest-06').emit('click'); assert.equal($('quest-map-dialog').open, true); $('quest-map-close').emit('click')
  setupRewards({ getState: () => state, save() {} }).render()
  $('thread-rewards-04').emit('click'); assert.equal($('reward-dialog').open, true); $('reward-close').emit('click')
  $('thread-rewards-06').emit('click'); assert.equal($('reward-dialog').open, true); $('reward-close').emit('click')
  $('thread-quest-07').emit('click'); assert.equal($('quest-map-dialog').open, true); $('quest-map-close').emit('click')
  $('thread-meaning-07').emit('click'); assert.equal($('focus-meaning-dialog').open, true); $('focus-meaning-close').emit('click')
  // The support line follows the checklists and the support button opens the map.
  $('quest-support-week').children[2].emit('click'); assert.equal($('quest-map-dialog').open, true); $('quest-map-close').emit('click')
  state.lifeFocus.quests[0].steps[0].done = true
  ui.render()
  assert.ok($('quest-support-home').children[1].textContent.includes('1/6 kroků · nejbližší: Noční směna 12h · úterý 17.11.'))
  assert.equal($('quest-thread-04-quest').textContent, 'Směny 12h · 16.–22.11. · 1/6 kroků')
}))
