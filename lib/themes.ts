export type ThemeMode = 'color' | 'season' | 'month' | 'hour'
export type Theme = { id: string; name: string; hue: number; dark: boolean }
export type ThemePreference = { mode: ThemeMode; id: string; automatic: boolean }

function palette(id: string, name: string, hue: number, dark = false): Theme {
  return { id, name, hue, dark }
}

export const colorThemes: Theme[] = [
  ['amber', 'Amber', 38], ['coral', 'Coral', 14], ['rose', 'Rose', 345],
  ['ruby', 'Ruby', 355], ['peach', 'Peach', 24], ['lemon', 'Lemon', 52],
  ['olive', 'Olive', 80], ['sage', 'Sage', 135], ['forest', 'Forest', 150],
  ['mint', 'Mint', 165], ['teal', 'Teal', 180], ['aqua', 'Aqua', 192],
  ['sky', 'Sky', 205], ['ocean', 'Ocean', 220], ['indigo', 'Indigo', 240],
  ['violet', 'Violet', 265], ['lavender', 'Lavender', 280], ['plum', 'Plum', 300],
  ['cocoa', 'Cocoa', 28], ['midnight', 'Midnight', 230],
].map(([id, name, hue]) => palette(String(id), String(name), Number(hue), id === 'midnight' || id === 'cocoa'))

export const seasonThemes = [
  palette('spring', 'Spring blossom', 140), palette('summer', 'Summer sunshine', 42),
  palette('autumn', 'Autumn harvest', 22), palette('winter', 'Winter frost', 215, true),
]

export const monthThemes = [
  palette('january', 'January · Ice', 210, true), palette('february', 'February · Rose', 340),
  palette('march', 'March · Sprout', 130), palette('april', 'April · Rain', 195),
  palette('may', 'May · Blossom', 300), palette('june', 'June · Strawberry', 355),
  palette('july', 'July · Sunshine', 45), palette('august', 'August · Apricot', 28),
  palette('september', 'September · Olive', 80), palette('october', 'October · Pumpkin', 20),
  palette('november', 'November · Plum', 285, true), palette('december', 'December · Evergreen', 155, true),
]

const hourNames = ['Midnight', 'Starlight', 'Deep night', 'Moonlight', 'Blue hour', 'First light',
  'Sunrise', 'Apricot morning', 'Fresh morning', 'Garden', 'Mint tea', 'Clear sky',
  'Noon', 'Golden lunch', 'Citrus', 'Afternoon', 'Honey', 'Golden hour',
  'Sunset', 'Rose dusk', 'Twilight', 'Evening', 'Quiet night', 'Nightfall']
const hourHues = [230, 238, 246, 254, 218, 205, 25, 32, 65, 135, 165, 200,
  45, 38, 55, 185, 35, 28, 15, 340, 275, 255, 245, 235]
export const hourThemes = hourNames.map((name, hour) =>
  palette(`hour-${hour}`, `${String(hour).padStart(2, '0')}:00 · ${name}`, hourHues[hour], hour < 5 || hour >= 20))

export const themeCatalog: Record<ThemeMode, Theme[]> = {
  color: colorThemes, season: seasonThemes, month: monthThemes, hour: hourThemes,
}
export const defaultPreference: ThemePreference = { mode: 'hour', id: 'hour-12', automatic: true }
export const themeStorageKey = 'meal-planner-theme-v1'

export function readPreference(value: string | null): ThemePreference {
  try {
    const parsed: unknown = JSON.parse(value || 'null')
    if (!parsed || typeof parsed !== 'object') return defaultPreference
    const p = parsed as Partial<ThemePreference>
    if (!Object.prototype.hasOwnProperty.call(themeCatalog, p.mode || '')) return defaultPreference
    const mode = p.mode as ThemeMode
    if (!themeCatalog[mode].some(t => t.id === p.id) || typeof p.automatic !== 'boolean') return defaultPreference
    return { mode, id: p.id!, automatic: mode !== 'color' && p.automatic }
  } catch { return defaultPreference }
}

export function resolveTheme(preference: ThemePreference, now: Date): Theme {
  if (preference.automatic) {
    if (preference.mode === 'hour') return hourThemes[now.getHours()]
    if (preference.mode === 'month') return monthThemes[now.getMonth()]
    // Northern hemisphere meteorological seasons, using the device's local date.
    if (preference.mode === 'season') return seasonThemes[Math.floor(((now.getMonth() + 10) % 12) / 3)]
  }
  return themeCatalog[preference.mode].find(t => t.id === preference.id) || colorThemes[0]
}

export function themeVariables(theme: Theme): Record<string, string> {
  const h = theme.hue
  const tint = (s: number, l: number) => `hsl(${h} ${s}% ${l}%)`
  return {
    '--background': tint(25, theme.dark ? 9 : 97),
    '--foreground': tint(25, theme.dark ? 96 : 12),
    '--card': tint(22, theme.dark ? 14 : 99),
    '--card-foreground': tint(25, theme.dark ? 96 : 12),
    '--popover': tint(22, theme.dark ? 14 : 99),
    '--popover-foreground': tint(25, theme.dark ? 96 : 12),
    '--primary': tint(65, theme.dark ? 75 : 28),
    '--primary-foreground': tint(25, theme.dark ? 9 : 99),
    '--secondary': tint(30, theme.dark ? 23 : 90),
    '--secondary-foreground': tint(25, theme.dark ? 96 : 12),
    '--muted': tint(22, theme.dark ? 20 : 92),
    '--muted-foreground': tint(18, theme.dark ? 78 : 32),
    '--accent': tint(35, theme.dark ? 24 : 88),
    '--accent-foreground': tint(25, theme.dark ? 96 : 12),
    '--border': tint(20, theme.dark ? 34 : 78),
    '--input': tint(20, theme.dark ? 34 : 78),
    '--ring': tint(65, theme.dark ? 75 : 28),
    '--theme-glow': tint(50, theme.dark ? 18 : 89),
  }
}
