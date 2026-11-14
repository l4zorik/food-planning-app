import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { problemCatalog, problemGroups, filterProblems } from '../desktop/lite/problem-catalog.js'
import { setupProblemPicker } from '../desktop/lite/problem-picker.js'
import { problemDocument } from './helpers/problem-dom.mjs'

test('100 distinct problems in ten groups have 100 local illustrations and the requested topics', async () => {
  assert.equal(problemCatalog.length, 100)
  assert.equal(problemGroups.length, 10)
  assert.ok(problemGroups.every(group => group.entries.length === 10))
  for (const field of ['id', 'name', 'image', 'artwork']) assert.equal(new Set(problemCatalog.map(item => item[field])).size, 100)
  for (const name of ['Porno', 'Drogy', 'Nedostatečné vzdělání', 'Nedostatečné finance', 'Ztracenost']) assert.ok(problemCatalog.some(item => item.name === name))
  const images = await Promise.all(problemCatalog.map(async item => {
    const svg = await readFile(new URL(`../desktop/lite/${item.image}`, import.meta.url), 'utf8')
    assert.ok(svg.includes('<svg') && svg.includes(`<title id="title">${item.name}</title>`))
    assert.ok(!/https?:\/\/(?!www.w3.org)|<script|<image/.test(svg))
    return svg
  }))
  assert.equal(new Set(images).size, 100)
})

test('search ignores accents and casing, combines words, and intersects category filters', () => {
  assert.equal(filterProblems('VZDELANI')[0].name, 'Nedostatečné vzdělání')
  assert.equal(filterProblems('nedostatecne finance')[0].name, 'Nedostatečné finance')
  assert.equal(filterProblems('', 'money').length, 10)
  assert.equal(filterProblems('porNo', 'money').length, 0)
  assert.equal(filterProblems('zzzzzz').length, 0)
  assert.equal(filterProblems('  ').length, 100)
})

test('picker filters, selects the right slot, highlights current selection, cancels and accepts custom text', () => {
  const previous = globalThis.document
  globalThis.document = problemDocument()
  try {
    const $ = document.getElementById, selections = []
    const ui = setupProblemPicker({ onSelect: (...values) => selections.push(values) })
    const opener = document.createElement('button')
    ui.open(3, 'Drogy', opener)
    assert.equal($('problem-grid').children.length, 100)
    assert.equal($('problem-grid').children[1].getAttribute('aria-pressed'), 'true')
    assert.equal(document.activeElement, $('problem-search'))
    assert.equal($('problem-slot-name').textContent, 'SLOT 04')
    $('problem-filters').children[8].emit('click')
    assert.equal($('problem-grid').children.length, 10)
    $('problem-search').value = 'dluhy'; $('problem-search').emit('input')
    assert.equal($('problem-grid').children.length, 1)
    $('problem-grid').children[0].emit('click')
    assert.deepEqual(selections, [[3, 'Dluhy']])
    assert.equal(document.activeElement, opener)
    ui.open(1, '', opener)
    $('problem-search').value = 'nenalezeno'; $('problem-search').emit('input')
    assert.equal($('problem-empty').hidden, false)
    $('problem-close').emit('click')
    assert.equal(selections.length, 1)
    ui.open(4, 'Moje vlastní téma', opener)
    assert.equal($('problem-custom-input').value, 'Moje vlastní téma')
    $('problem-custom-input').value = '  <Moje téma>  '; $('problem-custom').emit('submit')
    assert.deepEqual(selections[1], [4, '<Moje téma>'])
    $('problem-custom').emit('submit'); assert.equal(selections.length, 2)
    ui.open(0, '', opener); $('problem-picker').emit('click')
    assert.equal($('problem-picker').open, false)
  } finally { globalThis.document = previous }
})
