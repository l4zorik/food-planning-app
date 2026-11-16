import { test } from 'node:test'
import assert from 'node:assert/strict'
import { mkdtemp, rm } from 'node:fs/promises'
import { join } from 'node:path'
import { tmpdir } from 'node:os'
import { ensureLifeFocus, lifeFocusProgress, lifeQuestSteps, setupLifeFocus, focusMeanings } from '../desktop/lite/life-focus.js'
import { setupProjectAssistant } from '../desktop/lite/project-assistant.js'
import { setupLifehacks } from '../desktop/lite/lifehacks.js'
import { lifehackCatalog, addLifehackWorkflow } from '../desktop/lite/lifehacks-catalog.js'
import { DataStore, validateState } from '../desktop/store.cjs'
import { problemDocument } from './helpers/problem-dom.mjs'
function initialFocusState() { const value = { cheats: { slots: Array.from({ length: 20 }, () => ({ active: false, problem: null, notes: '', workflows: [] })) } }; addLifehackWorkflow(value.cheats.slots[0], lifehackCatalog[0]); addLifehackWorkflow(value.cheats.slots[1], lifehackCatalog[7]); return value }
function withFocusDocument(callback) { const previous = globalThis.document; globalThis.document = problemDocument(); try { callback(document.getElementById) } finally { globalThis.document = previous } }

test('old multiple active flags migrate to one focus and source checklists stay live', () => {
  const state = initialFocusState(); state.cheats.slots[0].active = true; state.cheats.slots[1].active = true
  const focus = ensureLifeFocus(state)
  assert.equal(focus.quests.length, 1); assert.equal(state.cheats.slots.filter(slot => slot.active).length, 1)
  const step = lifeQuestSteps(state, focus.quests[0])[0]; step.done = true
  assert.equal(state.cheats.slots[0].workflows[0].steps[0].done, true)
  assert.deepEqual(lifeFocusProgress(state), { done: 1, total: 5, percent: 20 })
  ensureLifeFocus(state); assert.equal(focus.quests.length, 1)
})

test('Teď řeším switches one global quest, shows its next step and keeps an independent meaning per quest', () => withFocusDocument($ => {
  const state = initialFocusState(); let focus
  const hacks = setupLifehacks({ getState: () => state, save: () => focus.render(), onFocus: (index, enabled) => focus.setLifeSlot(index, enabled) })
  focus = setupLifeFocus({ getState: () => state, save() {}, onSourceChange: () => hacks.render() }); focus.render(); hacks.render()
  let check = $('lifehack-slots').children[0].querySelector('input'); check.checked = true; check.emit('change')
  assert.equal(state.cheats.slots[0].active, true)
  check = $('lifehack-slots').children[1].querySelector('input'); check.checked = true; check.emit('change')
  assert.equal(state.cheats.slots[0].active, false); assert.equal(state.cheats.slots[1].active, true)
  assert.equal(state.lifeFocus.quests.length, 2)
  const next = $('life-focus-next').querySelector('input'); next.checked = true; next.emit('change')
  assert.equal(state.cheats.slots[1].workflows[0].steps[0].done, true)
  $('focus-meaning-open').emit('click'); assert.equal($('focus-meaning-grid').children.length, 9)
  // Give this quest an extra family tag, leaving the requested default combination intact.
  $('focus-meaning-grid').children[2].emit('click'); $('focus-meaning-apply').emit('click')
  assert.ok($('focus-meaning-title').textContent.includes('Rodina'))
  const selected = state.lifeFocus.activeId
  $('life-focus-select').value = state.lifeFocus.quests[0].id; $('life-focus-select').emit('change')
  assert.ok(!$('focus-meaning-title').textContent.includes('Rodina'))
  $('life-focus-select').value = selected; $('life-focus-select').emit('change')
  assert.ok($('focus-meaning-title').textContent.includes('Rodina'))
  $('life-progress-open').emit('click'); assert.equal($('quest-map-dialog').open, true)
  assert.equal($('quest-map-surface').querySelector('.quest-map-quests').children.length, 2)
  $('quest-map-zoom-in').emit('click'); assert.equal($('quest-map-surface').style.transform, 'scale(1.2)')
  $('life-focus-meaning-filter').value = 'family'; $('life-focus-meaning-filter').emit('change')
  assert.equal($('quest-map-surface').querySelector('.quest-map-quests').children.length, 1)
  assert.equal($('life-focus-select').children.length, 2)
  validateState(state)
}))

test('a custom quest inherits the selected default meaning and progress is computed from real steps', () => withFocusDocument($ => {
  const state = {}; const focus = setupLifeFocus({ getState: () => state, save() {} }); focus.render()
  assert.ok(focusMeanings.some(item => item.id === 'jesus-christ'))
  $('life-focus-new').value = 'Můj životní směr'; $('life-focus-reason').value = 'Vlastní důvod'; $('life-focus-form').emit('submit')
  assert.equal(state.lifeFocus.quests[0].meaning, 'money')
  $('life-progress-open').emit('click')
  const form = $('quest-map-detail').querySelector('.quest-add-step'); form.children[0].value = 'První ověřitelný krok'; form.emit('submit')
  const check = $('quest-map-detail').querySelector('input'); check.checked = true; check.emit('change')
  assert.deepEqual(lifeFocusProgress(state), { done: 1, total: 1, percent: 100 })
  assert.equal(state.lifeFocus.quests[0].steps[0].done, true)
}))

test('AI card stores only model profiles and local prompts without pretending to connect or execute', () => withFocusDocument($ => {
  const state = {}; setupProjectAssistant({ getState: () => state, save() {} }).render()
  $('assistant-profile-name').value = 'Můj lokální profil'; $('assistant-profile-model').value = 'muj-model'; $('assistant-profile-provider').value = 'local'
  $('assistant-model-form').emit('submit')
  assert.equal(state.projectAssistant.profiles.length, 1)
  $('assistant-prompt').value = 'Navrhnout správu modulů'; $('assistant-draft-form').emit('submit')
  assert.equal(state.projectAssistant.drafts.length, 1); assert.equal(state.projectAssistant.drafts[0].profileId, state.projectAssistant.selectedId)
  assert.equal($('assistant-drafts').children[0].textContent, 'Navrhnout správu modulů'); validateState(state)
}))

test('focus, purposes, source checklists and AI drafts survive restart and backup with validated references', async t => {
  const roots = await Promise.all([0, 1].map(() => mkdtemp(join(tmpdir(), 'life-focus-'))))
  t.after(async () => { await Promise.all(roots.map(root => rm(root, { recursive: true, force: true }))) })
  const [first, second] = roots.map(root => new DataStore(root)); await first.init(); await second.init()
  const state = initialFocusState(); state.cheats.slots[0].active = true; ensureLifeFocus(state)
  state.lifeFocus.quests[0].meaning = 'jesus-christ'; state.cheats.slots[0].workflows[0].steps[0].done = true
  state.projectAssistant = { selectedId: null, profiles: [], drafts: [{ id: 'draft', profileId: null, text: 'Budoucí úkol', createdAt: '2026-11-14' }] }
  await first.save(state); assert.deepEqual(await new DataStore(roots[0]).load(), state)
  await second.restore(await first.backup()); assert.deepEqual(await second.load(), state)
  for (const mutate of [value => { value.lifeFocus.activeId = 'missing' }, value => { value.lifeFocus.quests[0].sourceIndex = 21 }, value => { value.lifeFocus.quests[0].meaning = 'unknown' }, value => { value.projectAssistant.selectedId = 'missing' }]) {
    const bad = structuredClone(state); mutate(bad); assert.throws(() => validateState(bad), /Invalid/)
  }
})
