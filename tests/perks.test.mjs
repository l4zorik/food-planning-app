import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFile, mkdtemp, rm } from 'node:fs/promises'
import { join } from 'node:path'
import { tmpdir } from 'node:os'
import { discoveryMethods, perkTemplates, createPerk, linkPerkFinding, filterPerkCatalog } from '../desktop/lite/perks-catalog.js'
import { setupPerks } from '../desktop/lite/perks.js'
import { DataStore, validateState } from '../desktop/store.cjs'
import { problemDocument } from './helpers/problem-dom.mjs'

function usingPerkDocument(callback) {
  const previous = globalThis.document; globalThis.document = problemDocument()
  try { callback(document.getElementById) } finally { globalThis.document = previous }
}
const finding = (id = 'found-one') => ({ id, name: 'Opakované přepínání úkolů', evidence: 'Tři konkrétní přerušení při práci.', status: 'assumption', methodId: 'day', tags: ['čas'], createdAt: '2026-11-14T12:00:00.000Z' })

test('twelve requested perks and ten discovery methods have offline illustrations and accentless search', async () => {
  assert.deepEqual(perkTemplates.map(item => item.name), ['Psychická pohoda', 'Finanční svoboda', 'Časová svoboda', 'Lokalizační pohoda', 'Politická pohoda', 'Látková pohoda', 'Skill pohoda', 'Finanční síla', 'Tělesná síla', 'Psychická prosperita', 'Duševní prosperita', 'Komunitní prosperita'])
  assert.equal(discoveryMethods.length, 10)
  await Promise.all([...perkTemplates, ...discoveryMethods].map(item => readFile(new URL(`../desktop/lite/${item.image}`, import.meta.url))))
  assert.equal(filterPerkCatalog(perkTemplates, 'CASOVA')[0].id, 'time')
  assert.equal(filterPerkCatalog(discoveryMethods, 'zpetna vazba')[0].id, 'feedback')
})

test('sidebar starts with one psychological wellbeing module and reopening does not duplicate it', () => usingPerkDocument($ => {
  const state = {}; let saves = 0
  const ui = setupPerks({ getState: () => state, save: () => saves++ }); ui.render(); ui.render()
  assert.equal(state.perks.modules.length, 1); assert.equal(state.perks.modules[0].name, 'Psychická pohoda')
  assert.equal($('perk-cards').children.length, 1)
  $('perk-cards').children[0].emit('click'); assert.equal($('perk-editor').open, true)
  assert.equal($('perk-edit-name').value, 'Psychická pohoda')
  $('perk-editor-close').emit('click'); $('perk-add-module').emit('click')
  assert.equal($('perk-module-grid').children.length, 12)
  $('perk-module-close').emit('click'); assert.equal(state.perks.modules.length, 1); assert.equal(saves, 0)
}))

test('discovery → finding → existing module preserves evidence and all editor fields', () => usingPerkDocument($ => {
  const state = {}; let saves = 0
  setupPerks({ getState: () => state, save: () => saves++ }).render()
  $('perk-open-discovery').emit('click'); $('perk-discovery-grid').children[7].emit('click')
  assert.equal($('perk-discovery-picker').open, false); assert.equal($('perk-findings-picker').open, true)
  $('perk-finding-name').value = 'Pozorování'; $('perk-finding-evidence').value = 'Konkrétní situace'
  $('perk-finding-tags').value = 'Klid, čas, klid'; $('perk-finding-connect').emit('click')
  assert.equal(state.perks.findings.length, 1); assert.equal(state.perks.findings[0].methodId, 'experiment')
  assert.deepEqual(state.perks.findings[0].tags, ['klid', 'čas'])
  assert.equal(state.perks.findings[0].status, 'assumption'); assert.equal($('perk-module-picker').open, true)
  $('perk-existing-modules').children[0].emit('click')
  const module = state.perks.modules[0]
  assert.equal(module.findingIds[0], state.perks.findings[0].id); assert.equal(module.problem, 'Pozorování')
  for (const [id, field, value] of [['perk-edit-reflection', 'reflection', 'Co už funguje'], ['perk-edit-solution', 'solution', 'Můj další krok'], ['perk-edit-docs', 'documentation', '# Technický postup\nVstupy → ověření']]) {
    $(id).value = value; $(id).emit('input'); assert.equal(module[field], value)
  }
  $('perk-auto-trigger').value = 'Po dokončení vlastního záznamu'; $('perk-auto-trigger').emit('input')
  assert.equal(module.automation.trigger, 'Po dokončení vlastního záznamu')
  const firstCheck = $('perk-edit-workflow').children[0].children[0]
  firstCheck.checked = true; firstCheck.emit('change'); assert.equal(module.workflow[0].done, true)
  $('perk-new-step').value = 'Vlastní krok'; $('perk-step-form').emit('submit'); assert.equal(module.workflow.at(-1).text, 'Vlastní krok')
  const status = $('perk-linked-findings').children[0].querySelector('select')
  status.value = 'disproved'; status.emit('change'); assert.equal(state.perks.findings[0].status, 'disproved')
  assert.ok(saves >= 8); validateState(state)
}))

test('findings can remain unlinked, be edited and be linked to multiple modules without duplication', () => usingPerkDocument($ => {
  const state = {}; setupPerks({ getState: () => state, save() {} }).render()
  $('perk-open-findings').emit('click'); $('perk-finding-name').value = 'Otevřená otázka'; $('perk-finding-form').emit('submit')
  assert.equal(state.perks.findings.length, 1); assert.equal(state.perks.modules[0].findingIds.length, 0)
  const edit = $('perk-findings-list').children[0].querySelector('.perk-inline-actions').children[0]
  edit.emit('click'); $('perk-finding-status').value = 'parked'; $('perk-finding-form').emit('submit')
  assert.equal(state.perks.findings.length, 1); assert.equal(state.perks.findings[0].status, 'parked')
  const observation = state.perks.findings[0], first = state.perks.modules[0], second = createPerk(perkTemplates[2])
  state.perks.modules.push(second)
  assert.equal(linkPerkFinding(first, observation), true); assert.equal(linkPerkFinding(first, observation), false)
  assert.equal(linkPerkFinding(second, observation), true); assert.equal(first.findingIds.length, 1)
  validateState(state)
}))

test('modules and Skill update records remain open-ended beyond the earlier slot limits', () => usingPerkDocument($ => {
  const state = {}; setupPerks({ getState: () => state, save() {} }).render()
  $('perk-add-module').emit('click'); $('perk-module-grid').children[6].emit('click')
  assert.equal($('perk-issue-heading').textContent, 'Nápady na budoucí aktualizace')
  for (let index = 0; index < 65; index++) { $('perk-new-issue').value = `Budoucí funkce ${index}`; $('perk-issue-form').emit('submit') }
  assert.equal(state.perks.modules[1].issues.length, 65); assert.equal($('perk-issue-list').children.length, 65)
  for (let index = 0; index < 25; index++) {
    $('perk-editor-close').emit('click'); $('perk-add-module').emit('click')
    $('perk-custom-name').value = `Vlastní modul ${index}`; $('perk-custom-form').emit('submit')
  }
  assert.equal(state.perks.modules.length, 27); assert.equal($('perk-cards').children.length, 27)
  assert.equal(state.perks.modules[1].issues[64].title, 'Budoucí funkce 64'); validateState(state)
}))

test('modules, findings, documentation, automation drafts and new issues survive restart and backups', async t => {
  const roots = await Promise.all([0, 1].map(() => mkdtemp(join(tmpdir(), 'perks-'))))
  t.after(async () => { await Promise.all(roots.map(root => rm(root, { recursive: true, force: true }))) })
  const [first, second] = roots.map(root => new DataStore(root)); await first.init(); await second.init()
  const state = { perks: { modules: Array.from({ length: 30 }, (_, index) => createPerk(perkTemplates[index % 7])), findings: [finding()] } }
  const module = state.perks.modules[0]; linkPerkFinding(module, state.perks.findings[0])
  module.documentation = '# Postup\n'.repeat(20000); module.workflow[0].done = true
  module.automation.inputs = 'Vlastní záznam'; module.issues = [{ id: 'issue', title: 'Další poznatek', notes: 'Okolnosti', done: false, createdAt: '2026-11-14' }]
  await first.save(state); assert.deepEqual(await new DataStore(roots[0]).load(), state)
  await second.restore(await first.backup()); assert.deepEqual(await second.load(), state)
  assert.doesNotThrow(() => validateState({ meals: { Monday: 'Pasta' } }))
})

test('malformed perk records are rejected and every collection receives its basic wellbeing module', () => usingPerkDocument($ => {
  const state = { perks: { modules: [createPerk(perkTemplates[0])], findings: [finding()] } }
  for (const change of [
    value => { value.perks.modules[0].findingIds = ['missing'] }, value => { value.perks.findings[0].status = 'unknown' },
    value => { value.perks.modules[0].automation.inputs = 42 }, value => { value.perks.modules[0].workflow[0].done = 'yes' },
    value => { value.perks.modules.push(value.perks.modules[0]) }, value => { value.perks.modules[0].issues = [{ id: 'bad' }] },
  ]) { const bad = structuredClone(state); change(bad); assert.throws(() => validateState(bad), /perk/i) }
  const empty = { perks: { modules: [], findings: [] } }; const ui = setupPerks({ getState: () => empty, save() {} }); ui.render()
  assert.equal($('perk-cards').children.length, 1); assert.equal(empty.perks.modules[0].templateId, 'mind'); assert.doesNotThrow(() => validateState(empty))
}))
