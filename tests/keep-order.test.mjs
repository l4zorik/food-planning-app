import { test } from 'node:test'
import assert from 'node:assert/strict'
import { moveKeep } from '../desktop/lite/keep-order.js'

test('moving Keeps works in both directions and beyond the former seven-card limit', () => {
  const keeps = Array.from({ length: 12 }, (_, id) => ({ id: String(id), content: `Text ${id}` }))
  const moved = moveKeep(keeps, '0', '11')
  assert.deepEqual(moved.map(keep => keep.id), ['1','2','3','4','5','6','7','8','9','10','11','0'])
  assert.deepEqual(moveKeep(moved, '0', '1'), keeps)
  assert.equal(keeps[0].id, '0')
  assert.equal(moved.at(-1), keeps[0])
  assert.equal(moveKeep(keeps, 'missing', '0'), keeps)
  assert.equal(moveKeep(keeps, '0', 'missing'), keeps)
  assert.equal(moveKeep(keeps, '0', '0'), keeps)
})
