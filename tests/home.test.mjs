import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import vm from 'node:vm'
import { createPerk, perkTemplates, ensureWellbeingPerk } from '../desktop/lite/perks-catalog.js'
import { setupPerks } from '../desktop/lite/perks.js'
import { problemDocument } from './helpers/problem-dom.mjs'

test('wellbeing foundation is added to old collections and reused without overwriting existing notes', () => {
  const collection = { modules: [createPerk(perkTemplates[1])], findings: [] }
  collection.modules[0].documentation = 'Původní dokumentace'
  const base = ensureWellbeingPerk(collection)
  assert.equal(collection.modules.length, 2); assert.equal(collection.modules[0], base)
  base.reflection = 'Moje opora'; base.solution = 'Můj záměr'
  assert.equal(ensureWellbeingPerk(collection), base); assert.equal(collection.modules.length, 2)
  assert.equal(base.reflection, 'Moje opora'); assert.equal(collection.modules[1].documentation, 'Původní dokumentace')
})

test('home and module editor share the same reflection and intention and retain them after restoring state', () => {
  const previous = globalThis.document; globalThis.document = problemDocument()
  try {
    const $ = document.getElementById; let state = {}, saves = 0
    const ui = setupPerks({ getState: () => state, save: () => saves++ }); ui.render()
    $('home-reflection').value = 'Dnes už něco funguje'; $('home-reflection').emit('input')
    $('home-intention').value = 'Nechám prostor odpočinku'; $('home-intention').emit('input')
    $('home-open-base').emit('click')
    assert.equal($('perk-edit-reflection').value, 'Dnes už něco funguje')
    assert.equal($('perk-edit-solution').value, 'Nechám prostor odpočinku')
    $('perk-edit-reflection').value = 'Nový zápis z modulu'; $('perk-edit-reflection').emit('input')
    assert.equal($('home-reflection').value, 'Nový zápis z modulu')
    state = structuredClone(state); ui.render()
    assert.equal($('home-reflection').value, 'Nový zápis z modulu')
    assert.equal(state.perks.modules.filter(module => module.templateId === 'mind').length, 1)
    assert.ok(saves >= 3)
  } finally { globalThis.document = previous }
})

test('actual application starts on wellbeing, opens updates on demand and navigates all project sections', async () => {
  const document = problemDocument(), $ = document.getElementById
  const views = ['home', 'week', 'shopping', 'keeps', 'erp', 'management', 'cheats']
  const buttons = [...views, ...views.slice(1)].map(view => { const button = document.createElement('button'); button.dataset.view = view; return button })
  const welcome = document.createElement('section')
  document.querySelectorAll = selector => selector === '[data-view]' ? buttons : []
  document.querySelector = selector => selector === '.welcome' ? welcome : null
  document.documentElement = { dataset: {}, style: { setProperty() {} } }
  let ready = false
  const window = { addEventListener() {}, personalDesktop: {
    load: async () => ({ state: {}, directory: 'test' }), save: async () => {}, onClosing() {}, ready: async () => { ready = true }, loadBrand: async () => ({ name: 'Test' }),
  } }
  const context = vm.createContext({ document, window, Date, setTimeout, clearTimeout, setInterval() {},
    setupKeepActions: () => ({ close() {} }), setupKeepDrag: () => ({ clear() {} }), setupManagement: () => ({ render() {} }), setupLifehacks: () => ({ render() {} }), setupPerks: () => ({ render() {} }),
    setupLifeFocus: () => ({ render() {} }), setupProjectAssistant: () => ({ render() {} }),
    setupSubscriptions: () => ({ render() {} }),
    themeCatalog: { color: [{ id: 'sage' }] }, defaultPreference: { mode: 'color', id: 'sage', automatic: false }, readPreference: JSON.parse,
    resolveTheme: () => ({ name: 'Sage', id: 'sage' }), themeVariables: () => ({}),
  })
  const updates = (await readFile(new URL('../desktop/lite/updates.js', import.meta.url), 'utf8')).replaceAll('export const ', 'const ').replaceAll('export async function ', 'async function ')
  vm.runInContext(updates, context)
  const app = (await readFile(new URL('../desktop/lite/app.js', import.meta.url), 'utf8')).replace(/^import .*$/gm, '')
  await vm.runInContext(`(async () => { ${app}\n })()`, context)
  assert.equal(ready, true); assert.equal($('home').hidden, false); assert.equal($('week').hidden, true); assert.equal(welcome.hidden, true)
  assert.equal($('updates-dialog').open, false)
  $('open-updates').emit('click'); assert.equal($('updates-dialog').open, true)
  $('close-updates').emit('click'); assert.equal($('updates-dialog').open, false)
  for (const view of views) {
    buttons.find(button => button.dataset.view === view).emit('click')
    for (const panel of views) assert.equal($(panel).hidden, panel !== view)
    for (const button of buttons) assert.equal(button.getAttribute('aria-pressed'), String(button.dataset.view === view))
  }
  buttons[0].emit('click'); assert.equal($('home').hidden, false)
})
