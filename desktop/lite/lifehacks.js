import { lifehackCatalog, lifehackGroups, lifehackTags, filterLifehacks, sharedLifehackTags, parseLifehackTags, addLifehackWorkflow } from './lifehacks-catalog.js'
import { setupFavoriteMenu } from './modal-favorites.js'

function lifeNode(tag, text, className) {
  const node = document.createElement(tag)
  if (text !== undefined) node.textContent = text
  if (className) node.className = className
  return node
}
export function setupLifehacks({ getState, save }) {
  const $ = id => document.getElementById(id)
  const problemDialog = $('life-problem-picker'), workflowDialog = $('life-workflow-picker')
  let problemIndex = null, workflowIndex = null, problemFavorites = false, workflowFavorites = false
  let problemOpener = null, workflowOpener = null
  function data() {
    const state = getState()
    state.cheats ??= { slots: Array.from({ length: 20 }, () => ({ active: false, problem: null, notes: '', workflows: [] })) }
    return state.cheats
  }
  const favorites = {
    has(kind, id) { return data().favorites?.[kind]?.includes(id) || false },
    toggle(kind, id) {
      data().favorites ??= {}; const ids = data().favorites[kind] || []
      data().favorites[kind] = ids.includes(id) ? ids.filter(value => value !== id) : [...ids, id]; save()
    },
  }
  const problemMenu = setupFavoriteMenu(problemDialog, favorites, 'problems')
  const workflowMenu = setupFavoriteMenu(workflowDialog, favorites, 'workflows')
  function tags(parent, values, onClick) {
    const list = lifeNode('div', undefined, 'life-tags')
    for (const tag of values) {
      const chip = lifeNode(onClick ? 'button' : 'span', `#${tag}`)
      if (onClick) { chip.type = 'button'; chip.title = `Zobrazit postupy s tagem ${tag}`; chip.addEventListener('click', () => onClick(tag)) }
      list.append(chip)
    }
    parent.append(list)
  }
  function art(item) {
    const wrapper = lifeNode('span', undefined, 'problem-art'), image = lifeNode('img')
    image.src = item.image; image.alt = ''; image.loading = 'lazy'; image.width = 160; image.height = 112
    wrapper.append(image, lifeNode('span', item.icon, 'problem-icon')); return wrapper
  }
  function updateSummary() {
    const selected = data().slots.filter(slot => slot.problem).length
    const workflows = data().slots.flatMap(slot => slot.workflows), steps = workflows.flatMap(workflow => workflow.steps)
    $('lifehack-summary').textContent = `${selected}/20 problémů · ${workflows.length} workflow · ${steps.filter(step => step.done).length}/${steps.length} kroků hotovo`
  }
  function openProblems(index, trigger) {
    problemIndex = index; problemOpener = trigger
    $('life-problem-context').textContent = `SLOT ${String(index + 1).padStart(2, '0')}`
    $('life-problem-search').value = ''; $('life-problem-category').value = ''
    $('life-custom-name').value = ''; $('life-custom-tags').value = ''
    renderProblems(); problemDialog.showModal(); $('life-problem-search').focus()
  }
  function chooseProblem(problem) {
    if (problemIndex === null) return
    const index = problemIndex, slot = data().slots[index]
    slot.problem = problem; slot.active = true; save(); render(); openWorkflows(index)
  }
  function renderProblems() {
    problemMenu.close()
    const grid = $('life-problem-grid')
    const results = filterLifehacks({ query: $('life-problem-search').value, group: $('life-problem-category').value }).filter(item => !problemFavorites || favorites.has('problems', item.id))
    grid.replaceChildren()
    for (const item of results) {
      const tile = lifeNode('button', undefined, 'problem-tile life-problem-tile')
      tile.type = 'button'; tile.dataset.lifeId = item.id
      tile.setAttribute('aria-pressed', String(data().slots[problemIndex]?.problem?.id === item.id))
      tile.append(art(item), lifeNode('strong', item.problem, 'problem-name'))
      tags(tile, item.tags)
      tile.addEventListener('click', () => chooseProblem({ id: item.id, name: item.problem, tags: [...item.tags] }))
      problemMenu.attach(tile, item.id, () => { renderProblems(); return Array.from(grid.children).find(node => node.dataset.lifeId === item.id) || $('life-problem-favorites') })
      grid.append(tile)
    }
    $('life-problem-count').textContent = `${results.length} ze 49 situací`
    $('life-problem-empty').hidden = results.length > 0
    $('life-problem-favorites').setAttribute('aria-pressed', String(problemFavorites))
    grid.parentElement.scrollTop = 0
  }
  function openWorkflows(index = null, tag = '') {
    workflowIndex = index ?? Math.max(0, data().slots.findIndex(slot => !slot.problem))
    workflowOpener = index === null ? $('lifehack-library') : $('lifehack-slots').children[index]?.querySelector('.life-choose-workflow')
    $('life-workflow-query').value = ''; $('life-workflow-purpose').value = ''; $('life-workflow-problem').value = ''; $('life-workflow-category').value = ''
    $('life-workflow-tag').value = tag
    const target = $('life-workflow-target'); target.replaceChildren()
    data().slots.forEach((slot, i) => { const option = lifeNode('option', `${String(i + 1).padStart(2, '0')} · ${slot.problem?.name || 'Prázdný slot'}`); option.value = String(i); target.append(option) })
    target.value = String(workflowIndex)
    $('life-related-only').checked = !tag && !!data().slots[workflowIndex].problem?.tags.length
    renderWorkflows(); workflowDialog.showModal(); $('life-workflow-query').focus()
  }
  function renderWorkflows() {
    workflowMenu.close()
    const slot = data().slots[workflowIndex], problem = slot?.problem
    $('life-workflow-context').textContent = `SLOT ${String(workflowIndex + 1).padStart(2, '0')} · ${problem?.name || 'Vyber první postup'}`
    const results = filterLifehacks({ query: $('life-workflow-query').value, purpose: $('life-workflow-purpose').value, problem: $('life-workflow-problem').value,
      group: $('life-workflow-category').value, tag: $('life-workflow-tag').value, relatedTo: problem, relatedOnly: $('life-related-only').checked })
      .filter(item => !workflowFavorites || favorites.has('workflows', item.id))
    const grid = $('life-workflow-grid'); grid.replaceChildren()
    for (const item of results) {
      const tile = lifeNode('button', undefined, 'problem-tile life-workflow-tile')
      tile.type = 'button'; tile.dataset.lifeId = item.id
      const added = slot.workflows.some(workflow => workflow.templateId === item.id)
      tile.setAttribute('aria-pressed', String(added))
      tile.append(art(item), lifeNode('strong', item.name, 'problem-name'), lifeNode('small', item.problem, 'life-card-problem'))
      tags(tile, item.tags)
      const shared = sharedLifehackTags(item.tags, problem?.tags)
      if (shared.length) tile.append(lifeNode('small', `Společné tagy: ${shared.map(tag => `#${tag}`).join(' ')}`, 'life-match'))
      tile.append(lifeNode('small', item.steps.slice(0, 2).join(' → '), 'life-preview'))
      tile.append(lifeNode('span', added ? '✓ Už přidáno' : `+ Použít · ${item.steps.length} kroků`, 'life-use'))
      tile.addEventListener('click', () => {
        const index = workflowIndex
        if (addLifehackWorkflow(data().slots[index], item)) save()
        render(); $('lifehack-slots').children[index]?.querySelector('.life-choose-workflow')?.focus()
      })
      workflowMenu.attach(tile, item.id, () => { renderWorkflows(); return Array.from(grid.children).find(node => node.dataset.lifeId === item.id) || $('life-workflow-favorites') })
      grid.append(tile)
    }
    $('life-workflow-count').textContent = `${results.length} ze 49 workflow`
    $('life-workflow-empty').hidden = results.length > 0
    $('life-workflow-favorites').setAttribute('aria-pressed', String(workflowFavorites))
    grid.parentElement.scrollTop = 0
  }
  function render() {
    if (problemDialog.open) problemDialog.close()
    if (workflowDialog.open) workflowDialog.close()
    const container = $('lifehack-slots'); container.replaceChildren()
    data().slots.forEach((slot, index) => {
      const card = lifeNode('article', undefined, 'life-slot'), heading = lifeNode('div', undefined, 'life-slot-heading')
      const activeLabel = lifeNode('label'), active = lifeNode('input')
      active.type = 'checkbox'; active.checked = slot.active
      active.addEventListener('change', () => { slot.active = active.checked; card.classList.toggle('is-active', slot.active); save() })
      activeLabel.append(active, lifeNode('span', 'Teď řeším'))
      heading.append(lifeNode('h3', `Slot ${String(index + 1).padStart(2, '0')}`), activeLabel)
      card.classList.toggle('is-active', slot.active)
      const choose = lifeNode('button', slot.problem?.name || '+ Vybrat můj problém', 'life-choose-problem')
      choose.type = 'button'; choose.setAttribute('aria-haspopup', 'dialog'); choose.setAttribute('aria-controls', 'life-problem-picker')
      choose.setAttribute('aria-label', `Problém pro slot ${index + 1}: ${slot.problem?.name || 'nevybráno'}`)
      choose.addEventListener('click', () => openProblems(index, choose))
      const chooseWorkflow = lifeNode('button', '↗ Vybrat plánovací workflow', 'life-choose-workflow')
      chooseWorkflow.type = 'button'; chooseWorkflow.setAttribute('aria-haspopup', 'dialog'); chooseWorkflow.setAttribute('aria-controls', 'life-workflow-picker')
      chooseWorkflow.addEventListener('click', () => openWorkflows(index))
      card.append(heading, choose)
      if (slot.problem) {
        tags(card, slot.problem.tags, tag => openWorkflows(index, tag))
        const editTagsLabel = lifeNode('label', 'Tagy problému · oddělené čárkou', 'life-field'), editTags = lifeNode('input')
        editTags.value = slot.problem.tags.join(', '); editTags.placeholder = 'např. práce, vzdělání'
        editTags.addEventListener('change', () => { slot.problem.tags = parseLifehackTags(editTags.value); save(); render() })
        editTagsLabel.append(editTags); card.append(editTagsLabel)
        const related = filterLifehacks({ relatedTo: slot.problem, relatedOnly: true })
        card.append(lifeNode('p', slot.problem.tags.length ? `${related.length} souvisejících workflow přes společné tagy` : 'Přidej tagy pro vyhledání souvislostí.', 'life-hint'))
        const connections = data().slots.map((other, i) => ({ slot: other, index: i, shared: sharedLifehackTags(slot.problem.tags, other.problem?.tags) }))
          .filter(other => other.index !== index && other.slot.problem && other.shared.length)
        if (connections.length) {
          const links = lifeNode('div', undefined, 'life-connections')
          links.append(lifeNode('p', 'Souvisí s tvými dalšími problémy'))
          for (const connection of connections) {
            const link = lifeNode('button', undefined, 'life-slot-link'); link.type = 'button'
            link.append(lifeNode('strong', `${String(connection.index + 1).padStart(2, '0')} · ${connection.slot.problem.name}`), lifeNode('small', connection.shared.map(tag => `#${tag}`).join(' ')))
            link.addEventListener('click', () => {
              const target = $('lifehack-slots').children[connection.index]?.querySelector('.life-choose-problem')
              target?.focus(); target?.scrollIntoView?.({ block: 'center' })
            })
            links.append(link)
          }
          card.append(links)
        }
      }
      card.append(chooseWorkflow)
      const notesLabel = lifeNode('label', 'Můj účel a poznámky', 'life-field'), notes = lifeNode('textarea')
      notes.rows = 2; notes.value = slot.notes; notes.placeholder = 'Co chci změnit a proč?'
      notes.addEventListener('input', () => { slot.notes = notes.value; save() }); notesLabel.append(notes); card.append(notesLabel)
      for (const workflow of slot.workflows) {
        const box = lifeNode('section', undefined, 'life-checklist'), remove = lifeNode('button', 'Odebrat workflow', 'life-remove-workflow')
        remove.type = 'button'; remove.setAttribute('aria-label', `Odebrat workflow: ${workflow.name}`)
        remove.addEventListener('click', () => { slot.workflows = slot.workflows.filter(item => item.id !== workflow.id); save(); render() })
        const count = lifeNode('span', undefined, 'life-workflow-progress'), meter = lifeNode('progress')
        meter.max = workflow.steps.length; meter.setAttribute('aria-label', `Splněné kroky: ${workflow.name}`)
        function progress() { const done = workflow.steps.filter(step => step.done).length; count.textContent = `${done}/${workflow.steps.length} hotovo`; meter.value = done }
        progress(); box.append(lifeNode('h4', workflow.name), count, meter)
        tags(box, workflow.tags, tag => openWorkflows(index, tag))
        for (const step of workflow.steps) {
          const label = lifeNode('label', undefined, 'life-step'), check = lifeNode('input'), text = lifeNode('span', step.text)
          check.type = 'checkbox'; check.checked = step.done; text.classList.toggle('done', step.done)
          check.addEventListener('change', () => { step.done = check.checked; text.classList.toggle('done', step.done); progress(); updateSummary(); save() })
          label.append(check, text); box.append(label)
        }
        box.append(remove); card.append(box)
      }
      container.append(card)
    })
    updateSummary()
  }
  for (const id of ['life-problem-category', 'life-workflow-category']) {
    for (const group of lifehackGroups) { const option = lifeNode('option', `${group.icon} ${group.name}`); option.value = group.id; $(id).append(option) }
  }
  for (const tag of lifehackTags) { const option = lifeNode('option', `#${tag}`); option.value = tag; $('life-workflow-tag').append(option) }
  $('life-problem-search').addEventListener('input', renderProblems)
  $('life-problem-category').addEventListener('change', renderProblems)
  $('life-problem-favorites').addEventListener('click', () => { problemFavorites = !problemFavorites; renderProblems() })
  $('life-workflow-favorites').addEventListener('click', () => { workflowFavorites = !workflowFavorites; renderWorkflows() })
  for (const id of ['life-workflow-query', 'life-workflow-purpose', 'life-workflow-problem']) $(id).addEventListener('input', renderWorkflows)
  for (const id of ['life-workflow-category', 'life-workflow-tag', 'life-related-only']) $(id).addEventListener('change', renderWorkflows)
  $('life-workflow-target').addEventListener('change', () => {
    const index = Number($('life-workflow-target').value)
    if (!Number.isInteger(index) || index < 0 || index >= 20) return
    workflowIndex = index; $('life-related-only').checked = !!data().slots[index].problem?.tags.length; renderWorkflows()
  })
  $('life-custom-form').addEventListener('submit', event => {
    event.preventDefault(); const name = $('life-custom-name').value.trim()
    if (name) chooseProblem({ id: null, name, tags: parseLifehackTags($('life-custom-tags').value) })
  })
  $('lifehack-library').addEventListener('click', () => openWorkflows())
  $('life-problem-close').addEventListener('click', () => problemDialog.close())
  $('life-workflow-close').addEventListener('click', () => workflowDialog.close())
  problemDialog.addEventListener('close', () => { problemIndex = null; if (!workflowDialog.open && problemOpener?.isConnected) problemOpener.focus() })
  workflowDialog.addEventListener('close', () => { workflowIndex = null; if (workflowOpener?.isConnected) workflowOpener.focus() })
  for (const dialog of [problemDialog, workflowDialog]) dialog.addEventListener('click', event => { if (event.target === dialog) dialog.close() })
  return { render }
}
