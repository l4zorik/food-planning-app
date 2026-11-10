const { test } = require('node:test')
const assert = require('node:assert/strict')
const fs = require('node:fs/promises')
const os = require('node:os')
const path = require('node:path')
const { DataStore, validateState, inspectMedia } = require('../desktop/store.cjs')

async function fixture(t) {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), 'meal-planner-test-'))
  t.after(async () => { await fs.rm(root, { recursive: true, force: true }) })
  const store = new DataStore(root)
  await store.init()
  return store
}
const gif = Buffer.from('R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7', 'base64')

test('state survives restarting the store, with the preceding version retained', async t => {
  const store = await fixture(t)
  assert.deepEqual(await store.load(), {})
  await store.save({ meals: { Monday: 'Pasta' }, ingredients: { basil: true } })
  await store.save({ meals: { Tuesday: 'Soup' } })
  assert.deepEqual(await new DataStore(store.directory).load(), { meals: { Tuesday: 'Soup' } })
  const previous = JSON.parse(await fs.readFile(path.join(store.directory, 'data.previous.json'), 'utf8'))
  assert.equal(previous.state.meals.Monday, 'Pasta')
})
test('concurrent saves remain ordered and keep the last update', async t => {
  const store = await fixture(t)
  await Promise.all(Array.from({ length: 20 }, (_, i) => store.save({ meals: { Monday: String(i) } })))
  assert.equal((await store.load()).meals.Monday, '19')
})
test('media backups include bytes and restore on a different data directory', async t => {
  const first = await fixture(t), second = await fixture(t)
  const media = await first.addMedia(gif)
  await first.save({ keeps: [{ id: 'test', title: 'GIF', content: '', kind: 'gif', mediaUrl: media.url, createdAt: new Date().toISOString() }] })
  const backup = await first.backup()
  await second.restore(backup)
  assert.deepEqual(await second.load(), await first.load())
  assert.deepEqual(await fs.readFile(path.join(second.mediaDirectory, media.url.split('/').pop())), gif)
})
test('malformed backups, traversal, missing attachments and wrong hashes leave data intact', async t => {
  const store = await fixture(t)
  const original = { meals: { Friday: 'Keep me' } }
  await store.save(original)
  const base = { format: 'personal-meal-planner', version: 1, state: {}, media: [] }
  const wrongMedia = { name: '0'.repeat(64) + '.gif', base64: gif.toString('base64') }
  for (const backup of [
    'invalid JSON',
    JSON.stringify({ ...base, version: 2 }),
    JSON.stringify({ ...base, media: [{ ...wrongMedia, name: '../../evil.gif' }] }),
    JSON.stringify({ ...base, media: [wrongMedia] }),
    JSON.stringify({ ...base, state: { keeps: [{ id: 'x', title: '', content: '', kind: 'gif', createdAt: 'today', mediaUrl: 'mealmedia://local/' + wrongMedia.name }] } }),
    JSON.stringify({ ...base, state: { notes: [{ id: 'broken' }] } }),
  ]) {
    await assert.rejects(() => store.restore(backup))
    assert.deepEqual(await store.load(), original)
  }
})
test('corrupted data is preserved and only an explicit restore replaces it', async t => {
  const store = await fixture(t)
  await store.save({ meals: { Monday: 'Saved' } })
  const backup = await store.backup()
  await fs.writeFile(store.file, 'corrupt')
  await assert.rejects(() => store.load(), /left untouched/)
  await assert.rejects(() => store.save({}), /left untouched/)
  assert.equal(await fs.readFile(store.file, 'utf8'), 'corrupt')
  await store.restore(backup)
  assert.equal((await store.load()).meals.Monday, 'Saved')
  const files = await fs.readdir(store.directory)
  const corrupt = files.find(name => name.startsWith('data.corrupt-'))
  assert.equal(await fs.readFile(path.join(store.directory, corrupt), 'utf8'), 'corrupt')
})
test('reject executable or remote content, invalid sessions, and wrong saved types', () => {
  assert.throws(() => inspectMedia(Buffer.from('<html>executable</html>')))
  assert.throws(() => validateState({ arbitrary: {} }))
  assert.throws(() => validateState({ ingredients: { basil: 'true' } }))
  assert.throws(() => validateState({ discover: { order: ['1'], liked: [], swiped: [], index: 10 } }))
  assert.throws(() => validateState({ keeps: [{ id: 'x', title: '', content: '', kind: 'photo', createdAt: 'today', mediaUrl: 'https://remote.test/image.png' }] }))
  assert.equal(inspectMedia(gif), 'gif')
})
