import { discoveryMethods, perkTemplates, findingStatuses, createPerk, linkPerkFinding, filterPerkCatalog, ensureWellbeingPerk } from './perks-catalog.js'

function perkNode(tag, text, className) {
  const node = document.createElement(tag)
  if (text !== undefined) node.textContent = text
  if (className) node.className = className
  return node
}
export function setupPerks({ getState, save }) {
  const $ = id => document.getElementById(id)
  const discoveryDialog = $('perk-discovery-picker'), findingsDialog = $('perk-findings-picker'), picker = $('perk-module-picker'), editor = $('perk-editor')
  const dialogs = [discoveryDialog, findingsDialog, picker, editor]
  let methodId = null, editingFindingId = null, pendingFindingId = null, targetPerkId = null, editorPerkId = null
  function data() { const state = getState(); state.perks ??= { modules: [], findings: [] }; ensureWellbeingPerk(state.perks); return state.perks }
  function change() { save(); renderHub() }
  function show(dialog) { for (const other of dialogs) if (other !== dialog && other.open) other.close(); if (!dialog.open) dialog.showModal() }
  function art(item) {
    const wrap = perkNode('span', undefined, 'perk-choice-art'), image = perkNode('img')
    image.src = item.image; image.alt = ''; image.loading = 'lazy'; image.width = 160; image.height = 112
    wrap.append(image, perkNode('span', item.icon, 'perk-choice-icon')); return wrap
  }
  function renderHub() {
    const cards = $('perk-cards'); cards.replaceChildren()
    for (const module of data().modules) {
      const template = perkTemplates.find(item => item.id === module.templateId)
      const button = perkNode('button', undefined, 'perk-card'); button.type = 'button'; button.dataset.perkId = module.id
      button.setAttribute('aria-haspopup', 'dialog'); button.setAttribute('aria-controls', 'perk-editor')
      button.append(perkNode('span', template?.icon || '✦', 'perk-card-icon'), perkNode('strong', module.name || 'Nepojmenovaný modul'), perkNode('small', `${module.findingIds.length} souvislostí · ${module.issues.filter(item => !item.done).length} otevřených poznatků`))
      button.addEventListener('click', () => openEditor(module.id)); cards.append(button)
    }
    $('perk-count').textContent = `Počet modulů: ${data().modules.length} · bez pevného limitu`
    $('perk-findings-count').textContent = `${data().findings.length}`
    renderHome()
  }
  function renderHome() {
    const base = ensureWellbeingPerk(data())
    if ($('home-reflection').value !== base.reflection) $('home-reflection').value = base.reflection
    if ($('home-intention').value !== base.solution) $('home-intention').value = base.solution
    $('home-base-name').textContent = base.name || 'Psychická pohoda'
    const list = $('home-perks'); list.replaceChildren()
    for (const module of data().modules.filter(item => item.id !== base.id)) {
      const template = perkTemplates.find(item => item.id === module.templateId)
      const button = perkNode('button', undefined, 'home-perk-card'); button.type = 'button'; button.dataset.perkId = module.id
      button.append(perkNode('span', template?.icon || '✦'), perkNode('strong', module.name || 'Nepojmenovaný modul'))
      button.setAttribute('aria-haspopup', 'dialog'); button.addEventListener('click', () => openEditor(module.id)); list.append(button)
    }
    $('home-perks-empty').hidden = list.children.length > 0
  }
  function openDiscovery() {
    targetPerkId = null; pendingFindingId = null; $('perk-discovery-search').value = ''; renderDiscovery(); show(discoveryDialog); $('perk-discovery-search').focus()
  }
  function renderDiscovery() {
    const list = $('perk-discovery-grid'); list.replaceChildren()
    for (const method of filterPerkCatalog(discoveryMethods, $('perk-discovery-search').value)) {
      const card = perkNode('button', undefined, 'perk-choice'); card.type = 'button'; card.dataset.methodId = method.id
      card.append(art(method), perkNode('strong', method.name), perkNode('small', method.description), perkNode('span', method.prompts, 'perk-choice-prompts'))
      card.addEventListener('click', () => { methodId = method.id; openFindings() }); list.append(card)
    }
  }
  function clearFindingForm() {
    editingFindingId = null; $('perk-finding-name').value = ''; $('perk-finding-evidence').value = ''; $('perk-finding-tags').value = ''; $('perk-finding-status').value = 'assumption'; $('perk-finding-feedback').textContent = ''
  }
  function openFindings(perkId = null) {
    targetPerkId = perkId; clearFindingForm(); $('perk-findings-search').value = ''; $('perk-findings-filter').value = ''
    const method = discoveryMethods.find(item => item.id === methodId)
    $('perk-method-context').textContent = method ? `${method.name} · ${method.prompts}` : 'Zapiš situaci vlastními slovy. Nemusí se z ní stát problém ani úkol.'
    renderFindings(); show(findingsDialog); $('perk-finding-name').focus()
  }
  function renderFindings() {
    const list = $('perk-findings-list'); list.replaceChildren()
    const results = filterPerkCatalog(data().findings, $('perk-findings-search').value).filter(item => !$('perk-findings-filter').value || item.status === $('perk-findings-filter').value)
    for (const finding of results) {
      const row = perkNode('article', undefined, 'perk-finding-card'); row.dataset.findingId = finding.id
      row.append(perkNode('small', findingStatuses.find(([id]) => id === finding.status)?.[1], 'perk-finding-status'), perkNode('h3', finding.name), perkNode('p', finding.evidence || 'Pozorování zatím není doplněné.'))
      const linked = data().modules.filter(module => module.findingIds.includes(finding.id))
      row.append(perkNode('small', linked.length ? `Souvisí s: ${linked.map(module => module.name).join(', ')}` : 'Zatím bez propojeného modulu', 'perk-muted'))
      const actions = perkNode('div', undefined, 'perk-inline-actions'), edit = perkNode('button', 'Upravit'), connect = perkNode('button', 'Propojit s modulem ↗')
      edit.type = connect.type = 'button'
      edit.addEventListener('click', () => {
        editingFindingId = finding.id; methodId = finding.methodId
        $('perk-finding-name').value = finding.name; $('perk-finding-evidence').value = finding.evidence; $('perk-finding-status').value = finding.status; $('perk-finding-tags').value = finding.tags.join(', '); $('perk-finding-name').focus()
      })
      connect.addEventListener('click', () => connectFinding(finding.id)); actions.append(edit, connect); row.append(actions); list.append(row)
    }
    $('perk-findings-empty').hidden = results.length > 0
  }
  function storeFinding(connect) {
    const name = $('perk-finding-name').value.trim()
    if (!name) { $('perk-finding-feedback').textContent = 'Nejdřív pojmenuj pozorování nebo otázku.'; $('perk-finding-name').focus(); return }
    const previous = data().findings.find(item => item.id === editingFindingId)
    const finding = { id: previous?.id || crypto.randomUUID(), name, evidence: $('perk-finding-evidence').value, status: $('perk-finding-status').value,
      methodId, tags: [...new Set($('perk-finding-tags').value.split(',').map(tag => tag.trim().toLocaleLowerCase('cs')).filter(Boolean))], createdAt: previous?.createdAt || new Date().toISOString() }
    if (previous) data().findings = data().findings.map(item => item.id === previous.id ? finding : item)
    else data().findings.push(finding)
    change(); clearFindingForm(); renderFindings()
    if (connect) connectFinding(finding.id)
    else $('perk-finding-feedback').textContent = 'Pozorování uloženo. Může zůstat otevřené i bez modulu.'
  }
  function connectFinding(id) {
    const module = data().modules.find(item => item.id === targetPerkId)
    if (module) { linkPerkFinding(module, data().findings.find(item => item.id === id)); change(); openEditor(module.id) }
    else openModulePicker(id)
  }
  function openModulePicker(findingId = null) {
    pendingFindingId = findingId
    $('perk-module-search').value = ''; $('perk-custom-name').value = ''
    const finding = data().findings.find(item => item.id === findingId)
    $('perk-module-context').textContent = finding ? `Propojit: ${finding.name}` : 'Vyber směr pro svůj nový modul nebo otevři existující.'
    renderModulePicker(); show(picker); $('perk-module-search').focus()
  }
  function openOrCreate(module) {
    const finding = data().findings.find(item => item.id === pendingFindingId)
    if (finding) linkPerkFinding(module, finding)
    change(); openEditor(module.id)
  }
  function renderModulePicker() {
    const grid = $('perk-module-grid'); grid.replaceChildren()
    for (const template of filterPerkCatalog(perkTemplates, $('perk-module-search').value)) {
      const card = perkNode('button', undefined, 'perk-choice'); card.type = 'button'; card.dataset.templateId = template.id
      card.append(art(template), perkNode('strong', template.name), perkNode('small', template.description), perkNode('span', '+ Vytvořit modul', 'perk-choice-prompts'))
      card.addEventListener('click', () => { const module = createPerk(template); data().modules.push(module); openOrCreate(module) }); grid.append(card)
    }
    $('perk-module-empty').hidden = grid.children.length > 0
    const existing = $('perk-existing-modules'); existing.replaceChildren()
    for (const module of filterPerkCatalog(data().modules, $('perk-module-search').value)) {
      const button = perkNode('button', module.name); button.type = 'button'; button.dataset.perkId = module.id
      button.addEventListener('click', () => openOrCreate(module)); existing.append(button)
    }
  }
  function current() { return data().modules.find(item => item.id === editorPerkId) }
  function openEditor(id) {
    editorPerkId = id; const module = current(); if (!module) return
    $('perk-edit-name').value = module.name; $('perk-edit-reflection').value = module.reflection; $('perk-edit-problem').value = module.problem; $('perk-edit-solution').value = module.solution; $('perk-edit-docs').value = module.documentation
    for (const field of ['trigger', 'inputs', 'actions', 'outputs', 'boundaries']) $(`perk-auto-${field}`).value = module.automation[field]
    $('perk-issue-heading').textContent = module.templateId === 'skill' ? 'Nápady na budoucí aktualizace' : 'Nové chyby, poznatky a otevřené otázky'
    $('perk-new-step').value = ''; $('perk-new-issue').value = ''
    renderLinkedFindings(); renderWorkflow(); renderIssues(); show(editor); $('perk-edit-name').focus()
  }
  function renderLinkedFindings() {
    const list = $('perk-linked-findings'); list.replaceChildren()
    const module = current(); if (!module) return
    for (const id of module.findingIds) {
      const finding = data().findings.find(item => item.id === id); if (!finding) continue
      const row = perkNode('div', undefined, 'perk-linked-finding'), status = perkNode('select')
      for (const [value, name] of findingStatuses) { const option = perkNode('option', name); option.value = value; status.append(option) }
      status.value = finding.status; status.setAttribute('aria-label', `Ověření pozorování: ${finding.name}`)
      status.addEventListener('change', () => { finding.status = status.value; change() })
      row.append(perkNode('strong', finding.name), perkNode('p', finding.evidence || 'Zatím bez popisu pozorování.'), status); list.append(row)
    }
    $('perk-linked-empty').hidden = module.findingIds.length > 0
  }
  function renderWorkflow() {
    const list = $('perk-edit-workflow'); list.replaceChildren(); const module = current(); if (!module) return
    for (const step of module.workflow) {
      const row = perkNode('div', undefined, 'perk-workflow-row'), check = perkNode('input'), text = perkNode('input'), remove = perkNode('button', '×')
      check.type = 'checkbox'; check.checked = step.done; check.setAttribute('aria-label', `Hotovo: ${step.text}`)
      text.value = step.text; text.setAttribute('aria-label', 'Text kroku workflow')
      check.addEventListener('change', () => { step.done = check.checked; change() })
      text.addEventListener('input', () => { step.text = text.value; check.setAttribute('aria-label', `Hotovo: ${step.text}`); change() })
      remove.type = 'button'; remove.setAttribute('aria-label', `Odebrat krok: ${step.text}`)
      remove.addEventListener('click', () => { module.workflow = module.workflow.filter(item => item.id !== step.id); change(); renderWorkflow() })
      row.append(check, text, remove); list.append(row)
    }
  }
  function renderIssues() {
    const list = $('perk-issue-list'); list.replaceChildren(); const module = current(); if (!module) return
    for (const issue of module.issues) {
      const row = perkNode('article', undefined, 'perk-issue'), label = perkNode('label'), check = perkNode('input'), text = perkNode('input'), notes = perkNode('textarea')
      check.type = 'checkbox'; check.checked = issue.done
      check.addEventListener('change', () => { issue.done = check.checked; change() })
      label.append(check, perkNode('span', 'Uzavřeno')); text.value = issue.title; text.setAttribute('aria-label', 'Název poznatku nebo chyby')
      notes.rows = 2; notes.value = issue.notes; notes.placeholder = 'Okolnosti, postup, výsledek nebo další nápad…'; notes.setAttribute('aria-label', `Podrobnosti: ${issue.title}`)
      text.addEventListener('input', () => { issue.title = text.value; change() }); notes.addEventListener('input', () => { issue.notes = notes.value; change() })
      row.append(text, label, notes); list.append(row)
    }
    $('perk-issue-count').textContent = `Záznamy: ${module.issues.length} · bez pevného limitu`
  }
  $('perk-open-discovery').addEventListener('click', openDiscovery)
  $('home-open-base').addEventListener('click', () => openEditor(ensureWellbeingPerk(data()).id))
  $('home-add-perk').addEventListener('click', () => openModulePicker())
  $('home-reflection').addEventListener('input', () => { ensureWellbeingPerk(data()).reflection = $('home-reflection').value; change() })
  $('home-intention').addEventListener('input', () => { ensureWellbeingPerk(data()).solution = $('home-intention').value; change() })
  $('perk-open-findings').addEventListener('click', () => { methodId = null; openFindings() })
  $('perk-add-module').addEventListener('click', () => openModulePicker())
  $('perk-discovery-search').addEventListener('input', renderDiscovery)
  $('perk-discovery-skip').addEventListener('click', () => { methodId = null; openFindings() })
  $('perk-findings-back').addEventListener('click', openDiscovery)
  $('perk-findings-search').addEventListener('input', renderFindings)
  $('perk-findings-filter').addEventListener('change', renderFindings)
  $('perk-finding-form').addEventListener('submit', event => { event.preventDefault(); storeFinding(false) })
  $('perk-finding-connect').addEventListener('click', () => storeFinding(true))
  $('perk-module-search').addEventListener('input', renderModulePicker)
  $('perk-module-back').addEventListener('click', () => openFindings())
  $('perk-custom-form').addEventListener('submit', event => {
    event.preventDefault(); const name = $('perk-custom-name').value.trim(); if (!name) return
    const module = createPerk({ id: 'custom', name, description: 'Vlastní prostor pro souvislosti, řešení a postup.', workflow: [] }); data().modules.push(module); openOrCreate(module)
  })
  const fields = { 'perk-edit-name': 'name', 'perk-edit-reflection': 'reflection', 'perk-edit-problem': 'problem', 'perk-edit-solution': 'solution', 'perk-edit-docs': 'documentation' }
  for (const [id, field] of Object.entries(fields)) $(id).addEventListener('input', () => { if (current()) { current()[field] = $(id).value; change() } })
  for (const field of ['trigger', 'inputs', 'actions', 'outputs', 'boundaries']) $(`perk-auto-${field}`).addEventListener('input', () => { if (current()) { current().automation[field] = $(`perk-auto-${field}`).value; change() } })
  $('perk-add-linked').addEventListener('click', () => { methodId = null; openFindings(editorPerkId) })
  $('perk-step-form').addEventListener('submit', event => {
    event.preventDefault(); const text = $('perk-new-step').value.trim(); if (!text || !current()) return
    current().workflow.push({ id: crypto.randomUUID(), text, done: false }); $('perk-new-step').value = ''; change(); renderWorkflow(); $('perk-new-step').focus()
  })
  $('perk-issue-form').addEventListener('submit', event => {
    event.preventDefault(); const title = $('perk-new-issue').value.trim(); if (!title || !current()) return
    current().issues.push({ id: crypto.randomUUID(), title, notes: '', done: false, createdAt: new Date().toISOString() }); $('perk-new-issue').value = ''; change(); renderIssues(); $('perk-new-issue').focus()
  })
  for (const [dialog, closeId] of [[discoveryDialog, 'perk-discovery-close'], [findingsDialog, 'perk-findings-close'], [picker, 'perk-module-close'], [editor, 'perk-editor-close']]) {
    $(closeId).addEventListener('click', () => dialog.close())
    dialog.addEventListener('click', event => { if (event.target === dialog) dialog.close() })
    dialog.addEventListener('close', () => { if (!dialogs.some(other => other.open)) $('perk-add-module').focus() })
  }
  return { render() { for (const dialog of dialogs) if (dialog.open) dialog.close(); editorPerkId = null; renderHub() } }
}
