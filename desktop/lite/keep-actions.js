import { keepFonts, keepColors, applyKeepStyle, renderRichText, setupRichEditor } from './keep-style.js'

export function convertKeep(keep, kind) {
  if (keep.kind === kind) return keep
  const mediaKind = keep.mediaKind || (keep.mediaUrl && ['photo', 'video', 'gif'].includes(keep.kind) ? keep.kind : undefined)
  if (kind === 'todo') {
    const todos = keep.content.split('\n').filter(line => line.trim()).map(text => ({ id: crypto.randomUUID(), text, done: !!keep.completed }))
    return { ...keep, kind, mediaKind, todos, completed: todos.length ? todos.every(todo => todo.done) : false }
  }
  const result = { ...keep, kind: 'note', mediaKind, content: keep.todos ? keep.todos.map(todo => todo.text).join('\n') : keep.content }
  delete result.todos
  if (result.content !== keep.content) delete result.richText
  return result
}

export function completeKeep(keep) {
  const completed = !keep.completed
  return { ...keep, completed, ...(keep.kind === 'todo' ? { todos: (keep.todos || [{ id: keep.id, text: keep.content }]).map(todo => ({ ...todo, done: completed })) } : {}) }
}

export function addKeepTag(keep, value) {
  const tag = value.trim().replace(/^#+/, '').trim()
  if (!tag || (keep.tags || []).some(item => item.toLocaleLowerCase() === tag.toLocaleLowerCase())) return keep
  return { ...keep, tags: [...(keep.tags || []), tag] }
}

export function setupKeepActions({ getKeeps, update, removeTag }) {
  const $ = id => document.getElementById(id)
  const menu = $('keep-menu'), editor = $('keep-editor'), metadata = $('keep-metadata')
  let activeId, editingId, metadataKind, gesture, timer, suppressUntil = 0, menuAnchor
  const richEditor = setupRichEditor($('keep-edit-text'), $('keep-format-toolbar'), patch => {
    const keep = current(editingId)
    if (keep) update(editingId, { ...keep, ...patch })
  })
  for (const name of keepFonts) {
    const option = document.createElement('option'); option.value = name; option.textContent = name; option.style.fontFamily = name; $('keep-font').append(option)
  }
  for (const [value, label] of keepColors) {
    const option = document.createElement('option'); option.value = value; option.textContent = label; $('keep-edit-color').append(option)
  }
  const current = id => getKeeps().find(keep => keep.id === id)
  const button = (text, action) => {
    const node = document.createElement('button')
    node.type = 'button'; node.textContent = text; node.addEventListener('click', action)
    return node
  }
  function closeMenu(restoreFocus = false) {
    menu.hidden = true
    if (restoreFocus && menuAnchor?.isConnected) menuAnchor.focus()
  }
  function cancelGesture() { clearTimeout(timer); gesture = null }
  function openEditor(id) {
    if (!current(id)) return
    closeMenu(); editingId = id; renderEditor()
    if (!editor.open) editor.showModal()
    $('keep-edit-title').focus()
  }
  function renderEditor() {
    const keep = current(editingId)
    if (!keep) { editor.close(); return }
    $('keep-edit-title').value = keep.title
    $('keep-edit-kind').value = keep.kind === 'todo' ? 'todo' : 'note'
    richEditor.reset()
    renderRichText($('keep-edit-text'), keep.richText, keep.content)
    applyKeepStyle(editor, keep)
    $('keep-font').value = keep.font || ''
    $('keep-edit-color').value = keep.color || 'default'
    $('keep-format-toolbar').hidden = keep.kind === 'todo'
    $('keep-edit-text-label').hidden = keep.kind === 'todo'
    $('keep-edit-todos').hidden = keep.kind !== 'todo'
    $('keep-add-todo').hidden = keep.kind !== 'todo'
    $('keep-edit-todos').replaceChildren()
    for (const todo of keep.todos || (keep.kind === 'todo' ? [{ id: keep.id, text: keep.content, done: !!keep.completed }] : [])) {
      const row = document.createElement('div'), check = document.createElement('input'), text = document.createElement('input')
      row.className = 'keep-edit-todo'; check.type = 'checkbox'; check.checked = todo.done
      check.setAttribute('aria-label', 'Úkol hotový'); text.value = todo.text; text.setAttribute('aria-label', 'Text úkolu')
      const changeTodo = patch => {
        const latest = current(editingId)
        const todos = (latest.todos || [todo]).map(item => item.id === todo.id ? { ...item, ...patch } : item)
        update(editingId, { ...latest, todos, richText: undefined, content: todos.map(item => item.text).join('\n'), completed: todos.length > 0 && todos.every(item => item.done) })
      }
      check.addEventListener('change', () => changeTodo({ done: check.checked }))
      text.addEventListener('input', () => changeTodo({ text: text.value }))
      row.append(check, text, button('Odebrat úkol', () => {
        const latest = current(editingId), todos = (latest.todos || [todo]).filter(item => item.id !== todo.id)
        update(editingId, { ...latest, todos, richText: undefined, content: todos.map(item => item.text).join('\n'), completed: todos.length > 0 && todos.every(item => item.done) }); renderEditor()
      }))
      $('keep-edit-todos').append(row)
    }
    $('keep-edit-media').replaceChildren()
    if (keep.mediaUrl) {
      const media = document.createElement((keep.mediaKind || keep.kind) === 'video' ? 'video' : 'img')
      media.src = keep.mediaUrl; media.alt = keep.title; media.controls = true
      $('keep-edit-media').append(media)
    }
  }
  $('keep-edit-title').addEventListener('input', event => update(editingId, { ...current(editingId), title: event.target.value }))
  $('keep-font').addEventListener('change', event => { const keep = { ...current(editingId), font: event.target.value }; update(editingId, keep); applyKeepStyle(editor, keep) })
  $('keep-edit-color').addEventListener('change', event => { const keep = { ...current(editingId), color: event.target.value }; update(editingId, keep); applyKeepStyle(editor, keep) })
  $('keep-edit-kind').addEventListener('change', event => { update(editingId, convertKeep(current(editingId), event.target.value)); renderEditor() })
  $('keep-add-todo').addEventListener('click', () => {
    const keep = current(editingId)
    update(editingId, { ...keep, completed: false, todos: [...(keep.todos || [{ id: keep.id, text: keep.content, done: !!keep.completed }]), { id: crypto.randomUUID(), text: '', done: false }] }); renderEditor()
    $('keep-edit-todos').lastElementChild?.querySelector('input[type="text"],input:not([type])')?.focus()
  })
  $('keep-editor-close').addEventListener('click', () => editor.close())
  function openMetadata(id, kind) {
    activeId = id; metadataKind = kind; closeMenu()
    $('keep-metadata-title').textContent = kind === 'tag' ? 'Tagy poznámky' : 'Skupina poznámky'
    $('keep-metadata-label').textContent = kind === 'tag' ? 'Přidat tag' : 'Název skupiny (prázdné = bez skupiny)'
    $('keep-metadata-value').value = kind === 'group' ? current(id).group || '' : ''
    $('keep-metadata-options').replaceChildren()
    const values = new Set(getKeeps().flatMap(keep => kind === 'tag' ? keep.tags || [] : keep.group ? [keep.group] : []))
    for (const value of values) {
      const option = document.createElement('option'); option.value = value; $('keep-metadata-options').append(option)
    }
    renderTags(); metadata.showModal(); $('keep-metadata-value').focus()
  }
  function renderTags() {
    $('keep-metadata-tags').replaceChildren()
    if (metadataKind !== 'tag') return
    for (const tag of current(activeId)?.tags || []) $('keep-metadata-tags').append(button(`#${tag} ×`, () => { removeTag(activeId, tag); renderTags() }))
  }
  $('keep-metadata-form').addEventListener('submit', event => {
    event.preventDefault()
    const keep = current(activeId), value = $('keep-metadata-value').value
    if (!keep) { metadata.close(); return }
    update(activeId, metadataKind === 'tag' ? addKeepTag(keep, value) : { ...keep, group: value.trim() })
    if (metadataKind === 'tag') { $('keep-metadata-value').value = ''; renderTags(); $('keep-metadata-value').focus() }
    else metadata.close()
  })
  $('keep-metadata-close').addEventListener('click', () => metadata.close())
  function openColors(id) {
    activeId = id; closeMenu(); $('keep-color-options').replaceChildren()
    for (const [value, label, color] of keepColors) {
      const choice = button(label, () => { update(id, { ...current(id), color: value }); $('keep-colors').close() })
      choice.style.backgroundColor = color || ''; choice.style.color = color ? '#171717' : ''
      choice.setAttribute('aria-pressed', String((current(id).color || 'default') === value))
      $('keep-color-options').append(choice)
    }
    $('keep-colors').showModal()
  }
  $('keep-colors-close').addEventListener('click', () => $('keep-colors').close())
  function openMenu(id, x, y, anchor) {
    const keep = current(id)
    if (!keep) return
    closeMenu(); menuAnchor = anchor; menu.replaceChildren()
    const action = (label, callback) => {
      const item = button(label, () => { closeMenu(); callback() }); item.setAttribute('role', 'menuitem'); menu.append(item)
    }
    action(keep.pinned ? 'Pin · Odepnout' : 'Pin · Připnout', () => update(id, { ...current(id), pinned: !current(id).pinned }))
    action(keep.completed ? 'Check · Označit jako nehotové' : 'Check · Označit jako hotové', () => update(id, completeKeep(current(id))))
    action(keep.kind === 'todo' ? 'Convert → Zápis' : 'Convert → Checklist', () => update(id, convertKeep(current(id), keep.kind === 'todo' ? 'note' : 'todo')))
    action('Tag · Přidat / upravit tagy', () => openMetadata(id, 'tag'))
    action('Group · Přidat do skupiny', () => openMetadata(id, 'group'))
    action('Otevřít zvětšený zápis', () => openEditor(id))
    action('Barva · Změnit barvu Keepu', () => openColors(id))
    menu.hidden = false
    menu.style.left = `${Math.max(8, Math.min(x, window.innerWidth - menu.offsetWidth - 8))}px`
    menu.style.top = `${Math.max(8, Math.min(y, window.innerHeight - menu.offsetHeight - 8))}px`
    menu.firstElementChild.focus()
  }
  menu.addEventListener('keydown', event => {
    const items = [...menu.children], index = items.indexOf(document.activeElement)
    if (event.key === 'Escape') { event.preventDefault(); closeMenu(true) }
    else if (['ArrowDown', 'ArrowUp', 'Home', 'End'].includes(event.key)) {
      event.preventDefault()
      const next = event.key === 'Home' ? 0 : event.key === 'End' ? items.length - 1 : (index + (event.key === 'ArrowDown' ? 1 : -1) + items.length) % items.length
      items[next].focus()
    }
  })
  document.addEventListener('pointerdown', event => { if (!menu.contains(event.target)) closeMenu() })
  document.addEventListener('pointermove', event => {
    if (gesture && Math.hypot(event.clientX - gesture.x, event.clientY - gesture.y) > 8) { suppressUntil = Date.now() + 800; cancelGesture() }
  })
  document.addEventListener('pointerup', event => {
    if (event.button !== 2 || !gesture) return
    const pending = gesture; cancelGesture(); suppressUntil = Date.now() + 800
    if (!pending.expanded) openMenu(pending.id, event.clientX, event.clientY, pending.card)
  })
  document.addEventListener('pointercancel', cancelGesture)
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape') { cancelGesture(); closeMenu(true) }
  })
  window.addEventListener('blur', () => { cancelGesture(); closeMenu() })
  window.addEventListener('resize', () => closeMenu())
  document.addEventListener('scroll', () => closeMenu(), true)
  return { close: () => { cancelGesture(); closeMenu(); if (editor.open) editor.close(); if (metadata.open) metadata.close(); if ($('keep-colors').open) $('keep-colors').close() }, attach(card, keep) {
    card.tabIndex = 0
    card.addEventListener('contextmenu', event => {
      event.preventDefault()
      if (gesture || Date.now() < suppressUntil) return
      const bounds = card.getBoundingClientRect()
      openMenu(keep.id, event.clientX || bounds.left, event.clientY || bounds.top, card)
    })
    card.addEventListener('pointerdown', event => {
      if (event.button !== 2) return
      cancelGesture(); closeMenu()
      gesture = { id: keep.id, card, x: event.clientX, y: event.clientY, expanded: false }
      timer = setTimeout(() => { if (gesture) { gesture.expanded = true; suppressUntil = Date.now() + 800; openEditor(keep.id) } }, 550)
    })
  } }
}
