import { test } from 'node:test'
import assert from 'node:assert/strict'
import { keepFonts, keepColors, readRichText, applyKeepStyle } from '../desktop/lite/keep-style.js'

const text = value => ({ nodeType: 3, textContent: value })
const node = (name, children, style = {}) => ({ nodeName: name, childNodes: children, style })

test('rich text retains newlines, bold, foreground and highlights without storing HTML', () => {
  const rich = readRichText(node('DIV', [text('First '), node('STRONG', [text('bold')]), node('BR', []), node('SPAN', [text('<script>plain text</script>')], { color: 'rgb(17, 34, 51)', backgroundColor: '#fff3a6' })]))
  assert.equal(rich.content, 'First bold\n<script>plain text</script>')
  assert.equal(rich.richText[1].bold, true)
  assert.equal(rich.richText.at(-1).color, '#112233')
  assert.equal(rich.richText.at(-1).highlight, '#fff3a6')
  assert.equal(rich.richText.map(run => run.text).join(''), rich.content)
  assert.equal(readRichText(node('DIV', [node('DIV', [text('One')]), node('DIV', [text('Two')])])).content, 'One\nTwo')
  assert.equal(readRichText(node('DIV', [node('STRONG', [node('SPAN', [text('normal')], { fontWeight: '400' })])])).richText[0].bold, undefined)
})

test('twenty fonts and all colored cards have readable dark foregrounds', () => {
  assert.equal(keepFonts.length, 20)
  assert.equal(new Set(keepFonts).size, 20)
  const luminance = hex => {
    const values = hex.match(/[a-f\d]{2}/gi).map(part => parseInt(part, 16) / 255).map(channel => channel <= .04045 ? channel / 12.92 : ((channel + .055) / 1.055) ** 2.4)
    return values[0] * .2126 + values[1] * .7152 + values[2] * .0722
  }
  for (const [, name, color] of keepColors.filter(item => item[2])) assert.ok((luminance(color) + .05) / (luminance('#171717') + .05) >= 7, name)
})

test('card colors use dark text and restoring the original removes color and font overrides', () => {
  const card = { style: {}, classList: { toggle(name, value) { card.colored = value } } }
  applyKeepStyle(card, { color: 'blue', font: 'Georgia' })
  assert.equal(card.style.color, '#171717')
  assert.equal(card.style.backgroundColor, '#bedaff')
  assert.ok(card.colored)
  assert.equal(card.style.fontFamily, '"Georgia", sans-serif')
  applyKeepStyle(card, { color: 'default' })
  assert.equal(card.style.backgroundColor, '')
  assert.equal(card.style.color, '')
  assert.equal(card.style.fontFamily, '')
  assert.ok(!card.colored)
})
