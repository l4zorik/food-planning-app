const fs = require('node:fs/promises')
const path = require('node:path')
const { createHash, randomUUID } = require('node:crypto')

const STATE_LIMIT = 4 * 1024 * 1024
const MEDIA_LIMIT = 100 * 1024 * 1024
const BACKUP_LIMIT = 180 * 1024 * 1024
const allowedKeys = new Set(['meals', 'ingredients', 'notes', 'keeps', 'theme', 'discover', 'aiPlans'])
const mediaPattern = /^[a-f0-9]{64}\.(png|jpg|gif|webp|mp4|webm)$/
const mimeTypes = { png: 'image/png', jpg: 'image/jpeg', gif: 'image/gif', webp: 'image/webp', mp4: 'video/mp4', webm: 'video/webm' }

function validateState(state) {
  if (!state || typeof state !== 'object' || Array.isArray(state)) throw Error('Invalid saved data.')
  const json = JSON.stringify(state)
  if (Buffer.byteLength(json) > STATE_LIMIT) throw Error('Saved text data exceeds 4 MB.')
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
    if (keep.todos !== undefined && (!Array.isArray(keep.todos) || !keep.todos.every(item => item && typeof item.id === 'string' && typeof item.text === 'string' && typeof item.done === 'boolean'))) throw Error('Invalid to-do list.')
    if (keep.mediaUrl !== undefined && (typeof keep.mediaUrl !== 'string' || !/^mealmedia:\/\/local\/[a-f0-9]{64}\.(png|jpg|gif|webp|mp4|webm)$/.test(keep.mediaUrl))) throw Error('Import media into local storage before saving it.')
  }
  if (state.theme !== undefined) {
    const t = state.theme
    if (!t || !['color','season','month','hour'].includes(t.mode) || typeof t.id !== 'string' || typeof t.automatic !== 'boolean') throw Error('Invalid theme.')
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
  if (!Buffer.isBuffer(bytes) || bytes.length === 0 || bytes.length > MEDIA_LIMIT) throw Error('Media must be between 1 byte and 100 MB.')
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
      if (Buffer.byteLength(raw) > STATE_LIMIT + 1024) throw Error('Saved data is too large.')
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
    let total = 0
    for (const name of names) {
      if (!mediaPattern.test(name)) throw Error('Invalid attachment name.')
      const bytes = await fs.readFile(path.join(this.mediaDirectory, name))
      total += bytes.length
      if (total > MEDIA_LIMIT) throw Error('This backup exceeds the 100 MB attachment limit.')
      media.push({ name, base64: bytes.toString('base64') })
    }
    return JSON.stringify({ format: 'personal-meal-planner', version: 1, exportedAt: new Date().toISOString(), state, media })
  }
  async restore(raw) {
    if (Buffer.byteLength(raw) > BACKUP_LIMIT) throw Error('Backup is too large.')
    const backup = JSON.parse(raw)
    if (backup.format !== 'personal-meal-planner' || backup.version !== 1 || !Array.isArray(backup.media)) throw Error('Unsupported backup format.')
    const checked = validateState(backup.state)
    let total = 0
    const media = new Map()
    for (const item of backup.media) {
      if (!item || typeof item.name !== 'string' || !mediaPattern.test(item.name) || typeof item.base64 !== 'string' || media.has(item.name)) throw Error('Invalid backup attachment.')
      const bytes = Buffer.from(item.base64, 'base64')
      total += bytes.length
      if (total > MEDIA_LIMIT) throw Error('Backup attachments exceed 100 MB.')
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

module.exports = { DataStore, validateState, inspectMedia, mediaPattern, mimeTypes, MEDIA_LIMIT, BACKUP_LIMIT }
