import { themeCatalog, defaultPreference, readPreference, resolveTheme, themeVariables } from './themes.js'

const api = window.personalDesktop
const $ = id => document.getElementById(id)
let state = {}, ready = false, showAll = false, attachment = null, saveTimer, pending = Promise.resolve(), revision = 0
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
  for (const panel of ['week','shopping','keeps']) $(panel).hidden = panel !== view
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
function renderKeeps() {
  $('keep-cards').replaceChildren()
  const keeps = state.keeps || []
  $('show-all').textContent = showAll ? 'Všechny Keeps' : 'Posledních 7'
  const visible = showAll ? keeps : keeps.slice(0, 7)
  if (!visible.length) $('keep-cards').append(element('p', 'První nápad si můžeš uložit hned teď.'))
  for (const keep of visible) {
    const card = element('article', undefined, 'keep-card'), remove = element('button', 'Smazat', 'delete')
    remove.setAttribute('aria-label', `Smazat ${keep.title}`)
    remove.addEventListener('click', () => { state.keeps = keeps.filter(k => k.id !== keep.id); queueSave(); renderKeeps() })
    card.append(remove, element('h3', keep.title))
    if (keep.kind === 'todo') {
      const todos = keep.todos || [{ id: keep.id, text: keep.content, done: !!keep.completed }]
      for (const todo of todos) {
        const row = element('label', undefined, 'todo-row'), check = element('input'), text = element('span', todo.text, todo.done ? 'done' : '')
        check.type = 'checkbox'; check.checked = todo.done
        check.addEventListener('change', () => { todo.done = check.checked; keep.todos = todos; keep.completed = todos.every(item => item.done); queueSave(); renderKeeps() })
        row.append(check, text); card.append(row)
      }
    } else card.append(element('p', keep.content))
    if (keep.mediaUrl) {
      const media = element(keep.kind === 'video' ? 'video' : 'img')
      media.src = keep.mediaUrl
      if (keep.kind === 'video') { media.controls = true; media.preload = 'metadata' }
      else media.alt = keep.title
      card.append(media)
    }
    const date = new Date(keep.createdAt)
    card.append(element('small', Number.isFinite(date.getTime()) ? date.toLocaleString('cs-CZ') : keep.createdAt))
    $('keep-cards').append(card)
  }
}

function applyTheme() {
  const preference = readPreference(JSON.stringify(state.theme || defaultPreference))
  const theme = resolveTheme(preference, new Date())
  for (const [key, value] of Object.entries(themeVariables(theme))) document.documentElement.style.setProperty(key, value)
  document.documentElement.style.colorScheme = theme.dark ? 'dark' : 'light'
  $('active-theme').textContent = `${theme.name}${preference.automatic ? ' · automaticky' : ''}`
  $('theme-mode').value = preference.mode
  $('theme-id').replaceChildren(...themeCatalog[preference.mode].map(item => {
    const option = element('option', item.name); option.value = item.id; return option
  }))
  $('theme-id').value = theme.id
  $('theme-auto').checked = preference.automatic
  $('theme-auto').disabled = preference.mode === 'color'
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
$('show-all').addEventListener('click', () => { showAll = !showAll; renderKeeps() })
$('import-media').addEventListener('click', async () => {
  try {
    const imported = await api.importMedia()
    if (imported) { attachment = imported; $('attachment-label').textContent = imported.name; if (!$('keep-title').value) $('keep-title').value = imported.name }
  } catch (e) { error(e.message) }
})
$('theme-mode').addEventListener('change', () => {
  const mode = $('theme-mode').value
  state.theme = { mode, id: themeCatalog[mode][0].id, automatic: mode !== 'color' }
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
    if (await api.importBackup()) { const loaded = await api.load(); state = loaded.state; ready = true; renderAll(); error(''); status('Záloha obnovena') }
  } catch (e) { error(e.message) }
})
$('save-pdf').addEventListener('click', async () => { try { await flush(); await api.savePdf() } catch (e) { error(e.message) } })
for (const button of document.querySelectorAll('[data-view]')) button.addEventListener('click', () => selectView(button.dataset.view))
function renderAll() { renderWeek(); renderShopping(); renderKeeps(); applyTheme() }

if (!api) { error('Tuto aplikaci spusť pomocí Electronu, ne jako běžnou webovou stránku.'); document.querySelectorAll('button,input,textarea,select').forEach(control => control.disabled = true) }
else {
  api.onClosing(async () => { try { if (ready) await flush(); await api.close() } catch (e) { error(e.message); status('Uložení selhalo, okno zůstává otevřené') } })
  try {
    const loaded = await api.load(); state = loaded.state; $('data-directory').textContent = loaded.directory; ready = true; renderAll(); status('Uloženo v PC')
    setInterval(applyTheme, 30000)
    window.addEventListener('focus', applyTheme)
  } catch (e) { error(e.message); status('Data nelze načíst') }
}
