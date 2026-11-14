import { test } from 'node:test'
import assert from 'node:assert/strict'
import { themeCatalog, defaultPreference, readPreference, resolveTheme, themeVariables } from '../lib/themes.ts'
import { themeCatalog as desktopCatalog, readPreference as readDesktopPreference, resolveTheme as resolveDesktopTheme, themeVariables as desktopVariables } from '../desktop/lite/themes.js'
import { validateState, DataStore } from '../desktop/store.cjs'
import { mkdtemp, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

test('60 base themes plus five desktop designs have readable foreground/background combinations', () => {
  const themes = [...Object.values(themeCatalog).flat(), ...desktopCatalog.focus]
  assert.deepEqual(Object.values(themeCatalog).map(group => group.length), [20, 4, 12, 24])
  assert.equal(new Set(themes.map(theme => theme.id)).size, 65)
  const luminance = color => {
    const [h, s, l] = color.match(/[\d.]+/g).map(Number)
    const a = s / 100 * Math.min(l / 100, 1 - l / 100)
    const channel = n => {
      const k = (n + h / 30) % 12
      const c = l / 100 - a * Math.max(-1, Math.min(k - 3, 9 - k, 1))
      return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4
    }
    return 0.2126 * channel(0) + 0.7152 * channel(8) + 0.0722 * channel(4)
  }
  for (const theme of themes) {
    const vars = themeVariables(theme)
    for (const [fg, bg] of [['--foreground', '--background'], ['--card-foreground', '--card'], ['--primary-foreground', '--primary'], ['--muted-foreground', '--card']]) {
      const a = luminance(vars[fg]), b = luminance(vars[bg])
      assert.ok((Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05) >= 4.5, `${theme.id}: ${fg}`)
    }
  }
})

test('all five Detox themes persist, disable automatic switching and restore with backups', async t => {
  const firstRoot = await mkdtemp(join(tmpdir(), 'detox-theme-'))
  const secondRoot = await mkdtemp(join(tmpdir(), 'detox-theme-'))
  t.after(async () => { await rm(firstRoot, { recursive: true, force: true }); await rm(secondRoot, { recursive: true, force: true }) })
  const first = new DataStore(firstRoot), second = new DataStore(secondRoot)
  await first.init(); await second.init()
  assert.equal(Object.values(desktopCatalog).flat().length, 65)
  for (const theme of desktopCatalog.focus) {
    const preference = { mode: 'focus', id: theme.id, automatic: false }
    assert.deepEqual(readDesktopPreference(JSON.stringify({ ...preference, automatic: true })), preference)
    assert.equal(resolveDesktopTheme(preference, new Date(2026, 1, 1, 0)).id, theme.id)
    assert.equal(resolveDesktopTheme(preference, new Date(2026, 7, 1, 18)).id, theme.id)
    assert.ok(theme.image && theme.description && theme.design)
    assert.deepEqual(desktopVariables(theme), themeVariables(theme))
    validateState({ theme: preference })
    await first.save({ theme: preference })
    await second.restore(await first.backup())
    assert.deepEqual((await second.load()).theme, preference)
  }
})

test('automatic hourly selection covers all hours and midnight', () => {
  for (let hour = 0; hour < 24; hour++) assert.equal(resolveTheme(defaultPreference, new Date(2026, 10, 10, hour)).id, `hour-${hour}`)
  const date = new Date(2026, 11, 31, 23, 59)
  assert.equal(resolveTheme(defaultPreference, date).id, 'hour-23')
  date.setMinutes(date.getMinutes() + 1)
  assert.equal(resolveTheme(defaultPreference, date).id, 'hour-0')
})

test('automatic seasons and months use the local calendar', () => {
  const seasons = ['winter', 'winter', 'spring', 'spring', 'spring', 'summer', 'summer', 'summer', 'autumn', 'autumn', 'autumn', 'winter']
  for (let month = 0; month < 12; month++) {
    const date = new Date(2026, month, 1)
    assert.equal(resolveTheme({ mode: 'season', automatic: true, id: 'winter' }, date).id, seasons[month])
    assert.equal(resolveTheme({ mode: 'month', automatic: true, id: 'january' }, date).id, themeCatalog.month[month].id)
  }
})

test('manual selections persist and never change with time', () => {
  for (const [mode, themes] of Object.entries(themeCatalog)) for (const theme of themes) {
    const preference = { mode, id: theme.id, automatic: false }
    assert.deepEqual(readPreference(JSON.stringify(preference)), preference)
    assert.equal(resolveTheme(preference, new Date(2026, 0, 1, 23)).id, theme.id)
    assert.equal(resolveTheme(preference, new Date(2026, 6, 1, 5)).id, theme.id)
  }
})

test('malformed or outdated storage falls back safely', () => {
  for (const value of [null, '', '{', 'null', '[]', '42', '{"mode":"__proto__"}', '{"mode":"hour","id":"hour-90","automatic":true}', '{"mode":"color","id":"amber","automatic":"yes"}']) assert.deepEqual(readPreference(value), defaultPreference)
  assert.equal(readPreference('{"mode":"color","id":"amber","automatic":true}').automatic, false)
})
