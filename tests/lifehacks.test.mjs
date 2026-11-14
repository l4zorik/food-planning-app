import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFile, mkdtemp, rm } from 'node:fs/promises'
import { join } from 'node:path'
import { tmpdir } from 'node:os'
import { lifehackCatalog, lifehackGroups, filterLifehacks, sharedLifehackTags, parseLifehackTags, addLifehackWorkflow } from '../desktop/lite/lifehacks-catalog.js'
import { setupLifehacks } from '../desktop/lite/lifehacks.js'
import { DataStore, validateState } from '../desktop/store.cjs'
import { problemDocument } from './helpers/problem-dom.mjs'

const lifeSlot = () => ({ active: false, problem: null, notes: '', workflows: [] })
const lifeState = () => ({ cheats: { slots: Array.from({ length: 20 }, lifeSlot) } })
function withLifeDocument(callback) {
  const previous = globalThis.document; globalThis.document = problemDocument()
  try { callback(document.getElementById) } finally { globalThis.document = previous }
}

test('49 situations in seven groups have unique workflows, specific five-step checklists and offline art', async () => {
  assert.equal(lifehackCatalog.length, 49); assert.equal(lifehackGroups.length, 7)
  assert.ok(lifehackGroups.every(group => group.entries.length === 7))
  for (const field of ['id', 'problem', 'purpose']) assert.equal(new Set(lifehackCatalog.map(item => item[field])).size, 49)
  assert.equal(new Set(lifehackCatalog.map(item => item.steps.join('|'))).size, 49)
  await Promise.all(lifehackCatalog.map(item => readFile(new URL(`../desktop/lite/${item.image}`, import.meta.url))))
  for (const item of lifehackCatalog) {
    assert.equal(item.steps.length, 5); assert.ok(item.tags.length >= 3)
    assert.ok(filterLifehacks({ relatedTo: { tags: item.tags }, relatedOnly: true }).some(other => other.id === item.id))
  }
})

test('search combines purpose, problem, category and tags, including accentless common aliases', () => {
  assert.equal(filterLifehacks({ query: 'BEZDOMOVEC' })[0].id, 'life-01')
  assert.equal(filterLifehacks({ problem: 'nemam pritelkyni' })[0].id, 'life-37')
  assert.equal(filterLifehacks({ purpose: 'zivotopis' })[0].id, 'life-10')
  assert.equal(filterLifehacks({ group: 'learning' }).length, 7)
  assert.ok(filterLifehacks({ tag: 'PRACE' }).every(item => item.tags.includes('práce')))
  assert.equal(filterLifehacks({ query: 'bezdomovec', group: 'business' }).length, 0)
  assert.equal(filterLifehacks({ relatedTo: { tags: ['neexistující'] }, relatedOnly: true }).length, 0)
  assert.deepEqual(sharedLifehackTags(['PRACE', 'vzdělání'], ['práce']), ['PRACE'])
  assert.deepEqual(parseLifehackTags('Práce, vzdělání, práce, ,'), ['práce', 'vzdělání'])
})

test('adding workflow creates independent checklist copies, avoids duplicates and preserves an existing problem', () => {
  const first = lifeSlot(), second = lifeSlot(); let id = 0
  assert.equal(addLifehackWorkflow(first, lifehackCatalog[0], () => String(++id)), true)
  addLifehackWorkflow(second, lifehackCatalog[0], () => String(++id))
  first.workflows[0].steps[0].done = true
  assert.equal(second.workflows[0].steps[0].done, false)
  assert.equal(addLifehackWorkflow(first, lifehackCatalog[0]), false)
  assert.equal(first.workflows[0].steps[0].done, true)
  first.notes = 'Vlastní poznámka'
  addLifehackWorkflow(first, lifehackCatalog[7], () => String(++id))
  assert.equal(first.problem.id, 'life-01'); assert.equal(first.workflows.length, 2); assert.equal(first.notes, 'Vlastní poznámka')
})

test('twenty UI slots connect chosen problems to related workflows and preserve checked history on problem changes', () => withLifeDocument($ => {
  const state = lifeState(); let saves = 0
  const ui = setupLifehacks({ getState: () => state, save: () => saves++ }); ui.render()
  assert.equal($('lifehack-slots').children.length, 20)
  let card = $('lifehack-slots').children[5]
  card.querySelector('.life-choose-problem').emit('click')
  assert.equal($('life-problem-grid').children.length, 49)
  $('life-problem-grid').children[0].emit('click')
  assert.equal($('life-workflow-picker').open, true)
  assert.ok($('life-workflow-context').textContent.includes('SLOT 06'))
  assert.equal($('life-related-only').checked, true)
  assert.ok($('life-workflow-grid').children[0].querySelector('.life-match'))
  $('life-workflow-grid').children[0].emit('click')
  card = $('lifehack-slots').children[5]
  const checkbox = card.querySelector('.life-step').children[0]
  checkbox.checked = true; checkbox.emit('change')
  assert.equal(state.cheats.slots[5].workflows[0].steps[0].done, true)
  assert.equal(state.cheats.slots[0].workflows.length, 0)
  card.querySelector('.life-tags').children[0].emit('click')
  assert.equal($('life-workflow-tag').value, 'bydlení'); assert.equal($('life-related-only').checked, false)
  $('life-workflow-close').emit('click')
  card.querySelector('.life-choose-problem').emit('click')
  $('life-custom-name').value = 'Můj vlastní problém'; $('life-custom-tags').value = 'práce, vzdělání'; $('life-custom-form').emit('submit')
  assert.equal(state.cheats.slots[5].problem.name, 'Můj vlastní problém')
  assert.deepEqual(state.cheats.slots[5].problem.tags, ['práce', 'vzdělání'])
  assert.equal(state.cheats.slots[5].workflows[0].steps[0].done, true)
  assert.ok($('life-workflow-grid').children.length > 0)
  assert.ok(saves >= 4)
  state.cheats.slots[0].problem = { id: null, name: 'Další pracovní problém', tags: ['PRÁCE'] }
  ui.render()
  const link = $('lifehack-slots').children[5].querySelector('.life-slot-link')
  assert.ok(link); link.emit('click')
  assert.equal(document.activeElement, $('lifehack-slots').children[0].querySelector('.life-choose-problem'))
}))

test('global library can target slot 20, favorites persist separately and purpose search narrows results', () => withLifeDocument($ => {
  const state = lifeState(); setupLifehacks({ getState: () => state, save() {} }).render()
  $('lifehack-library').emit('click')
  assert.equal($('life-workflow-target').children.length, 20)
  assert.equal($('life-workflow-grid').children.length, 49)
  $('life-workflow-target').value = '19'; $('life-workflow-target').emit('change')
  $('life-workflow-purpose').value = 'životopis'; $('life-workflow-purpose').emit('input')
  assert.equal($('life-workflow-grid').children.length, 1)
  $('life-workflow-grid').children[0].emit('contextmenu')
  const menu = $('life-workflow-picker').querySelector('.modal-favorite-menu'); menu.children[0].emit('click')
  assert.deepEqual(state.cheats.favorites.workflows, ['life-10'])
  assert.equal(state.cheats.slots[19].workflows.length, 0)
  $('life-workflow-favorites').emit('click'); $('life-workflow-grid').children[0].emit('click')
  assert.equal(state.cheats.slots[19].problem.id, 'life-10')
  assert.equal(state.cheats.slots[19].workflows.length, 1)
  assert.equal(state.cheats.slots[0].workflows.length, 0)
}))

test('all 20 slots, tags, custom problems, checklists and favorites survive restart and backup', async t => {
  const roots = await Promise.all([0, 1].map(() => mkdtemp(join(tmpdir(), 'lifehacks-'))))
  t.after(async () => { await Promise.all(roots.map(root => rm(root, { recursive: true, force: true }))) })
  const [first, second] = roots.map(root => new DataStore(root)); await first.init(); await second.init()
  const state = lifeState()
  state.cheats.slots.forEach((slot, index) => { addLifehackWorkflow(slot, lifehackCatalog[index]); slot.workflows[0].steps[0].done = index % 2 === 0 })
  state.cheats.slots[19].problem = { id: null, name: '<Vlastní problém>', tags: ['práce', 'vzdělání'] }
  state.cheats.favorites = { problems: ['life-01'], workflows: ['life-10'] }
  await first.save(state); assert.deepEqual(await new DataStore(roots[0]).load(), state)
  await second.restore(await first.backup()); assert.deepEqual(await second.load(), state)
  assert.doesNotThrow(() => validateState({ meals: { Monday: 'Pasta' } }))
  for (const change of [
    value => value.cheats.slots.pop(), value => { value.cheats.slots[0].problem.tags = ['x', 'x'] },
    value => { value.cheats.slots[0].workflows[0].steps[0].done = 'yes' }, value => { value.cheats.favorites.workflows = [42] },
    value => { value.cheats.slots[0].workflows.push(value.cheats.slots[0].workflows[0]) },
  ]) { const bad = structuredClone(state); change(bad); assert.throws(() => validateState(bad), /Lifehacks/) }
})
