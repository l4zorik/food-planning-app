const { app, BrowserWindow, protocol, ipcMain, dialog, session } = require('electron')
const fs = require('node:fs/promises')
const { createReadStream } = require('node:fs')
const { Readable } = require('node:stream')
const path = require('node:path')
const { DataStore, mediaPattern, mimeTypes, MEDIA_LIMIT, BACKUP_LIMIT } = require('./store.cjs')

app.setName('My Meal Planner Lite')
app.setAppUserModelId('cz.personal.mealplanner')
// Keep Lite compatible with machines that cannot start Chromium's GPU process.
app.disableHardwareAcceleration()
if (!app.isPackaged) {
  const localData = path.resolve(__dirname, process.env.MEAL_PLANNER_SMOKE === '1' ? `../.runtime/smoke-data-${process.pid}` : '../.local-data')
  require('node:fs').mkdirSync(localData, { recursive: true })
  app.setPath('userData', localData)
  app.setPath('sessionData', localData)
  app.setAppLogsPath(path.join(localData, 'logs'))
}
protocol.registerSchemesAsPrivileged([
  { scheme: 'mealapp', privileges: { standard: true, secure: true, supportFetchAPI: true } },
  { scheme: 'mealmedia', privileges: { standard: true, secure: true, supportFetchAPI: true, stream: true } },
])
const csp = "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' mealmedia: data:; media-src mealmedia:; connect-src 'self'; font-src 'self' data:; object-src 'none'; frame-src 'none'; base-uri 'none'; form-action 'none'"
let window, store, closing = false, closeTimer
function trusted(event) {
  if (!window || event.sender !== window.webContents || event.senderFrame !== window.webContents.mainFrame || !/^mealapp:\/\/local\/(index\.html)?$/.test(event.senderFrame.url)) throw Error('Untrusted request.')
}
function handle(channel, callback) {
  ipcMain.handle(channel, async (event, ...args) => { trusted(event); return callback(...args) })
}
async function readLimited(filename, max) {
  const stat = await fs.stat(filename)
  if (!stat.isFile() || stat.size > max) throw Error('The selected file is too large.')
  return fs.readFile(filename)
}
async function serveMedia(request) {
  const url = new URL(request.url)
  const name = url.pathname.slice(1)
  if (url.hostname !== 'local' || !mediaPattern.test(name) || !['GET', 'HEAD'].includes(request.method)) return new Response(null, { status: 404 })
  const filename = path.join(store.mediaDirectory, name)
  try {
    const stat = await fs.stat(filename)
    let start = 0, end = stat.size - 1, status = 200
    const headers = { 'Content-Type': mimeTypes[name.split('.').pop()], 'Accept-Ranges': 'bytes', 'X-Content-Type-Options': 'nosniff' }
    const range = request.headers.get('Range')
    if (range) {
      const match = /^bytes=(\d*)-(\d*)$/.exec(range)
      if (!match || (!match[1] && !match[2])) return new Response(null, { status: 416, headers: { 'Content-Range': `bytes */${stat.size}` } })
      start = match[1] ? Number(match[1]) : Math.max(0, stat.size - Number(match[2]))
      end = match[1] && match[2] ? Math.min(Number(match[2]), end) : end
      if (!Number.isSafeInteger(start) || !Number.isSafeInteger(end) || start > end || start >= stat.size) return new Response(null, { status: 416, headers: { 'Content-Range': `bytes */${stat.size}` } })
      status = 206
      headers['Content-Range'] = `bytes ${start}-${end}/${stat.size}`
    }
    headers['Content-Length'] = String(end - start + 1)
    return new Response(request.method === 'HEAD' ? null : Readable.toWeb(createReadStream(filename, { start, end })), { status, headers })
  } catch { return new Response(null, { status: 404 }) }
}

function createWindow() {
  window = new BrowserWindow({
    width: 1250, height: 850, minWidth: 560, minHeight: 600, show: false,
    title: 'My Meal Planner Lite', backgroundColor: '#f8f7f4',
    webPreferences: { preload: path.join(__dirname, 'preload.cjs'), contextIsolation: true, nodeIntegration: false, sandbox: true, webSecurity: true, devTools: !app.isPackaged },
  })
  window.webContents.setWindowOpenHandler(() => ({ action: 'deny' }))
  window.webContents.on('will-navigate', event => event.preventDefault())
  window.webContents.on('will-attach-webview', event => event.preventDefault())
  window.on('close', event => {
    if (closing) return
    event.preventDefault()
    window.webContents.send('app:closing')
    clearTimeout(closeTimer)
    closeTimer = setTimeout(() => {
      if (window && !window.isDestroyed()) dialog.showErrorBox('Saving is not finished', 'The window stayed open so your latest changes are not discarded. Check the save status and try again.')
    }, 10000)
  })
  window.once('ready-to-show', () => window.show())
  window.webContents.on('did-fail-load', () => { dialog.showErrorBox('App could not start', 'Build the desktop renderer with the desktop setup script.'); closing = true; app.quit() })
  window.loadURL('mealapp://local/index.html')
}

if (!app.requestSingleInstanceLock()) app.quit()
else {
  app.on('second-instance', () => { if (window) { if (window.isMinimized()) window.restore(); window.focus() } })
  app.whenReady().then(async () => {
    store = new DataStore(path.join(app.getPath('userData'), 'personal-data'))
    await store.init()
    protocol.handle('mealmedia', serveMedia)
    protocol.handle('mealapp', async request => {
      const url = new URL(request.url)
      if (url.hostname !== 'local' || request.method !== 'GET') return new Response(null, { status: 404 })
      let relative
      try { relative = decodeURIComponent(url.pathname).slice(1) || 'index.html' } catch { return new Response(null, { status: 400 }) }
      if (relative.includes('\\') || relative.split('/').some(p => p === '..' || p.startsWith('.'))) return new Response(null, { status: 404 })
      const ext = path.extname(relative)
      const types = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css', '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.webp': 'image/webp', '.gif': 'image/gif', '.woff2': 'font/woff2' }
      if (!types[ext]) return new Response(null, { status: 404 })
      const root = path.join(__dirname, 'lite')
      const filename = path.resolve(root, relative)
      if (!filename.startsWith(root + path.sep)) return new Response(null, { status: 404 })
      try { return new Response(await fs.readFile(filename), { headers: { 'Content-Type': types[ext], 'Content-Security-Policy': csp, 'X-Content-Type-Options': 'nosniff' } }) }
      catch { return new Response(null, { status: 404 }) }
    })
    session.defaultSession.setPermissionRequestHandler((_contents, _permission, callback) => callback(false))
    session.defaultSession.setPermissionCheckHandler(() => false)
    session.defaultSession.webRequest.onBeforeRequest((details, callback) => {
      const url = new URL(details.url)
      callback({ cancel: !(['mealapp:', 'mealmedia:'].includes(url.protocol) && url.hostname === 'local') && url.protocol !== 'data:' })
    })
    handle('data:load', async () => ({ state: await store.load(), directory: store.directory }))
    handle('data:save', state => store.save(state))
    handle('media:import', async () => {
      const result = await dialog.showOpenDialog(window, { properties: ['openFile'], filters: [{ name: 'Photos, GIFs and videos', extensions: ['png','jpg','jpeg','gif','webp','mp4','webm'] }] })
      if (result.canceled) return null
      const selected = result.filePaths[0]
      const media = await store.addMedia(await readLimited(selected, MEDIA_LIMIT))
      return { ...media, name: path.basename(selected) }
    })
    handle('backup:export', async () => {
      const result = await dialog.showSaveDialog(window, { defaultPath: `Meal-Planner-backup-${new Date().toISOString().slice(0, 10)}.json`, filters: [{ name: 'Meal Planner backup', extensions: ['json'] }] })
      if (result.canceled || !result.filePath) return false
      await fs.writeFile(result.filePath, await store.backup(), { mode: 0o600 })
      return true
    })
    handle('backup:import', async () => {
      const result = await dialog.showOpenDialog(window, { properties: ['openFile'], filters: [{ name: 'Meal Planner backup', extensions: ['json'] }] })
      if (result.canceled) return false
      const confirmation = await dialog.showMessageBox(window, { type: 'question', buttons: ['Cancel', 'Restore backup'], defaultId: 0, cancelId: 0, message: 'Replace current data with this backup?', detail: 'The previous saved data will be retained on disk. All changes since the backup will be replaced.' })
      if (confirmation.response !== 1) return false
      await store.queue
      await store.restore((await readLimited(result.filePaths[0], BACKUP_LIMIT)).toString('utf8'))
      return true
    })
    handle('document:pdf', async () => {
      const result = await dialog.showSaveDialog(window, { defaultPath: 'Meal-Planner-A4.pdf', filters: [{ name: 'PDF document', extensions: ['pdf'] }] })
      if (result.canceled || !result.filePath) return false
      const pdf = await window.webContents.printToPDF({ pageSize: 'A4', printBackground: true, preferCSSPageSize: true })
      await fs.writeFile(result.filePath, pdf, { mode: 0o600 })
      return true
    })
    handle('app:close', async () => { await store.queue; closing = true; clearTimeout(closeTimer); window.close() })
    createWindow()
  }).catch(error => { dialog.showErrorBox('App error', error.message); app.quit() })
  app.on('window-all-closed', () => app.quit())
}
