export const keepFonts = ['Arial', 'Arial Black', 'Bahnschrift', 'Calibri', 'Cambria', 'Candara', 'Comic Sans MS', 'Consolas', 'Constantia', 'Corbel', 'Courier New', 'Franklin Gothic Medium', 'Trebuchet MS', 'Georgia', 'Impact', 'Lucida Console', 'Palatino Linotype', 'Tahoma', 'Times New Roman', 'Verdana']
export const keepColors = [
  ['default', 'Původní', null], ['yellow', 'Žlutá', '#fff3a6'], ['orange', 'Oranžová', '#ffd3a8'],
  ['red', 'Červená', '#ffb8b8'], ['pink', 'Růžová', '#f6c8e7'], ['purple', 'Fialová', '#d9c9fa'],
  ['blue', 'Modrá', '#bedaff'], ['cyan', 'Tyrkysová', '#b7ebed'], ['green', 'Zelená', '#c6e7b5'], ['gray', 'Šedá', '#dedee4'],
]
export function applyKeepStyle(node, keep) {
  const color = keepColors.find(item => item[0] === keep.color)?.[2]
  node.classList.toggle('keep-colored', !!color)
  node.style.backgroundColor = color || ''
  node.style.color = color ? '#171717' : ''
  node.style.fontFamily = keepFonts.includes(keep.font) ? `"${keep.font}", sans-serif` : ''
}
export function renderRichText(node, runs, content = '') {
  node.replaceChildren()
  for (const run of runs?.length ? runs : [{ text: content }]) {
    const span = document.createElement('span')
    span.textContent = run.text
    if (run.bold) span.style.fontWeight = '700'
    if (/^#[a-f0-9]{6}$/i.test(run.color || '')) span.style.color = run.color
    if (/^#[a-f0-9]{6}$/i.test(run.highlight || '')) { span.style.backgroundColor = run.highlight; span.style.color = run.color || '#171717' }
    node.append(span)
  }
}
function normalizeColor(value) {
  if (/^#[a-f0-9]{6}$/i.test(value || '')) return value.toLowerCase()
  const rgb = /^rgb\(\s*(\d+),\s*(\d+),\s*(\d+)\s*\)$/.exec(value || '')
  return rgb ? '#' + rgb.slice(1).map(channel => Number(channel).toString(16).padStart(2, '0')).join('') : undefined
}
export function readRichText(root) {
  const runs = []
  function append(text, marks) {
    if (!text) return
    const last = runs.at(-1)
    if (last && last.bold === marks.bold && last.color === marks.color && last.highlight === marks.highlight) last.text += text
    else runs.push({ text, ...marks })
  }
  function visit(node, inherited = {}) {
    if (node.nodeType === 3) { append(node.textContent, inherited); return }
    if (node.nodeName === 'BR') { append('\n', inherited); return }
    const marks = { ...inherited }
    if (['B', 'STRONG'].includes(node.nodeName) || Number(node.style?.fontWeight) >= 600) marks.bold = true
    if (node.style?.fontWeight === 'normal' || node.style?.fontWeight === '400') delete marks.bold
    const color = normalizeColor(node.style?.color), highlight = normalizeColor(node.style?.backgroundColor)
    if (color) marks.color = color
    if (highlight) marks.highlight = highlight
    const block = ['DIV', 'P', 'LI'].includes(node.nodeName) && node !== root
    if (block && runs.length && !runs.at(-1).text.endsWith('\n')) append('\n', {})
    for (const child of node.childNodes || []) visit(child, marks)
    if (block && node.nextSibling && runs.length && !runs.at(-1).text.endsWith('\n')) append('\n', {})
  }
  // The editor's card color is inherited, not an explicit text-formatting mark.
  for (const child of root.childNodes || []) visit(child)
  return { content: runs.map(run => run.text).join(''), richText: runs }
}

export function setupRichEditor(node, toolbar, save) {
  let selectedRange
  const selectionInside = () => {
    const selection = window.getSelection()
    return selection?.rangeCount && node.contains(selection.anchorNode) && node.contains(selection.focusNode) ? selection.getRangeAt(0) : null
  }
  document.addEventListener('selectionchange', () => { const range = selectionInside(); if (range) selectedRange = range.cloneRange() })
  toolbar.addEventListener('pointerdown', event => { if (event.target.closest('button')) event.preventDefault() })
  function format(property, value) {
    const range = selectionInside() || selectedRange
    if (!range || !node.contains(range.commonAncestorContainer) || range.collapsed) { node.focus(); return }
    const wrapper = document.createElement('span')
    wrapper.style[property] = value
    const fragment = range.extractContents()
    for (const child of fragment.querySelectorAll('*')) child.style[property] = value
    wrapper.append(fragment); range.insertNode(wrapper)
    const next = document.createRange(); next.selectNodeContents(wrapper)
    const selection = window.getSelection(); selection.removeAllRanges(); selection.addRange(next); selectedRange = next.cloneRange()
    save(readRichText(node))
  }
  document.getElementById('keep-bold').addEventListener('click', () => {
    const range = selectionInside() || selectedRange
    const parent = range?.startContainer.nodeType === 3 ? range.startContainer.parentElement : range?.startContainer
    format('fontWeight', parent && Number(window.getComputedStyle(parent).fontWeight) >= 600 ? '400' : '700')
  })
  document.getElementById('keep-text-color').addEventListener('input', event => format('color', event.target.value))
  document.getElementById('keep-text-highlight').addEventListener('input', event => format('backgroundColor', event.target.value))
  node.addEventListener('keydown', event => {
    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'b') { event.preventDefault(); document.getElementById('keep-bold').click() }
  })
  node.addEventListener('input', () => save(readRichText(node)))
  node.addEventListener('paste', event => {
    event.preventDefault()
    const range = selectionInside()
    if (!range) return
    const text = document.createTextNode(event.clipboardData.getData('text/plain'))
    range.deleteContents(); range.insertNode(text); range.setStartAfter(text); range.collapse(true)
    const selection = window.getSelection(); selection.removeAllRanges(); selection.addRange(range)
    save(readRichText(node))
  })
  node.addEventListener('drop', event => event.preventDefault())
  return { reset() { selectedRange = null } }
}
