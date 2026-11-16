import { test } from 'node:test'
import assert from 'node:assert/strict'
import { rewardServices, housingStages, ensureRewards, rewardProgress, setupRewards } from '../desktop/lite/rewards.js'
import { renderDailyProgress } from '../desktop/lite/routine-board.js'
import { milestoneScore } from '../desktop/lite/routine-model.js'
import { validateState } from '../desktop/store.cjs'
import { problemDocument } from './helpers/problem-dom.mjs'

function withDocument(callback) {
  const previous = globalThis.document
  globalThis.document = problemDocument()
  try { callback(document.getElementById) } finally { globalThis.document = previous }
}

test('rewards default to the housing service on older data and repair partial tracks', () => {
  const state = {}
  ensureRewards(state)
  assert.equal(state.rewards.selectedService, 'housing')
  assert.deepEqual(Object.keys(state.rewards.tracks.housing.stages), ['work', 'rent', 'investment', 'foundation'])
  assert.deepEqual(Object.keys(state.rewards.tracks.hygiene.stages), ['shower', 'nails', 'hair', 'shave', 'laundry'])
  assert.deepEqual(Object.keys(state.rewards.tracks.transport.stages), ['licence', 'car', 'service', 'reliable'])
  assert.equal(rewardProgress(state.rewards.tracks.housing).percent, 0)
  state.rewards.tracks.housing.stages.work = true
  state.rewards.tracks.housing.note = 'Moje poznámka'
  ensureRewards(state)
  assert.equal(state.rewards.tracks.housing.stages.work, true)
  assert.equal(state.rewards.tracks.housing.note, 'Moje poznámka')
  const broken = { rewards: { selectedService: 'unknown', tracks: { housing: { stages: { work: 'yes', rent: true } } } } }
  ensureRewards(broken)
  assert.equal(broken.rewards.selectedService, 'housing')
  assert.equal(broken.rewards.tracks.housing.stages.work, false)
  assert.equal(broken.rewards.tracks.housing.stages.rent, true)
  assert.equal(broken.rewards.tracks.housing.note, '')
  assert.doesNotThrow(() => validateState(structuredClone(broken)))
})

test('fifteen team-selected services carry grounding stages, three of them premium', () => {
  assert.equal(rewardServices[0].id, 'housing')
  assert.deepEqual(rewardServices.map(service => service.id), ['housing', 'hygiene', 'fitness', 'dating', 'transport', 'business', 'education', 'training', 'work', 'hobbies', 'ai', 'robotics', 'automation', 'children', 'parenting'])
  assert.deepEqual(rewardServices.map(service => service.number), ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12', '13', '14', '15'])
  assert.deepEqual(rewardServices.filter(service => service.status === 'premium').map(service => service.id), ['ai', 'robotics', 'automation'])
  assert.equal(rewardServices.filter(service => service.status === 'active').length, 12)
  assert.ok(rewardServices.every(service => service.status === 'active' || service.status === 'premium'))
  assert.ok(rewardServices.filter(service => !service.subs).every(service => service.stages.length >= 4 && service.stages.every(stage => stage.id && stage.name && stage.text)))
  const training = rewardServices.find(service => service.id === 'training')
  assert.deepEqual(training.subs.map(sub => sub.id), ['mind', 'body', 'soul', 'faith', 'god'])
  assert.ok(training.subs.every(sub => sub.stages.length === 4 && sub.stages.every(stage => stage.id && stage.name && stage.text)))
  assert.equal(housingStages.length, 4)
  assert.deepEqual(housingStages.map(stage => stage.id), ['work', 'rent', 'investment', 'foundation'])
  assert.equal(rewardServices[0].essence, 'Investiční portfolio nájemních bytů')
  assert.deepEqual(rewardProgress({ stages: { work: true, rent: true } }), { done: 2, total: 4, percent: 50 })
  assert.equal(rewardProgress(undefined).done, 0)
})

test('bottom floor and reward dialog show the path, save stages and reach the calm home', () => withDocument($ => {
  let saves = 0
  const state = {}
  const ui = setupRewards({ getState: () => state, save: () => saves++ })
  ui.render()
  assert.equal($('rewards-floor-stages').children.length, 4)
  assert.equal($('rewards-floor-label').textContent, '0/4 etap · 0 %')
  assert.equal($('rewards-floor-name').textContent, 'Bydlení & investice do nemovitosti')
  assert.ok($('rewards-hub-summary').textContent.includes('0 %'))
  assert.equal($('reward-dialog').open, false)
  $('rewards-open').emit('click')
  assert.equal($('reward-dialog').open, true)
  assert.equal($('reward-services').children.length, rewardServices.length)
  assert.equal($('reward-services').children[0].getAttribute('aria-pressed'), 'true')
  assert.equal($('reward-services').children[1].disabled, false)
  assert.equal($('reward-service-count').children[0].textContent, '12')
  assert.equal($('reward-service-count').children[1].textContent, ' služeb spuštěno · 3 premium')
  assert.equal($('reward-services').children[10].disabled, true) // 11 AI is premium
  assert.equal($('reward-services').children[10].getAttribute('aria-pressed'), 'false')
  // Every service keeps its own track: switching to Hygiena shows its five stages.
  $('reward-services').children[1].emit('click')
  assert.equal(state.rewards.selectedService, 'hygiene')
  assert.equal($('reward-stages').children.length, 5)
  assert.equal($('rewards-floor-name').textContent, 'Hygiena & péče o sebe')
  assert.equal($('reward-progress-label').textContent, '0/5 etap · 0 % k upravené a čisté hygieně')
  assert.equal($('reward-services').children[1].getAttribute('aria-pressed'), 'true')
  $('reward-services').children[0].emit('click')
  assert.equal(state.rewards.selectedService, 'housing')
  assert.equal($('reward-stages').children.length, housingStages.length)
  assert.equal($('reward-progress-label').textContent, '0/4 etap · 0 % k prvnímu investičnímu bytu')
  assert.equal($('reward-calm-state').hidden, true)
  for (const stage of $('reward-stages').children) { const check = stage.children[0]; check.checked = true; check.emit('change') }
  assert.equal($('reward-progress-label').textContent, '4/4 etap · 100 % k prvnímu investičnímu bytu')
  assert.equal($('reward-calm-state').hidden, false)
  assert.ok($('reward-calm-state').textContent.includes('Klidný domov'))
  assert.equal($('rewards-floor-label').textContent, '4/4 etap · 100 %')
  assert.equal($('rewards-hub-summary').textContent.includes('100 %'), true)
  assert.equal(state.rewards.tracks.housing.stages.foundation, true)
  assert.ok(saves >= housingStages.length)
  $('reward-note').value = 'Klidněji po večerech'; $('reward-note').emit('input')
  assert.equal(state.rewards.tracks.housing.note, 'Klidněji po večerech')
  $('reward-close').emit('click')
  assert.equal($('reward-dialog').open, false)
  $('rewards-hub-open').emit('click')
  assert.equal($('reward-dialog').open, true)
  ui.render()
  assert.equal($('rewards-floor-label').textContent, '4/4 etap · 100 %')
  assert.equal($('reward-note').value, 'Klidněji po večerech')
}))

test('saved reward data passes store validation while malformed tracks are rejected', () => {
  assert.deepEqual(validateState({ rewards: { selectedService: 'housing' } }).rewards, { selectedService: 'housing' })
  assert.doesNotThrow(() => validateState({ rewards: { selectedService: 'housing', tracks: { housing: { stages: { work: true, rent: false }, note: '' } } } }))
  assert.throws(() => validateState({ rewards: { selectedService: 'Housing!' } }))
  assert.throws(() => validateState({ rewards: { selectedService: 'housing', tracks: { housing: { stages: { work: 'yes' }, note: '' } } } }))
  assert.throws(() => validateState({ rewards: { selectedService: 'housing', tracks: { housing: { stages: { work: true }, note: 5 } } } }))
  assert.throws(() => validateState({ rewards: { selectedService: 'housing', tracks: 'housing' } }))
  // Premium services cannot be selected as the active track.
  assert.throws(() => validateState({ rewards: { selectedService: 'ai' } }))
  // Training keeps one track per subservice; the essence slots are products of the path.
  assert.doesNotThrow(() => validateState({ rewards: { selectedService: 'training', tracks: { training: { stages: {}, note: '', subs: { mind: { stages: { focus: true } } } } }, essence: { slots: [{ id: 'housing-essence', serviceId: 'housing', title: 'Investiční portfolio nájemních bytů', done: false }] } } }))
  assert.throws(() => validateState({ rewards: { selectedService: 'housing', tracks: { training: { stages: {}, note: '', subs: { mind: { stages: { focus: 'yes' } } } } } } }))
  assert.throws(() => validateState({ rewards: { selectedService: 'housing', essence: { slots: [{ id: 'housing-essence', serviceId: 'housing', title: 5, done: false }] } } }))
  assert.throws(() => validateState({ rewards: { selectedService: 'housing', essence: { slots: [{ id: 'dup', serviceId: 'housing', title: 'A', done: false }, { id: 'dup', serviceId: 'business', title: 'B', done: false }] } } }))
})

test('training slides out five subservices with their own tracks and progress', () => withDocument($ => {
  const state = {}
  let saves = 0
  const ui = setupRewards({ getState: () => state, save: () => saves++ })
  ui.render()
  $('rewards-open').emit('click')
  const cards = $('reward-services').children
  // Index 7 is Training (08).
  cards[7].emit('click')
  assert.equal(state.rewards.selectedService, 'training')
  assert.equal($('reward-subs').hidden, false)
  assert.equal($('reward-subs').children.length, 5)
  assert.deepEqual($('reward-subs').children.map(chip => chip.children[1].textContent), ['Mysl', 'Tělo', 'Duše', 'Víra', 'Bůh'])
  assert.equal($('reward-subs').children[0].getAttribute('aria-pressed'), 'true')
  // The floor aggregates all five subservices: 5 × 4 stages.
  assert.equal($('rewards-floor-label').textContent, '0/20 etap · 0 %')
  assert.equal($('rewards-floor-stages').children.length, 5)
  assert.equal($('reward-stages').children.length, 4)
  assert.ok($('reward-track-title').textContent.includes('Mysl'))
  // Checking a stage in Mysl updates its chip without touching Tělo.
  const check = $('reward-stages').children[0].children[0]
  check.checked = true; check.emit('change')
  assert.equal(state.rewards.tracks.training.subs.mind.stages.focus, true)
  assert.equal($('reward-subs').children[0].children[2].textContent, '1/4')
  assert.equal($('rewards-floor-label').textContent, '1/20 etap · 5 %')
  // Switching to the Tělo subservice shows its stages and keeps the track.
  $('reward-subs').children[1].emit('click')
  assert.equal($('reward-subs').children[1].getAttribute('aria-pressed'), 'true')
  assert.ok($('reward-track-title').textContent.includes('Tělo'))
  assert.equal($('reward-stages').children.length, 4)
  assert.equal($('reward-stages').children[0].children[0].checked, false)
  $('reward-stages').children[0].children[0].checked = true; $('reward-stages').children[0].children[0].emit('change')
  assert.equal(state.rewards.tracks.training.subs.body.stages.move, true)
  assert.equal($('rewards-floor-label').textContent, '2/20 etap · 10 %')
  assert.ok(saves >= 2)
  // Premium services stay locked even when clicked.
  cards[10].emit('click')
  assert.equal(state.rewards.selectedService, 'training')
  assert.equal($('reward-subs').hidden, false)
  ui.render()
  assert.equal($('reward-subs').children.length, 5)
}))

test('the material essence seeds its first slot and shows it on floor and dialog', () => withDocument($ => {
  const state = {}
  let saves = 0
  const ui = setupRewards({ getState: () => state, save: () => saves++ })
  ui.render()
  assert.equal(state.rewards.essence.slots.length, 1)
  assert.equal(state.rewards.essence.slots[0].id, 'housing-essence')
  assert.equal(state.rewards.essence.slots[0].serviceId, 'housing')
  assert.equal(state.rewards.essence.slots[0].title, 'Investiční portfolio nájemních bytů')
  assert.equal(state.rewards.essence.slots[0].done, false)
  assert.equal($('rewards-floor-essence').textContent, 'Investiční portfolio nájemních bytů')
  assert.doesNotThrow(() => validateState(structuredClone(state)))
  $('rewards-open').emit('click')
  assert.equal($('reward-essence').children.length, 1)
  const slot = $('reward-essence').children[0]
  assert.ok(slot.children[0].children[0].children[1].textContent.includes('Bydlení'))
  assert.equal(slot.children[0].children[1].children[0].textContent, 'Investiční portfolio nájemních bytů')
  // Marking the product done reaches the meaning of everything.
  const check = slot.children[1].children[0]
  check.checked = true; check.emit('change')
  assert.equal(state.rewards.essence.slots[0].done, true)
  assert.equal($('rewards-floor-essence').textContent, '✓ Investiční portfolio nájemních bytů')
  assert.ok(saves >= 1)
  // Older data without essence gains the slot on repair; existing slots survive.
  const older = { rewards: { selectedService: 'housing', tracks: {}, essence: { slots: [{ id: 'housing-essence', serviceId: 'housing', title: 'Investiční portfolio nájemních bytů', done: true }] } } }
  const repaired = { rewards: { selectedService: 'housing', tracks: {} } }
  ensureRewards(repaired)
  assert.equal(repaired.rewards.essence.slots.length, 1)
  ensureRewards(older)
  assert.equal(older.rewards.essence.slots.length, 1)
  assert.equal(older.rewards.essence.slots[0].done, true)
  assert.doesNotThrow(() => validateState(structuredClone(older)))
  // Re-running never duplicates the slot.
  ensureRewards(state)
  assert.equal(state.rewards.essence.slots.length, 1)
  assert.doesNotThrow(() => validateState(structuredClone(state)))
  ui.render()
  assert.equal($('reward-essence').children.length, 1)
}))

test('daily progress shows the calm home while XP values stay in the data', () => withDocument($ => {
  const slot = { dayProgress: {} }
  const daily = document.createElement('div')
  renderDailyProgress(daily, slot, () => {}, () => new Date(2026, 10, 16, 12))
  assert.equal(daily.querySelector('.daily-xp').textContent, '0/5 · klidný domov')
  const first = daily.querySelector('.daily-milestones').children[0]
  assert.equal(first.children[3].textContent, '+ klid')
  first.children[0].checked = true; first.children[0].emit('change')
  assert.equal(slot.dayProgress['2026-11-16'].wake, true)
  assert.equal(milestoneScore(slot.dayProgress['2026-11-16']).xp, 20)
  assert.equal(daily.querySelector('.daily-xp').textContent, '1/5 · klidný domov')
  assert.equal(daily.querySelector('.daily-xp').textContent.includes('XP'), false)
}))
