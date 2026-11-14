import { test } from 'node:test'
import assert from 'node:assert/strict'
import { mkdtemp, rm } from 'node:fs/promises'
import { join } from 'node:path'
import { tmpdir } from 'node:os'
import { setupModalFavorites } from '../desktop/lite/modal-favorites.js'
import { setupProblemPicker } from '../desktop/lite/problem-picker.js'
import { setupStrategyPicker } from '../desktop/lite/strategy-picker.js'
import { DataStore, validateState } from '../desktop/store.cjs'
import { problemDocument } from './helpers/problem-dom.mjs'

const initialState = () => ({ management: { detox: Array.from({ length: 5 }, () => ({ active: false, problem: '', strategy: '', plan: '', routine: [] })) } })
function usingDocument(callback) {
  const previous = globalThis.document; globalThis.document = problemDocument()
  try { callback(document.getElementById) } finally { globalThis.document = previous }
}

test('problem context menu toggles favorites without selecting, filters correctly and reads restored state', () => usingDocument($ => {
  let state = initialState(), saves = 0, selections = 0
  const favorites = setupModalFavorites({ getState: () => state, save: () => saves++ })
  const ui = setupProblemPicker({ favorites, onSelect: () => selections++ })
  ui.open(0, '', document.createElement('button'))
  const dialog = $('problem-picker'), menu = dialog.querySelector('.modal-favorite-menu')
  $('problem-grid').children[0].emit('contextmenu', { clientX: 100, clientY: 100 })
  assert.equal(menu.hidden, false); assert.match(menu.children[0].textContent, /Označit jako oblíbené/)
  menu.children[0].emit('click')
  assert.equal(menu.hidden, true); assert.equal(dialog.open, true); assert.equal(selections, 0)
  assert.deepEqual(state.management.favorites.problems, ['001']); assert.equal(saves, 1)
  assert.ok($('problem-grid').children[0].querySelector('.modal-favorite-badge'))
  const filter = $('problem-filters').children.at(-1); filter.emit('click')
  assert.equal($('problem-grid').children.length, 1)
  $('problem-grid').children[0].emit('keydown', { key: 'F10', shiftKey: true })
  assert.match(menu.children[0].textContent, /Odebrat z oblíbených/)
  dialog.emit('keydown', { key: 'Escape' })
  assert.equal(menu.hidden, true); assert.equal(dialog.open, true)
  $('problem-grid').children[0].emit('contextmenu'); menu.children[0].emit('click')
  assert.equal($('problem-grid').children.length, 0); assert.equal($('problem-empty').hidden, false)
  assert.equal(document.activeElement, filter); assert.equal(selections, 0)
  state = initialState(); state.management.favorites = { problems: ['002'] }
  ui.open(1, '', document.createElement('button'))
  assert.equal($('problem-grid').children.length, 1); assert.equal($('problem-grid').children[0].dataset.problemId, '002')
}))

test('strategy and routine favorites save immediately without changing the staged strategy or selected templates', () => usingDocument($ => {
  const state = initialState(), results = []; let saves = 0
  const favorites = setupModalFavorites({ getState: () => state, save: () => saves++ })
  const ui = setupStrategyPicker({ favorites, onApply: value => results.push(value) })
  ui.open(0, state.management.detox[0], document.createElement('button'))
  const firstMenu = $('strategy-picker').querySelector('.modal-favorite-menu')
  $('strategy-grid').children[0].emit('contextmenu'); firstMenu.children[0].emit('click')
  assert.equal(results.length, 0); assert.equal(state.management.detox[0].strategy, '')
  $('strategy-filters').children.at(-1).emit('click')
  assert.equal($('strategy-grid').children.length, 1)
  $('strategy-grid').children[0].emit('click')
  const secondMenu = $('routine-picker').querySelector('.modal-favorite-menu')
  $('routine-template-grid').children[0].emit('contextmenu'); secondMenu.children[0].emit('click')
  assert.equal(results.length, 0); assert.equal(saves, 2)
  $('routine-favorites').emit('click')
  assert.equal($('routine-template-grid').children.length, 1)
  assert.equal($('routine-template-grid').children[0].dataset.templateId, 'morning')
  assert.deepEqual(state.management.favorites, { strategies: ['porn-strategy-01'], routines: ['morning'] })
  $('routine-apply').emit('click')
  assert.deepEqual(results[0].templateIds, ['pause'])
  assert.equal(results[0].strategy, 'Telefon mimo ložnici')
}))

test('all favorite libraries survive restart and backup; old data stays valid and malformed favorites are rejected', async t => {
  const roots = await Promise.all([0, 1].map(() => mkdtemp(join(tmpdir(), 'modal-favorites-'))))
  t.after(async () => { await Promise.all(roots.map(root => rm(root, { recursive: true, force: true }))) })
  const first = new DataStore(roots[0]), second = new DataStore(roots[1]); await first.init(); await second.init()
  const state = initialState(); state.management.favorites = { problems: ['001'], strategies: ['porn-strategy-01'], routines: ['morning', 'pause'] }
  await first.save(state); assert.deepEqual(await new DataStore(roots[0]).load(), state)
  await second.restore(await first.backup()); assert.deepEqual(await second.load(), state)
  for (const favorites of [[], null, { other: [] }, { problems: [42] }, { routines: ['pause', 'pause'] }]) {
    const bad = initialState(); bad.management.favorites = favorites; assert.throws(() => validateState(bad), /Invalid modal favorites/)
  }
  assert.doesNotThrow(() => validateState(initialState()))
})
