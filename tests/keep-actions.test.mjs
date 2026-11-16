import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import vm from 'node:vm'
import { randomUUID } from 'node:crypto'
import { convertKeep, completeKeep, addKeepTag } from '../desktop/lite/keep-actions.js'

const note = () => ({ id: 'one', title: 'Příprava', content: 'Nakoupit\nUvařit', kind: 'note', createdAt: '2026-11-14' })

test('conversion preserves checklist text, metadata and video attachments in both directions', () => {
  const original = { ...note(), kind: 'video', mediaUrl: `mealmedia://local/${'a'.repeat(64)}.mp4`, pinned: true, tags: ['Jídlo'], group: 'Doma' }
  const checklist = convertKeep(original, 'todo')
  assert.deepEqual(checklist.todos.map(todo => todo.text), ['Nakoupit', 'Uvařit'])
  assert.ok(checklist.todos.every(todo => todo.id && !todo.done))
  checklist.todos[1].text = 'Uvařit polévku'
  const converted = convertKeep(checklist, 'note')
  assert.equal(converted.content, 'Nakoupit\nUvařit polévku')
  assert.equal(converted.mediaKind, 'video')
  assert.equal(converted.mediaUrl, original.mediaUrl)
  assert.deepEqual(converted.tags, ['Jídlo'])
  assert.equal(converted.group, 'Doma')
  assert.equal(converted.pinned, true)
  assert.equal(converted.todos, undefined)
  assert.equal(original.content, 'Nakoupit\nUvařit')
})

test('completion applies to every checklist item and supports legacy checklists', () => {
  const checklist = completeKeep(convertKeep(note(), 'todo'))
  assert.ok(checklist.completed && checklist.todos.every(todo => todo.done))
  assert.ok(completeKeep(checklist).todos.every(todo => !todo.done))
  assert.equal(completeKeep({ ...note(), kind: 'todo' }).todos[0].text, note().content)
  assert.equal(completeKeep(completeKeep(note())).completed, false)
  assert.deepEqual(convertKeep({ ...note(), content: '' }, 'todo').todos, [])
})

test('tags trim whitespace and hash prefixes, reject empty and repeated tags', () => {
  const tagged = addKeepTag(note(), '  #Recepty  ')
  assert.deepEqual(tagged.tags, ['Recepty'])
  assert.equal(addKeepTag(tagged, 'recepty'), tagged)
  assert.equal(addKeepTag(tagged, ' # '), tagged)
  assert.deepEqual(addKeepTag(tagged, 'Večeře').tags, ['Recepty', 'Večeře'])
})

// Exercise the menu and right-button timing without depending on a GUI runtime.
class Node {
  constructor(document) { this.document = document; this.children = []; this.listeners = {}; this.style = {}; this.dataset = {}; this.classList = { add() {}, remove() {}, toggle() {} }; this.hidden = true; this.value = ''; this.open = false; this.offsetWidth = 260; this.offsetHeight = 280; this.isConnected = true }
  addEventListener(type, action) { (this.listeners[type] ||= []).push(action) }
  emit(type, values = {}) { const event = { preventDefault() {}, target: this, clientX: 100, clientY: 100, ...values }; for (const action of this.listeners[type] || []) action(event) }
  append(...nodes) { this.children.push(...nodes) }
  replaceChildren(...nodes) { this.children = nodes }
  setAttribute() {}
  focus() { this.document.activeElement = this }
  showModal() { this.open = true }
  close() { this.open = false }
  contains(node) { return this === node || this.children.includes(node) }
  getBoundingClientRect() { return { left: 50, top: 50 } }
  get childNodes() { return this.children }
  get firstElementChild() { return this.children[0] }
}

test('right-click menu, hold editor, metadata and editor changes update the selected Keep', async () => {
  const nodes = new Map(), timers = new Map()
  const document = new Node(); document.document = document
  document.getElementById = id => { if (!nodes.has(id)) nodes.set(id, new Node(document)); return nodes.get(id) }
  document.createElement = () => new Node(document)
  const window = new Node(document); window.innerWidth = 1024; window.innerHeight = 768
  let keeps = [note()], nextTimer = 0
  const context = vm.createContext({ document, window, crypto: { randomUUID }, Date,
    setTimeout: action => { timers.set(++nextTimer, action); return nextTimer }, clearTimeout: id => timers.delete(id) })
  for (const file of ['keep-style.js', 'keep-actions.js']) {
    const source = (await readFile(new URL(`../desktop/lite/${file}`, import.meta.url), 'utf8')).replace(/^import .*$/gm, '').replaceAll('export function ', 'function ').replaceAll('export const ', 'const ')
    vm.runInContext(source, context)
  }
  const ui = context.setupKeepActions({ getKeeps: () => keeps, update: (id, keep) => { keeps = keeps.map(item => item.id === id ? keep : item) }, removeTag: (id, tag) => { keeps[0].tags = keeps[0].tags.filter(item => item !== tag) } })
  const $ = document.getElementById
  const card = new Node(document); ui.attach(card, keeps[0])
  card.emit('pointerdown', { button: 2 })
  card.emit('contextmenu') // Windows can send this before the button is released.
  assert.equal($('keep-menu').hidden, true)
  document.emit('pointerup', { button: 2 })
  assert.equal($('keep-menu').hidden, false)
  assert.equal($('keep-menu').children.length, 7)
  $('keep-menu').children[0].emit('click')
  assert.equal(keeps[0].pinned, true)
  assert.equal($('keep-menu').hidden, true)
  card.emit('pointerdown', { button: 2 })
  for (const action of timers.values()) action()
  document.emit('pointerup', { button: 2 })
  card.emit('contextmenu')
  assert.equal($('keep-editor').open, true)
  assert.equal($('keep-menu').hidden, true)
  $('keep-edit-title').value = 'Upravený název'; $('keep-edit-title').emit('input')
  $('keep-edit-text').replaceChildren({ nodeType: 3, textContent: 'Nový text' }); $('keep-edit-text').emit('input')
  assert.equal(keeps[0].title, 'Upravený název')
  assert.equal(keeps[0].content, 'Nový text')
  $('keep-font').value = 'Georgia'; $('keep-font').emit('change')
  $('keep-edit-color').value = 'blue'; $('keep-edit-color').emit('change')
  assert.equal(keeps[0].font, 'Georgia')
  assert.equal(keeps[0].color, 'blue')
  $('keep-editor-close').emit('click')
  assert.equal($('keep-editor').open, false)
  // A fresh short gesture must still open the menu after the held gesture.
  card.emit('pointerdown', { button: 2 }); document.emit('pointerup', { button: 2 })
  $('keep-menu').children[3].emit('click')
  $('keep-metadata-value').value = '#Doma'; $('keep-metadata-form').emit('submit')
  assert.deepEqual(Array.from(keeps[0].tags), ['Doma'])
  $('keep-metadata-tags').children[0].emit('click')
  assert.equal(keeps[0].tags.length, 0)
  $('keep-metadata-close').emit('click')
  card.emit('pointerdown', { button: 2 }); document.emit('pointerup', { button: 2 })
  $('keep-menu').children[4].emit('click')
  $('keep-metadata-value').value = 'Projekt'; $('keep-metadata-form').emit('submit')
  assert.equal(keeps[0].group, 'Projekt')
  assert.equal($('keep-metadata').open, false)
  card.emit('pointerdown', { button: 2 }); document.emit('pointerup', { button: 2 })
  $('keep-menu').children[6].emit('click')
  assert.ok($('keep-colors').open)
  $('keep-color-options').children[1].emit('click')
  assert.equal(keeps[0].color, 'yellow')
  assert.ok(!$('keep-colors').open)
  card.emit('pointerdown', { button: 2 }); window.emit('blur')
  assert.equal(timers.size, 0)
  ui.close()
})

test('filtering groups and deleting a visible Keep preserves all other groups', async () => {
  const nodes = new Map(), document = new Node(); document.document = document
  document.getElementById = id => {
    if (!nodes.has(id)) {
      const node = new Node(document)
      node.dataset = {}; node.style.setProperty = () => {}
      node.classList = { add() {}, remove() {}, toggle() {} }
      nodes.set(id, node)
    }
    return nodes.get(id)
  }
  document.createElement = () => { const node = new Node(document); node.dataset = {}; node.classList = { add() {}, remove() {}, toggle() {} }; return node }
  document.querySelectorAll = () => []
  document.querySelector = () => new Node(document)
  document.documentElement = { dataset: {}, style: { setProperty() {} } }
  const initial = [
    { ...note(), id: 'home', group: 'Doma' },
    { ...note(), id: 'work', group: 'Práce' },
    { ...note(), id: 'other' },
  ]
  let saved
  const window = new Node(document)
  window.personalDesktop = { load: async () => ({ state: { keeps: initial }, directory: 'test' }), save: async state => { saved = structuredClone(state) }, onClosing() {}, ready() {} }
  const context = vm.createContext({ document, window, crypto: { randomUUID }, Date, setTimeout, clearTimeout, setInterval() {},
    themeCatalog: { color: [{ id: 'sage' }] }, defaultPreference: { mode: 'color', id: 'sage' }, readPreference: JSON.parse,
    resolveTheme: () => ({ name: 'Sage', id: 'sage' }), themeVariables: () => ({}), setupUpdates: async () => {},
  })
  for (const file of ['keep-style.js', 'keep-actions.js', 'keep-order.js', 'keep-drag.js', 'problem-catalog.js', 'modal-favorites.js', 'problem-picker.js', 'strategy-catalog.js', 'routine-model.js', 'routine-board.js', 'strategy-picker.js', 'management.js', 'lifehacks-catalog.js', 'lifehacks.js', 'perks-catalog.js', 'perks.js', 'life-focus.js', 'project-assistant.js', 'subscriptions.js']) {
    vm.runInContext((await readFile(new URL(`../desktop/lite/${file}`, import.meta.url), 'utf8')).replace(/^import .*$/gm, '').replaceAll('export function ', 'function ').replaceAll('export const ', 'const '), context)
  }
  const app = (await readFile(new URL('../desktop/lite/app.js', import.meta.url), 'utf8')).replace(/^import .*$/gm, '')
  await vm.runInContext(`(async () => { ${app}\n })()`, context)
  const $ = document.getElementById
  assert.equal($('save-status').textContent, 'Uloženo v PC')
  assert.equal($('keep-cards').children.length, 3)
  $('keep-group-filter').value = 'Doma'; $('keep-group-filter').emit('change')
  assert.equal($('keep-cards').children.length, 1)
  assert.equal($('keep-cards').children[0].dataset.keepId, 'home')
  $('keep-cards').children[0].children.find(child => child.className === 'delete').emit('click')
  await new Promise(resolve => setTimeout(resolve, 300))
  assert.deepEqual(saved.keeps.map(keep => keep.id), ['work', 'other'])
  assert.equal($('keep-cards').children.length, 2)
})
