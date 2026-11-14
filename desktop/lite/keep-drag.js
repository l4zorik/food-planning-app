// Pointer dragging leaves the mouse wheel available; native HTML dragging does not.
export function setupKeepDrag({ reorder, canMove }) {
  let drag, frame
  function clear() {
    if (frame) window.cancelAnimationFrame(frame)
    frame = null
    if (!drag) return
    drag.card.classList.remove('dragging')
    drag.target?.classList.remove('drop-target')
    drag.ghost?.remove()
    document.body.classList.remove('keep-is-dragging')
    if (drag.card.hasPointerCapture?.(drag.pointerId)) drag.card.releasePointerCapture(drag.pointerId)
    drag = null
  }
  function targetAtPointer() {
    if (!drag?.active) return
    const target = document.elementFromPoint(drag.x, drag.y)?.closest('.keep-card')
    drag.target?.classList.remove('drop-target')
    drag.target = target && target !== drag.card && canMove(drag.id, target.dataset.keepId) ? target : null
    drag.target?.classList.add('drop-target')
  }
  function tick() {
    if (!drag?.active) return
    const edge = 80, height = window.innerHeight
    const speed = drag.y < edge ? -Math.min(22, (edge - drag.y) / 4) : drag.y > height - edge ? Math.min(22, (drag.y - height + edge) / 4) : 0
    if (speed) window.scrollBy(0, speed)
    targetAtPointer()
    frame = window.requestAnimationFrame(tick)
  }
  document.addEventListener('pointermove', event => {
    if (!drag || event.pointerId !== drag.pointerId) return
    drag.x = event.clientX; drag.y = event.clientY
    if (!drag.active && Math.hypot(drag.x - drag.startX, drag.y - drag.startY) > 6) {
      drag.active = true
      drag.ghost = drag.card.cloneNode(true)
      drag.ghost.classList.add('keep-drag-ghost')
      drag.ghost.setAttribute('aria-hidden', 'true'); drag.ghost.inert = true
      drag.ghost.style.width = `${drag.card.getBoundingClientRect().width}px`
      document.body.append(drag.ghost)
      drag.card.classList.add('dragging'); document.body.classList.add('keep-is-dragging')
      frame = window.requestAnimationFrame(tick)
    }
    if (drag.active) {
      drag.ghost.style.left = `${drag.x + 16}px`; drag.ghost.style.top = `${drag.y + 16}px`
      targetAtPointer()
    }
  })
  document.addEventListener('pointerup', event => {
    if (!drag || event.pointerId !== drag.pointerId || event.button !== 0) return
    targetAtPointer()
    const id = drag.id, targetId = drag.active ? drag.target?.dataset.keepId : null
    clear()
    if (targetId) reorder(id, targetId)
  })
  // No preventDefault: Chromium scrolls normally while the pointer stays captured.
  document.addEventListener('wheel', () => { if (drag?.active) window.requestAnimationFrame(targetAtPointer) }, { passive: true })
  document.addEventListener('pointercancel', clear)
  document.addEventListener('keydown', event => { if (event.key === 'Escape') clear() })
  window.addEventListener('blur', clear)
  return { clear, attach(card, keep) {
    card.draggable = false
    card.addEventListener('dragstart', event => event.preventDefault())
    card.addEventListener('pointerdown', event => {
      if (event.button !== 0 || event.target.closest('input,label,video,a,button:not(.keep-grip)')) return
      clear()
      drag = { card, id: keep.id, pointerId: event.pointerId, x: event.clientX, y: event.clientY, startX: event.clientX, startY: event.clientY }
      if (event.isTrusted) card.setPointerCapture(event.pointerId)
    })
  } }
}
