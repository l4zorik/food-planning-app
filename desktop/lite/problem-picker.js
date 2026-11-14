import { problemCatalog, problemGroups, filterProblems } from './problem-catalog.js'
import { setupFavoriteMenu } from './modal-favorites.js'

function el(tag, text, className) {
  const node = document.createElement(tag)
  if (text !== undefined) node.textContent = text
  if (className) node.className = className
  return node
}

export function setupProblemPicker({ onSelect, favorites }) {
  const dialog = document.getElementById('problem-picker')
  const grid = document.getElementById('problem-grid')
  const search = document.getElementById('problem-search')
  const filters = document.getElementById('problem-filters')
  const count = document.getElementById('problem-results')
  const custom = document.getElementById('problem-custom')
  const customInput = document.getElementById('problem-custom-input')
  let slotIndex = null, currentProblem = '', category = '', opener = null
  let onlyFavorites = false
  const favoriteMenu = setupFavoriteMenu(dialog, favorites, 'problems')
  const favoriteFilter = el('button', '★ Oblíbené')
  favoriteFilter.type = 'button'; favoriteFilter.setAttribute('aria-pressed', 'false')
  favoriteFilter.addEventListener('click', () => { onlyFavorites = !onlyFavorites; render() })

  function choose(name) {
    if (slotIndex === null || !name.trim()) return
    const index = slotIndex
    slotIndex = null
    dialog.close()
    onSelect(index, name.trim())
  }
  function render() {
    favoriteMenu.close()
    const results = filterProblems(search.value, category).filter(item => !onlyFavorites || favorites?.has('problems', item.id))
    count.textContent = `${results.length} ze ${problemCatalog.length} témat`
    grid.replaceChildren()
    for (const problem of results) {
      const tile = el('button', undefined, 'problem-tile')
      if (problem.design) tile.dataset.design = problem.design
      tile.type = 'button'; tile.dataset.problemId = problem.id
      tile.setAttribute('aria-pressed', String(problem.name === currentProblem))
      tile.setAttribute('aria-label', `${problem.name}. ${problem.description}`)
      tile.title = problem.description
      const art = el('span', undefined, 'problem-art'), image = el('img')
      art.style.backgroundColor = problem.background
      image.src = problem.image; image.alt = ''; image.loading = 'lazy'; image.decoding = 'async'; image.width = 160; image.height = 112
      const icon = el('span', problem.icon, 'problem-icon'); icon.setAttribute('aria-hidden', 'true')
      const selected = el('span', '✓', 'problem-selected'); selected.setAttribute('aria-hidden', 'true')
      art.append(image, icon, selected)
      tile.append(art, el('span', problem.name, 'problem-name'))
      tile.addEventListener('click', () => choose(problem.name))
      favoriteMenu.attach(tile, problem.id, () => {
        render(); return Array.from(grid.children).find(item => item.dataset.problemId === problem.id) || favoriteFilter
      })
      grid.append(tile)
    }
    document.getElementById('problem-empty').hidden = results.length > 0
    document.getElementById('problem-empty').textContent = onlyFavorites ? 'Žádné oblíbené položky pro tento výběr. Označ kartu pravým kliknutím nebo vypni filtr Oblíbené.' : 'Takové téma jsme nenašli. Zkus jiné slovo nebo napiš vlastní problém dole.'
    grid.parentElement.scrollTop = 0
    for (const button of filters.children) button.setAttribute('aria-pressed', String(button.dataset.category === category))
    favoriteFilter.setAttribute('aria-pressed', String(onlyFavorites))
  }
  for (const group of [{ id: '', name: 'Všechna témata', icon: '▦' }, ...problemGroups]) {
    const button = el('button', `${group.icon}  ${group.name}`)
    button.type = 'button'; button.dataset.category = group.id
    button.addEventListener('click', () => { category = group.id; render(); grid.parentElement.scrollTop = 0 })
    filters.append(button)
  }
  if (favorites) filters.append(favoriteFilter)
  search.addEventListener('input', render)
  document.getElementById('problem-close').addEventListener('click', () => dialog.close())
  dialog.addEventListener('click', event => { if (event.target === dialog) dialog.close() })
  dialog.addEventListener('close', () => { slotIndex = null; if (opener?.isConnected) opener.focus() })
  custom.addEventListener('submit', event => { event.preventDefault(); choose(customInput.value) })
  return {
    open(index, selected, trigger) {
      slotIndex = index; currentProblem = selected; opener = trigger; category = ''
      search.value = ''; customInput.value = problemCatalog.some(item => item.name === selected) ? '' : selected
      document.getElementById('problem-slot-name').textContent = `SLOT ${String(index + 1).padStart(2, '0')}`
      render(); dialog.showModal(); grid.parentElement.scrollTop = 0; search.focus()
    },
    close() { if (dialog.open) dialog.close() },
  }
}
