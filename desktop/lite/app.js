import { themeCatalog, defaultPreference, readPreference, resolveTheme, themeVariables } from './themes.js'
import { setupUpdates } from './updates.js'
import { moveKeep } from './keep-order.js'
import { setupKeepActions } from './keep-actions.js'
import { setupKeepDrag } from './keep-drag.js'
import { applyKeepStyle, renderRichText } from './keep-style.js'
import { setupManagement } from './management.js'
import { setupLifehacks } from './lifehacks.js'
import { setupPerks } from './perks.js'
import { setupLifeFocus } from './life-focus.js'
import { setupProjectAssistant } from './project-assistant.js'
import { setupSubscriptions } from './subscriptions.js'
import { setupRewards } from './rewards.js'

const api = window.personalDesktop
const $ = id => document.getElementById(id)
let state = {}, ready = false, attachment = null, saveTimer, pending = Promise.resolve(), revision = 0
const management = setupManagement({ getState: () => state, save: queueSave })
const lifehacks = setupLifehacks({ getState: () => state, save: () => { queueSave(); lifeFocus.render() }, onFocus: (index, enabled) => lifeFocus.setLifeSlot(index, enabled) })
const perks = setupPerks({ getState: () => state, save: queueSave })
const lifeFocus = setupLifeFocus({ getState: () => state, save: queueSave, onSourceChange: () => lifehacks.render() })
const projectAssistant = setupProjectAssistant({ getState: () => state, save: queueSave, api, flush })
const subscriptions = setupSubscriptions({ getState: () => state, save: queueSave })
const rewards = setupRewards({ getState: () => state, save: queueSave })
const keepActions = setupKeepActions({
  getKeeps: () => state.keeps || [],
  update: (id, replacement) => { state.keeps = (state.keeps || []).map(keep => keep.id === id ? replacement : keep); queueSave(); renderKeeps() },
  removeTag: (id, tag) => { state.keeps = (state.keeps || []).map(keep => keep.id === id ? { ...keep, tags: (keep.tags || []).filter(item => item !== tag) } : keep); queueSave(); renderKeeps() },
})
const keepDrag = setupKeepDrag({ reorder: reorderKeep, canMove: (id, targetId) => {
  const source = (state.keeps || []).find(keep => keep.id === id), target = (state.keeps || []).find(keep => keep.id === targetId)
  return !!source && !!target && !!source.pinned === !!target.pinned
} })
const days = [['Monday','Pondělí'],['Tuesday','Úterý'],['Wednesday','Středa'],['Thursday','Čtvrtek'],['Friday','Pátek'],['Saturday','Sobota'],['Sunday','Neděle']]

function element(tag, text, className) {
  const node = document.createElement(tag)
  if (text !== undefined) node.textContent = text
  if (className) node.className = className
  return node
}
function error(message) { $('error').textContent = message; $('error').hidden = !message }
function status(message) { $('save-status').textContent = message }
function queueSave() {
  if (!ready) return
  status('Ukládám…')
  clearTimeout(saveTimer)
  saveTimer = setTimeout(() => void flush().catch(() => {}), 220)
}
function flush() {
  clearTimeout(saveTimer)
  if (!ready) return Promise.resolve()
  const snapshot = JSON.parse(JSON.stringify(state)), current = ++revision
  const operation = pending.catch(() => {}).then(() => api.save(snapshot))
  pending = operation
  operation.then(() => { if (current === revision) { status('Uloženo v PC'); error('') } }, e => { status('Chyba ukládání'); error(e.message) })
  return operation
}
function selectView(view) {
  const views = ['home','week','shopping','keeps','erp','management','cheats']
  if (!views.includes(view)) view = 'home'
  keepActions.close()
  for (const panel of views) $(panel).hidden = panel !== view
  document.querySelector('.welcome').hidden = ['home', 'erp', 'management', 'cheats'].includes(view)
  for (const button of document.querySelectorAll('[data-view]')) button.setAttribute('aria-pressed', String(button.dataset.view === view))
}

function renderWeek() {
  $('days').replaceChildren()
  for (const [key, name] of days) {
    const row = element('label', undefined, 'day'), label = element('strong', name), input = element('input')
    input.value = state.meals?.[key] || ''
    input.placeholder = 'Co bude dobrého?'
    input.maxLength = 300
    input.addEventListener('input', () => { state.meals = { ...state.meals, [key]: input.value }; queueSave() })
    row.append(label, input); $('days').append(row)
  }
}
function renderShopping() {
  $('shopping-items').replaceChildren()
  const entries = Object.entries(state.ingredients || {})
  $('shopping-count').textContent = `${entries.filter(([, done]) => !done).length} zbývá`
  if (!entries.length) $('shopping-items').append(element('p', 'Prázdný seznam. Přidej první položku.'))
  for (const [name, done] of entries) {
    const row = element('div', undefined, 'shopping-row'), label = element('label', name, done ? 'done' : ''), check = element('input'), remove = element('button', 'Smazat')
    check.type = 'checkbox'; check.checked = done; check.setAttribute('aria-label', `Koupeno: ${name}`)
    check.addEventListener('change', () => { state.ingredients = { ...state.ingredients, [name]: check.checked }; queueSave(); renderShopping() })
    label.addEventListener('click', () => check.click())
    remove.addEventListener('click', () => { delete state.ingredients[name]; queueSave(); renderShopping() })
    row.append(check, label, remove); $('shopping-items').append(row)
  }
}
function clearKeepDrag() { keepDrag.clear() }
function reorderKeep(id, targetId) {
  const source = (state.keeps || []).find(keep => keep.id === id), destination = (state.keeps || []).find(keep => keep.id === targetId)
  if (!source || !destination || !!source.pinned !== !!destination.pinned) return
  const reordered = moveKeep(state.keeps || [], id, targetId)
  if (reordered === state.keeps) return
  state.keeps = reordered
  clearKeepDrag(); queueSave(); renderKeeps()
}
function renderKeeps() {
  clearKeepDrag()
  $('keep-cards').replaceChildren()
  const allKeeps = state.keeps || [], group = $('keep-group-filter').value
  const groups = [...new Set(allKeeps.map(keep => keep.group).filter(Boolean))].sort((a, b) => a.localeCompare(b, 'cs'))
  const allOption = element('option', 'Všechny skupiny'); allOption.value = ''
  $('keep-group-filter').replaceChildren(allOption, ...groups.map(name => { const option = element('option', name); option.value = name; return option }))
  $('keep-group-filter').value = groups.includes(group) ? group : ''
  const keeps = allKeeps.filter(keep => !$('keep-group-filter').value || keep.group === $('keep-group-filter').value).sort((a, b) => Number(!!b.pinned) - Number(!!a.pinned))
  $('keep-count').textContent = `Celkem: ${allKeeps.length}`
  if (!keeps.length) $('keep-cards').append(element('p', 'První nápad si můžeš uložit hned teď.'))
  for (const keep of keeps) {
    const card = element('article', undefined, 'keep-card'), remove = element('button', 'Smazat', 'delete')
    card.dataset.keepId = keep.id
    keepActions.attach(card, keep)
    if (keep.pinned) card.classList.add('is-pinned')
    if (keep.completed) card.classList.add('is-completed')
    keepDrag.attach(card, keep)
    applyKeepStyle(card, keep)
    const grip = element('button', '⠿', 'keep-grip')
    grip.type = 'button'
    grip.title = 'Přetáhni kartu nebo ji přesuň šipkami na klávesnici'
    grip.setAttribute('aria-label', `Přesunout ${keep.title}`)
    grip.setAttribute('aria-describedby', 'keep-order-help')
    grip.addEventListener('keydown', event => {
      const index = keeps.findIndex(item => item.id === keep.id)
      const target = { ArrowLeft: index - 1, ArrowUp: index - 1, ArrowRight: index + 1, ArrowDown: index + 1, Home: 0, End: keeps.length - 1 }[event.key]
      if (target === undefined) return
      event.preventDefault()
      if (!keeps[target] || target === index) return
      reorderKeep(keep.id, keeps[target].id)
      Array.from($('keep-cards').children).find(node => node.dataset.keepId === keep.id)?.querySelector('.keep-grip').focus()
    })
    remove.setAttribute('aria-label', `Smazat ${keep.title}`)
    remove.addEventListener('click', () => { state.keeps = (state.keeps || []).filter(k => k.id !== keep.id); queueSave(); renderKeeps() })
    card.append(remove, grip, element('h3', keep.title))
    const badges = element('div', undefined, 'keep-badges')
    if (keep.pinned) badges.append(element('span', '📌 Připnuto'))
    if (keep.completed) badges.append(element('span', '✓ Hotovo'))
    if (badges.children.length) card.append(badges)
    if (keep.kind === 'todo') {
      const todos = keep.todos || [{ id: keep.id, text: keep.content, done: !!keep.completed }]
      for (const todo of todos) {
        const row = element('label', undefined, 'todo-row'), check = element('input'), text = element('span', todo.text, todo.done ? 'done' : '')
        check.type = 'checkbox'; check.checked = todo.done
        check.addEventListener('change', () => { todo.done = check.checked; keep.todos = todos; keep.richText = undefined; keep.content = todos.map(item => item.text).join('\n'); keep.completed = todos.every(item => item.done); queueSave(); renderKeeps() })
        row.append(check, text); card.append(row)
      }
    } else {
      const text = element('div', undefined, 'keep-rich-content')
      renderRichText(text, keep.richText, keep.content); card.append(text)
    }
    if (keep.mediaUrl) {
      const mediaKind = keep.mediaKind || keep.kind
      const media = element(mediaKind === 'video' ? 'video' : 'img')
      media.src = keep.mediaUrl
      if (mediaKind === 'video') { media.controls = true; media.preload = 'metadata' }
      else media.alt = keep.title
      card.append(media)
    }
    const tags = element('div', undefined, 'keep-tags')
    for (const tag of keep.tags || []) tags.append(element('span', `#${tag}`))
    if (keep.group) tags.append(element('span', `Skupina: ${keep.group}`, 'keep-group'))
    if (tags.children.length) card.append(tags)
    const date = new Date(keep.createdAt)
    card.append(element('small', Number.isFinite(date.getTime()) ? date.toLocaleString('cs-CZ') : keep.createdAt))
    $('keep-cards').append(card)
  }
}
$('keep-group-filter').addEventListener('change', renderKeeps)

function applyTheme() {
  const preference = readPreference(JSON.stringify(state.theme || defaultPreference))
  const theme = resolveTheme(preference, new Date())
  for (const [key, value] of Object.entries(themeVariables(theme))) document.documentElement.style.setProperty(key, value)
  document.documentElement.style.colorScheme = theme.dark ? 'dark' : 'light'
  document.documentElement.dataset.design = theme.design || ''
  document.documentElement.style.setProperty('--design-art', theme.image ? `url("${theme.image}")` : 'none')
  $('theme-design-preview').hidden = !theme.image
  if (theme.image) $('theme-design-art').src = theme.image
  $('theme-design-description').textContent = theme.description || ''
  $('active-theme').textContent = `${theme.name}${preference.automatic ? ' · automaticky' : ''}`
  $('theme-mode').value = preference.mode
  $('theme-id').replaceChildren(...themeCatalog[preference.mode].map(item => {
    const option = element('option', item.name); option.value = item.id; return option
  }))
  $('theme-id').value = theme.id
  $('theme-auto').checked = preference.automatic
  $('theme-auto').disabled = ['color', 'focus'].includes(preference.mode)
}

$('shopping-form').addEventListener('submit', event => {
  event.preventDefault()
  const item = $('shopping-text').value.trim()
  if (!item) return
  state.ingredients = { ...state.ingredients, [item]: false }
  $('shopping-text').value = ''; queueSave(); renderShopping()
})
$('keep-form').addEventListener('submit', event => {
  event.preventDefault()
  const title = $('keep-title').value.trim(), content = $('keep-text').value.trim(), kind = $('keep-kind').value
  if (!title && !content && !attachment) return
  const keep = { id: crypto.randomUUID(), title: title || 'Bez názvu', content, kind: attachment?.kind || kind, createdAt: new Date().toISOString() }
  if (attachment) keep.mediaUrl = attachment.url
  if (kind === 'todo' && !attachment) {
    keep.todos = content.split('\n').map(text => text.trim()).filter(Boolean).map(text => ({ id: crypto.randomUUID(), text, done: false }))
    if (!keep.todos.length) { error('Napiš alespoň jeden úkol.'); return }
    keep.completed = false
  }
  state.keeps = [keep, ...(state.keeps || [])]
  $('keep-title').value = ''; $('keep-text').value = ''; $('attachment-label').textContent = ''; attachment = null
  queueSave(); renderKeeps()
})
$('import-media').addEventListener('click', async () => {
  try {
    const imported = await api.importMedia()
    if (imported) { attachment = imported; $('attachment-label').textContent = imported.name; if (!$('keep-title').value) $('keep-title').value = imported.name }
  } catch (e) { error(e.message) }
})
$('theme-mode').addEventListener('change', () => {
  const mode = $('theme-mode').value
  state.theme = { mode, id: themeCatalog[mode][0].id, automatic: !['color', 'focus'].includes(mode) }
  applyTheme(); queueSave()
})
$('theme-id').addEventListener('change', () => { state.theme = { mode: $('theme-mode').value, id: $('theme-id').value, automatic: false }; applyTheme(); queueSave() })
$('theme-auto').addEventListener('change', () => { state.theme = { mode: $('theme-mode').value, id: $('theme-id').value, automatic: $('theme-auto').checked }; applyTheme(); queueSave() })
$('export-backup').addEventListener('click', async () => {
  try { await flush(); if (await api.exportBackup()) status('Záloha uložena') } catch (e) { error(e.message) }
})
$('restore-backup').addEventListener('click', async () => {
  try {
    if (ready) await flush()
    if (await api.importBackup()) { keepActions.close(); const loaded = await api.load(); state = loaded.state; ready = true; renderAll(); error(''); status('Záloha obnovena') }
  } catch (e) { error(e.message) }
})
$('save-pdf').addEventListener('click', async () => { try { await flush(); await api.savePdf() } catch (e) { error(e.message) } })
for (const button of document.querySelectorAll('[data-view]')) button.addEventListener('click', () => selectView(button.dataset.view))
function renderAll() { renderWeek(); renderShopping(); renderKeeps(); management.render(); perks.render(); lifeFocus.render(); lifehacks.render(); projectAssistant.render(); subscriptions.render(); rewards.render(); applyTheme() }

if (!api) { error('Tuto aplikaci spusť pomocí Electronu, ne jako běžnou webovou stránku.'); document.querySelectorAll('button,input,textarea,select').forEach(control => control.disabled = true) }
else {
  api.onClosing(async () => { try { if (ready) await flush(); await api.close() } catch (e) { error(e.message); status('Uložení selhalo, okno zůstává otevřené') } })
  try {
    const loaded = await api.load(); state = loaded.state; $('data-directory').textContent = loaded.directory; ready = true; renderAll(); selectView('home'); status('Uloženo v PC')
    setInterval(applyTheme, 30000)
    window.addEventListener('focus', applyTheme)
  } catch (e) { error(e.message); status('Data nelze načíst') }
  try { await setupUpdates(api) } catch (e) { error(e.message) }
  await api.ready()
}
