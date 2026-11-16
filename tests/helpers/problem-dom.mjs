// Small event fixture for checking selection and state without an Electron runtime.
export function problemDocument() {
  const nodes = new Map()
  const document = { activeElement: null }
  class Node {
    constructor(tag = 'div') { this.tagName = tag; this.children = []; this.listeners = {}; this.style = {}; this.dataset = {}; this.attributes = {}; this.classList = { toggle() {}, add() {} }; this.value = ''; this.open = false; this.isConnected = true; this.parentElement = { scrollTop: 0 } }
    append(...nodes) { for (const node of nodes) { node.parentElement = this; this.children.push(node) } }
    replaceChildren(...nodes) { for (const child of this.children) child.isConnected = false; this.children = []; this.append(...nodes) }
    addEventListener(name, callback) { (this.listeners[name] ??= []).push(callback) }
    emit(name, values = {}) { const results = (this.listeners[name] || []).map(callback => callback({ preventDefault() {}, target: this, ...values })); if (results.some(result => result?.then)) return Promise.all(results) }
    setAttribute(name, value) { this.attributes[name] = value }
    getAttribute(name) { return this.attributes[name] }
    focus() { document.activeElement = this }
    showModal() { this.open = true }
    close() { if (this.open) { this.open = false; this.emit('close') } }
    contains(node) { return this === node || this.children.some(child => child.contains(node)) }
    querySelector(selector) {
      for (const child of this.children) {
        if (selector.startsWith('.') ? child.className?.split(' ').includes(selector.slice(1)) : child.tagName === selector) return child
        const nested = child.querySelector(selector); if (nested) return nested
      }
      return null
    }
  }
  document.createElement = tag => new Node(tag)
  document.getElementById = id => { if (!nodes.has(id)) nodes.set(id, new Node()); return nodes.get(id) }
  return document
}
