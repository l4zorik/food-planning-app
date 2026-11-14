const fs = require('node:fs')
const path = require('node:path')

function startupId(argv) {
  const id = argv.find(value => value.startsWith('--meal-startup-id='))?.split('=')[1]
  return /^[a-f0-9]{32}$/.test(id || '') ? id : null
}

function reportStartup(directory, id, status, message) {
  if (!/^[a-f0-9]{32}$/.test(id || '')) return
  fs.mkdirSync(directory, { recursive: true })
  const filename = path.join(directory, `startup-${id}.json`)
  const temporary = filename + '.tmp'
  fs.writeFileSync(temporary, JSON.stringify({ status, message }), { mode: 0o600 })
  fs.renameSync(temporary, filename)
}

module.exports = { startupId, reportStartup }
