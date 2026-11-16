const fs = require('node:fs/promises')
const path = require('node:path')
const { createHash, randomUUID } = require('node:crypto')

const allowedKeys = new Set(['meals', 'ingredients', 'notes', 'keeps', 'theme', 'discover', 'aiPlans', 'management', 'cheats', 'perks', 'lifeFocus', 'projectAssistant', 'subscription', 'rewards'])
const mediaPattern = /^[a-f0-9]{64}\.(png|jpg|gif|webp|mp4|webm)$/
const mimeTypes = { png: 'image/png', jpg: 'image/jpeg', gif: 'image/gif', webp: 'image/webp', mp4: 'video/mp4', webm: 'video/webm' }

function validateState(state) {
  if (!state || typeof state !== 'object' || Array.isArray(state)) throw Error('Invalid saved data.')
  const json = JSON.stringify(state)
  for (const key of Object.keys(state)) if (!allowedKeys.has(key)) throw Error('Unknown saved data section.')
  for (const key of ['meals', 'ingredients']) {
    if (state[key] !== undefined && (!state[key] || typeof state[key] !== 'object' || Array.isArray(state[key]))) throw Error(`Invalid ${key}.`)
    if (state[key]) for (const value of Object.values(state[key])) if (typeof value !== (key === 'meals' ? 'string' : 'boolean')) throw Error(`Invalid ${key} entry.`)
  }
  for (const key of ['notes', 'keeps', 'aiPlans']) if (state[key] !== undefined && !Array.isArray(state[key])) throw Error(`Invalid ${key}.`)
  for (const note of state.notes || []) {
    if (!note || typeof note.id !== 'string' || typeof note.title !== 'string' || typeof note.content !== 'string' || !['yellow','blue','green','red','purple'].includes(note.color) || !Number.isFinite(Date.parse(note.createdAt))) throw Error('Invalid note.')
  }
  for (const keep of state.keeps || []) {
    if (!keep || typeof keep.id !== 'string' || typeof keep.title !== 'string' || typeof keep.content !== 'string' || typeof keep.createdAt !== 'string' || !['note','todo','photo','video','gif'].includes(keep.kind)) throw Error('Invalid keep.')
    if (keep.completed !== undefined && typeof keep.completed !== 'boolean') throw Error('Invalid to-do.')
    if (keep.pinned !== undefined && typeof keep.pinned !== 'boolean') throw Error('Invalid pin.')
    if (keep.tags !== undefined && (!Array.isArray(keep.tags) || !keep.tags.every(tag => typeof tag === 'string'))) throw Error('Invalid tags.')
    if (keep.group !== undefined && typeof keep.group !== 'string') throw Error('Invalid group.')
    if (keep.mediaKind !== undefined && !['photo', 'gif', 'video'].includes(keep.mediaKind)) throw Error('Invalid media kind.')
    if (keep.color !== undefined && !['default', 'yellow', 'orange', 'red', 'pink', 'purple', 'blue', 'cyan', 'green', 'gray'].includes(keep.color)) throw Error('Invalid Keep color.')
    if (keep.font !== undefined && typeof keep.font !== 'string') throw Error('Invalid Keep font.')
    if (keep.richText !== undefined) {
      if (!Array.isArray(keep.richText) || !keep.richText.every(run => run && typeof run.text === 'string' &&
        (run.bold === undefined || typeof run.bold === 'boolean') &&
        ['color', 'highlight'].every(key => run[key] === undefined || typeof run[key] === 'string' && /^#[a-f0-9]{6}$/i.test(run[key])))) throw Error('Invalid rich text.')
      if (keep.richText.map(run => run.text).join('') !== keep.content) throw Error('Rich text does not match Keep content.')
    }
    if (keep.todos !== undefined && (!Array.isArray(keep.todos) || !keep.todos.every(item => item && typeof item.id === 'string' && typeof item.text === 'string' && typeof item.done === 'boolean'))) throw Error('Invalid to-do list.')
    if (keep.mediaUrl !== undefined && (typeof keep.mediaUrl !== 'string' || !/^mealmedia:\/\/local\/[a-f0-9]{64}\.(png|jpg|gif|webp|mp4|webm)$/.test(keep.mediaUrl))) throw Error('Import media into local storage before saving it.')
  }
  if (state.management !== undefined) {
    const management = state.management
    if (!management || typeof management !== 'object' || Array.isArray(management) || !Array.isArray(management.detox) || management.detox.length !== 5) throw Error('Invalid Management slots.')
    const record = value => value && typeof value === 'object' && !Array.isArray(value)
    if (management.favorites !== undefined && (!record(management.favorites) || !Object.entries(management.favorites).every(([kind, ids]) => ['problems', 'strategies', 'routines'].includes(kind) && Array.isArray(ids) && ids.every(id => typeof id === 'string') && new Set(ids).size === ids.length))) throw Error('Invalid modal favorites.')
    const validDate = key => /^\d{4}-\d{2}-\d{2}$/.test(key) && Number.isFinite(Date.parse(key)) && new Date(key).toISOString().slice(0, 10) === key
    const datedChecks = value => record(value) && Object.entries(value).every(([date, checks]) => validDate(date) && record(checks) && Object.values(checks).every(done => typeof done === 'boolean'))
    for (const slot of management.detox) {
      if (!slot || typeof slot.active !== 'boolean' || typeof slot.problem !== 'string' || typeof slot.strategy !== 'string' || typeof slot.plan !== 'string' || !Array.isArray(slot.routine)) throw Error('Invalid Detox slot.')
      if (!slot.routine.every(item => item && typeof item.id === 'string' && typeof item.text === 'string' && typeof item.done === 'boolean')) throw Error('Invalid Detox routine.')
      if (new Set(slot.routine.map(item => item.id)).size !== slot.routine.length) throw Error('Duplicate Detox step.')
      if (slot.schedule !== undefined) {
        const s = slot.schedule
        if (!record(s) || !Array.isArray(s.days) || !s.days.length || s.days.length > 7 || !s.days.every(day => Number.isInteger(day) && day >= 0 && day <= 6) || new Set(s.days).size !== s.days.length) throw Error('Invalid routine days.')
        if (!Array.isArray(s.templateIds) || !s.templateIds.length || s.templateIds.length > 15 || !s.templateIds.every(id => typeof id === 'string') || new Set(s.templateIds).size !== s.templateIds.length) throw Error('Invalid routine templates.')
        if (!Array.isArray(s.steps) || !s.steps.length || !s.steps.every(step => step && typeof step.id === 'string' && typeof step.text === 'string' && typeof step.routine === 'string') || new Set(s.steps.map(step => step.id)).size !== s.steps.length || !datedChecks(s.checks)) throw Error('Invalid weekly routine.')
      }
      if (slot.dayProgress !== undefined && (!datedChecks(slot.dayProgress) || !Object.values(slot.dayProgress).every(checks => Object.keys(checks).every(key => ['wake', 'breakfast', 'lunch', 'dinner', 'sleep'].includes(key))))) throw Error('Invalid daily progress.')
    }
  }
  if (state.cheats !== undefined) {
    const cheats = state.cheats
    const record = value => value && typeof value === 'object' && !Array.isArray(value)
    const stringList = value => Array.isArray(value) && value.every(text => typeof text === 'string') && new Set(value).size === value.length
    if (!record(cheats) || !Array.isArray(cheats.slots) || cheats.slots.length !== 20) throw Error('Invalid Lifehacks slots.')
    if (cheats.favorites !== undefined && (!record(cheats.favorites) || !Object.entries(cheats.favorites).every(([kind, ids]) => ['problems', 'workflows'].includes(kind) && stringList(ids)))) throw Error('Invalid Lifehacks favorites.')
    for (const slot of cheats.slots) {
      if (!record(slot) || typeof slot.active !== 'boolean' || typeof slot.notes !== 'string' || !Array.isArray(slot.workflows)) throw Error('Invalid Lifehacks slot.')
      if (slot.problem !== null && (!record(slot.problem) || !(slot.problem.id === null || typeof slot.problem.id === 'string') || typeof slot.problem.name !== 'string' || !stringList(slot.problem.tags))) throw Error('Invalid Lifehacks problem.')
      for (const workflow of slot.workflows) {
        if (!record(workflow) || !['id', 'templateId', 'name', 'purpose'].every(key => typeof workflow[key] === 'string') || !stringList(workflow.tags) || !Array.isArray(workflow.steps) || !workflow.steps.length) throw Error('Invalid Lifehacks workflow.')
        if (!workflow.steps.every(step => record(step) && typeof step.id === 'string' && typeof step.text === 'string' && typeof step.done === 'boolean') || new Set(workflow.steps.map(step => step.id)).size !== workflow.steps.length) throw Error('Invalid Lifehacks checklist.')
      }
      if (new Set(slot.workflows.map(workflow => workflow.id)).size !== slot.workflows.length || new Set(slot.workflows.map(workflow => workflow.templateId)).size !== slot.workflows.length) throw Error('Duplicate Lifehacks workflow.')
    }
  }
  if (state.perks !== undefined) {
    const p = state.perks
    const record = value => value && typeof value === 'object' && !Array.isArray(value)
    const strings = value => Array.isArray(value) && value.every(item => typeof item === 'string') && new Set(value).size === value.length
    const uniqueIds = values => new Set(values.map(item => item.id)).size === values.length
    if (!record(p) || !Array.isArray(p.modules) || !Array.isArray(p.findings)) throw Error('Invalid perks.')
    for (const finding of p.findings) {
      if (!record(finding) || !['id', 'name', 'evidence', 'createdAt'].every(key => typeof finding[key] === 'string') || !['assumption', 'confirmed', 'parked', 'disproved'].includes(finding.status) || !(finding.methodId === null || typeof finding.methodId === 'string') || !strings(finding.tags) || !Number.isFinite(Date.parse(finding.createdAt))) throw Error('Invalid perk finding.')
    }
    const findingIds = new Set(p.findings.map(item => item.id))
    for (const module of p.modules) {
      if (!record(module) || !['id', 'templateId', 'name', 'createdAt', 'reflection', 'problem', 'solution', 'documentation'].every(key => typeof module[key] === 'string') || !Number.isFinite(Date.parse(module.createdAt)) || !strings(module.findingIds) || !module.findingIds.every(id => findingIds.has(id))) throw Error('Invalid perk module.')
      if (!Array.isArray(module.workflow) || !module.workflow.every(step => record(step) && typeof step.id === 'string' && typeof step.text === 'string' && typeof step.done === 'boolean') || !uniqueIds(module.workflow)) throw Error('Invalid perk workflow.')
      if (!record(module.automation) || !['trigger', 'inputs', 'actions', 'outputs', 'boundaries'].every(key => typeof module.automation[key] === 'string')) throw Error('Invalid perk automation draft.')
      if (!Array.isArray(module.issues) || !module.issues.every(issue => record(issue) && ['id', 'title', 'notes', 'createdAt'].every(key => typeof issue[key] === 'string') && typeof issue.done === 'boolean' && Number.isFinite(Date.parse(issue.createdAt))) || !uniqueIds(module.issues)) throw Error('Invalid perk issues.')
    }
    if (!uniqueIds(p.modules) || !uniqueIds(p.findings)) throw Error('Duplicate perk identity.')
  }
  if (state.lifeFocus !== undefined) {
    const focus = state.lifeFocus
    if (!focus || typeof focus !== 'object' || !Array.isArray(focus.quests) || !(focus.activeId === null || typeof focus.activeId === 'string')) throw Error('Invalid life focus.')
    const validMeaning = value => value === undefined || value === null || ['money', 'love', 'family', 'friends', 'business', 'health', 'jesus-christ', 'god', 'ai'].includes(value)
    const validMeaningTags = value => value === undefined || Array.isArray(value) && value.length > 0 && value.every(tag => typeof tag === 'string' && validMeaning(tag)) && new Set(value).size === value.length
    if (!validMeaning(focus.defaultMeaning)) throw Error('Invalid focus meaning.')
    if (!validMeaningTags(focus.defaultMeaningTags)) throw Error('Invalid default focus tags.')
    for (const quest of focus.quests) {
      if (!quest || !['id', 'title', 'why', 'createdAt'].every(key => typeof quest[key] === 'string') || !Number.isFinite(Date.parse(quest.createdAt)) || !(quest.sourceIndex === null || Number.isInteger(quest.sourceIndex) && quest.sourceIndex >= 0 && quest.sourceIndex < 20 && state.cheats?.slots[quest.sourceIndex])) throw Error('Invalid life quest.')
      if (!validMeaning(quest.meaning)) throw Error('Invalid quest meaning.')
      if (!validMeaningTags(quest.meaningTags)) throw Error('Invalid quest meaning tags.')
      if (!Array.isArray(quest.steps) || !quest.steps.every(step => step && typeof step.id === 'string' && typeof step.text === 'string' && typeof step.done === 'boolean') || new Set(quest.steps.map(step => step.id)).size !== quest.steps.length) throw Error('Invalid life quest steps.')
    }
    if (new Set(focus.quests.map(quest => quest.id)).size !== focus.quests.length || focus.activeId !== null && !focus.quests.some(quest => quest.id === focus.activeId)) throw Error('Invalid active life quest.')
  }
  if (state.projectAssistant !== undefined) {
    const assistant = state.projectAssistant
    if (!assistant || typeof assistant !== 'object' || !Array.isArray(assistant.profiles) || !Array.isArray(assistant.drafts) || !(assistant.selectedId === null || typeof assistant.selectedId === 'string')) throw Error('Invalid project assistant.')
    if (!assistant.profiles.every(profile => profile && ['id', 'name', 'modelId'].every(key => typeof profile[key] === 'string') && ['openai', 'local', 'custom'].includes(profile.provider)) || new Set(assistant.profiles.map(profile => profile.id)).size !== assistant.profiles.length) throw Error('Invalid model profiles.')
    const ids = new Set(assistant.profiles.map(profile => profile.id))
    if (assistant.selectedId !== null && !ids.has(assistant.selectedId) || !assistant.drafts.every(draft => draft && typeof draft.id === 'string' && typeof draft.text === 'string' && Number.isFinite(Date.parse(draft.createdAt)) && (draft.profileId === null || ids.has(draft.profileId))) || new Set(assistant.drafts.map(draft => draft.id)).size !== assistant.drafts.length) throw Error('Invalid assistant drafts.')
    if (assistant.messages !== undefined && (!Array.isArray(assistant.messages) || !assistant.messages.every(message => message && typeof message.id === 'string' && ids.has(message.profileId) && ['user', 'assistant'].includes(message.role) && typeof message.text === 'string' && Number.isFinite(Date.parse(message.createdAt))) || new Set(assistant.messages.map(message => message.id)).size !== assistant.messages.length)) throw Error('Invalid assistant messages.')
  }
  if (state.subscription !== undefined) {
    const s = state.subscription
    if (!s || typeof s !== 'object' || !['free', 'plus', 'studio'].includes(s.preferredPlan) || s.cycle !== 'monthly' || s.activePlan !== 'free' || s.paymentStatus !== 'not-connected') throw Error('Invalid subscription preparation. Paid entitlements require a connected billing backend.')
  }
  if (state.rewards !== undefined) {
    const r = state.rewards
    const record = value => value && typeof value === 'object' && !Array.isArray(value)
    const id = value => typeof value === 'string' && /^[a-z0-9][a-z0-9-]{0,39}$/.test(value)
    if (!record(r) || !id(r.selectedService)) throw Error('Invalid rewards.')
    if (r.tracks !== undefined) {
      if (!record(r.tracks)) throw Error('Invalid reward tracks.')
      for (const [serviceId, track] of Object.entries(r.tracks)) {
        if (!id(serviceId) || !record(track) || !record(track.stages) || !Object.entries(track.stages).every(([stageId, done]) => id(stageId) && typeof done === 'boolean') || typeof track.note !== 'string') throw Error('Invalid reward track.')
      }
    }
  }
  if (state.theme !== undefined) {
    const t = state.theme
    if (!t || !['color','season','month','hour','focus'].includes(t.mode) || typeof t.id !== 'string' || typeof t.automatic !== 'boolean') throw Error('Invalid theme.')
  }
  if (state.discover !== undefined) {
    const d = state.discover
    if (!d || !Array.isArray(d.order) || !Array.isArray(d.liked) || !Array.isArray(d.swiped) || !Number.isInteger(d.index) || d.index < 0 || d.index > d.order.length || new Set(d.order).size !== d.order.length || d.order.length !== 8) throw Error('Invalid Discover session.')
    if (![...d.order, ...d.liked, ...d.swiped].every(id => typeof id === 'string' && /^[1-8]$/.test(id))) throw Error('Invalid recipe reference.')
  }
  for (const p of state.aiPlans || []) {
    if (!p || typeof p.id !== 'string' || typeof p.name !== 'string' || !Array.isArray(p.days) || !Number.isFinite(Date.parse(p.generatedAt))) throw Error('Invalid AI plan.')
    for (const day of p.days) {
      if (!day || typeof day.day !== 'string' || !day.meals || !['breakfast','lunch','dinner'].every(key => typeof day.meals[key] === 'string') || !Array.isArray(day.ingredients) || !day.ingredients.every(item => typeof item === 'string')) throw Error('Invalid AI day.')
    }
  }
  return JSON.parse(json)
}

function inspectMedia(bytes) {
  if (!Buffer.isBuffer(bytes) || bytes.length === 0) throw Error('Media must be a non-empty file.')
  if (bytes.subarray(0, 8).equals(Buffer.from([137,80,78,71,13,10,26,10]))) return 'png'
  if (bytes[0] === 255 && bytes[1] === 216 && bytes[2] === 255) return 'jpg'
  if (/^GIF8[79]a$/.test(bytes.subarray(0, 6).toString('ascii'))) return 'gif'
  if (bytes.subarray(0, 4).toString() === 'RIFF' && bytes.subarray(8, 12).toString() === 'WEBP') return 'webp'
  if (bytes.subarray(4, 8).toString() === 'ftyp') return 'mp4'
  if (bytes.subarray(0, 4).equals(Buffer.from([26,69,223,163]))) return 'webm'
  throw Error('Supported media: PNG, JPEG, GIF, WebP, MP4, WebM.')
}

class DataStore {
  constructor(directory) {
    this.directory = directory
    this.mediaDirectory = path.join(directory, 'media')
    this.file = path.join(directory, 'data.json')
    this.queue = Promise.resolve()
  }
  async init() { await fs.mkdir(this.mediaDirectory, { recursive: true }) }
  async load() {
    try {
      const raw = await fs.readFile(this.file, 'utf8')
      const document = JSON.parse(raw)
      if (document.version !== 1) throw Error('Unsupported data version.')
      return validateState(document.state)
    } catch (error) {
      if (error.code === 'ENOENT') return {}
      throw Error('Saved data could not be read. Your files were left untouched. Restore a backup or data.previous.json.', { cause: error })
    }
  }
  save(state, recover = false) {
    const checked = validateState(state)
    const operation = this.queue.then(async () => {
      // Refuse to overwrite an existing corrupted file.
      let corrupt = false
      try { await this.load() }
      catch (error) {
        if (!recover) throw error
        await fs.copyFile(this.file, path.join(this.directory, `data.corrupt-${randomUUID()}.json`))
        corrupt = true
      }
      const temp = path.join(this.directory, `data-${randomUUID()}.tmp`)
      const handle = await fs.open(temp, 'wx', 0o600)
      try {
        await handle.writeFile(JSON.stringify({ version: 1, state: checked }))
        await handle.sync()
      } finally { await handle.close() }
      try {
        if (!corrupt) await fs.copyFile(this.file, path.join(this.directory, 'data.previous.json')).catch(e => { if (e.code !== 'ENOENT') throw e })
        await fs.rename(temp, this.file)
      } catch (error) { await fs.unlink(temp).catch(() => {}); throw error }
    })
    this.queue = operation.catch(() => {})
    return operation
  }
  async addMedia(bytes) {
    const ext = inspectMedia(bytes)
    const filename = `${createHash('sha256').update(bytes).digest('hex')}.${ext}`
    await fs.writeFile(path.join(this.mediaDirectory, filename), bytes, { flag: 'wx', mode: 0o600 }).catch(e => { if (e.code !== 'EEXIST') throw e })
    return { url: `mealmedia://local/${filename}`, kind: ext === 'gif' ? 'gif' : ['mp4','webm'].includes(ext) ? 'video' : 'photo' }
  }
  async backup() {
    await this.queue
    const state = await this.load()
    const names = new Set((state.keeps || []).filter(k => k.mediaUrl).map(k => k.mediaUrl.split('/').pop()))
    const media = []
    for (const name of names) {
      if (!mediaPattern.test(name)) throw Error('Invalid attachment name.')
      const bytes = await fs.readFile(path.join(this.mediaDirectory, name))
      media.push({ name, base64: bytes.toString('base64') })
    }
    return JSON.stringify({ format: 'personal-meal-planner', version: 1, exportedAt: new Date().toISOString(), state, media })
  }
  async restore(raw) {
    const backup = JSON.parse(raw)
    if (backup.format !== 'personal-meal-planner' || backup.version !== 1 || !Array.isArray(backup.media)) throw Error('Unsupported backup format.')
    const checked = validateState(backup.state)
    const media = new Map()
    for (const item of backup.media) {
      if (!item || typeof item.name !== 'string' || !mediaPattern.test(item.name) || typeof item.base64 !== 'string' || media.has(item.name)) throw Error('Invalid backup attachment.')
      const bytes = Buffer.from(item.base64, 'base64')
      const expected = `${createHash('sha256').update(bytes).digest('hex')}.${inspectMedia(bytes)}`
      if (expected !== item.name) throw Error('Backup attachment checksum mismatch.')
      media.set(item.name, bytes)
    }
    for (const keep of checked.keeps || []) if (keep.mediaUrl && !media.has(keep.mediaUrl.split('/').pop())) throw Error('Backup is missing a referenced attachment.')
    // All content is validated before any changes to current data.
    for (const bytes of media.values()) await this.addMedia(bytes)
    await this.save(checked, true)
  }
}

function backupFilename(now = new Date()) {
  const date = [now.getFullYear(), String(now.getMonth() + 1).padStart(2, '0'), String(now.getDate()).padStart(2, '0')].join('-')
  return `Meal-Planner-backup-${date}.json`
}

module.exports = { DataStore, validateState, inspectMedia, mediaPattern, mimeTypes, backupFilename }
