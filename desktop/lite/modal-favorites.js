export function setupModalFavorites({ getState, save }) {
  function list(kind) { return getState().management?.favorites?.[kind] || [] }
  return {
    has(kind, id) { return list(kind).includes(id) },
    toggle(kind, id) {
      const management = getState().management
      management.favorites ??= {}
      const current = list(kind)
      management.favorites[kind] = current.includes(id) ? current.filter(value => value !== id) : [...current, id]
      save()
    },
  }
}

// The menu lives inside its dialog so it remains above the native modal backdrop.
export function setupFavoriteMenu(dialog, favorites, kind) {
  const menu = document.createElement('div'), action = document.createElement('button')
  menu.className = 'modal-favorite-menu'; menu.hidden = true; menu.setAttribute('role', 'menu')
  menu.setAttribute('aria-label', 'Oblíbené položky'); action.type = 'button'; action.setAttribute('role', 'menuitem')
  menu.append(action); dialog.append(menu)
  let target = null, refresh = null, itemId = null
  function close(restoreFocus = false) {
    menu.hidden = true
    if (restoreFocus && target?.isConnected) target.focus()
    target = null; refresh = null; itemId = null
  }
  action.addEventListener('click', event => {
    event.stopPropagation?.()
    if (!itemId) return
    const id = itemId, update = refresh
    close(); favorites.toggle(kind, id)
    update?.()?.focus()
  })
  dialog.addEventListener('pointerdown', event => { if (!menu.hidden && !menu.contains(event.target)) close() })
  dialog.addEventListener('scroll', () => close(), true)
  dialog.addEventListener('close', () => close())
  dialog.addEventListener('keydown', event => {
    if (menu.hidden) return
    if (event.key === 'Escape') { event.preventDefault(); event.stopPropagation?.(); close(true) }
    if (['ArrowDown', 'ArrowUp', 'Home', 'End'].includes(event.key)) { event.preventDefault(); action.focus() }
  })
  dialog.addEventListener('cancel', event => {
    if (!menu.hidden) { event.preventDefault(); event.stopImmediatePropagation?.(); close(true) }
  }, true)
  return {
    attach(tile, id, onChange) {
      if (!favorites) return
      const favorite = favorites.has(kind, id)
      tile.classList.toggle('is-favorite', favorite)
      tile.setAttribute('aria-description', favorite ? 'Oblíbené. Pravým kliknutím otevřeš nabídku.' : 'Pravým kliknutím můžeš označit jako oblíbené.')
      tile.setAttribute('aria-haspopup', 'menu')
      if (favorite) {
        const star = document.createElement('span'); star.textContent = '★'; star.className = 'modal-favorite-badge'; star.setAttribute('aria-hidden', 'true'); tile.append(star)
      }
      function open(event) {
        event.preventDefault(); event.stopPropagation?.()
        target = tile; refresh = onChange; itemId = id
        action.textContent = favorites.has(kind, id) ? '☆ Odebrat z oblíbených' : '★ Označit jako oblíbené'
        menu.hidden = false
        const rect = dialog.getBoundingClientRect?.() || { left: 0, top: 0, right: 1000, bottom: 800 }
        const tileRect = tile.getBoundingClientRect?.() || { left: rect.left + 12, top: rect.top + 12 }
        const x = event.clientX || tileRect.left + 10, y = event.clientY || tileRect.top + 10
        menu.style.left = `${Math.max(rect.left + 8, Math.min(x, rect.right - (menu.offsetWidth || 240) - 8))}px`
        menu.style.top = `${Math.max(rect.top + 8, Math.min(y, rect.bottom - (menu.offsetHeight || 48) - 8))}px`
        action.focus()
      }
      tile.addEventListener('contextmenu', open)
      tile.addEventListener('keydown', event => { if (event.key === 'ContextMenu' || event.key === 'F10' && event.shiftKey) open(event) })
    },
    close,
  }
}
