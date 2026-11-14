import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import vm from 'node:vm'

class Node {
  constructor(id) { this.dataset = { keepId: id }; this.style = {}; this.events = {}; this.classes = new Set(); this.classList = { add: value => this.classes.add(value), remove: value => this.classes.delete(value) } }
  addEventListener(type, action, options) { (this.events[type] ||= []).push({ action, options }) }
  emit(type, values = {}) { const event = { target: this, button: 0, pointerId: 1, clientX: 100, clientY: 200, isTrusted: true, preventDefault() { this.prevented = true }, ...values }; for (const { action } of this.events[type] || []) action(event); return event }
  closest(selector) { return selector === '.keep-card' ? this : null }
  getBoundingClientRect() { return { width: 300 } }
  cloneNode() { return new Node('ghost') }
  setAttribute() {}
  setPointerCapture() { this.captured = true }
  hasPointerCapture() { return this.captured }
  releasePointerCapture() { this.captured = false }
  append(node) { this.ghost = node }
  remove() { this.removed = true }
}

test('pointer dragging allows mouse-wheel scrolling, autoscrolls, retargets and persists a drop', async () => {
  const document = new Node(), window = new Node(), frames = new Map(), moves = [], scrolls = []
  const source = new Node('source'), firstTarget = new Node('first'), scrolledTarget = new Node('after-scroll')
  document.body = new Node(); let hit = firstTarget, nextFrame = 0
  document.elementFromPoint = () => hit
  window.innerHeight = 800
  window.requestAnimationFrame = callback => { frames.set(++nextFrame, callback); return nextFrame }
  window.cancelAnimationFrame = id => frames.delete(id)
  window.scrollBy = (x, y) => scrolls.push(y)
  const context = vm.createContext({ document, window })
  vm.runInContext((await readFile(new URL('../desktop/lite/keep-drag.js', import.meta.url), 'utf8')).replace('export function ', 'function '), context)
  const drag = context.setupKeepDrag({ reorder: (id, target) => moves.push([id, target]), canMove: () => true })
  drag.attach(source, { id: 'source' })
  source.emit('pointerdown')
  assert.ok(source.captured)
  document.emit('pointermove', { clientY: 220 })
  assert.ok(source.classes.has('dragging'))
  assert.ok(firstTarget.classes.has('drop-target'))
  const wheel = document.emit('wheel', { deltaY: -120 })
  assert.ok(!wheel.prevented)
  assert.equal(document.events.wheel[0].options.passive, true)
  hit = scrolledTarget
  const advance = () => { const scheduled = [...frames.values()]; frames.clear(); scheduled.forEach(callback => callback()) }
  advance()
  assert.ok(scrolledTarget.classes.has('drop-target'))
  assert.ok(!firstTarget.classes.has('drop-target'))
  document.emit('pointermove', { clientY: 10 }); advance()
  assert.ok(scrolls.some(y => y < 0))
  document.emit('pointermove', { clientY: 790 }); advance()
  assert.ok(scrolls.some(y => y > 0))
  document.emit('pointerup')
  assert.deepEqual(moves, [['source', 'after-scroll']])
  assert.ok(!source.captured && !source.classes.has('dragging'))
  assert.ok(document.body.ghost.removed)
  assert.equal(frames.size, 0)
  source.emit('pointerdown'); document.emit('pointermove', { clientY: 230 }); document.emit('keydown', { key: 'Escape' })
  assert.equal(moves.length, 1)
  assert.ok(!source.classes.has('dragging'))
  source.emit('pointerdown', { button: 2 }); document.emit('pointermove', { clientY: 230 }); document.emit('pointerup')
  assert.equal(moves.length, 1)
})
