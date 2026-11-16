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

test('five team-selected services each carry their own grounding stages', () => {
  assert.equal(rewardServices[0].id, 'housing')
  assert.deepEqual(rewardServices.map(service => service.id), ['housing', 'hygiene', 'fitness', 'dating', 'transport'])
  assert.deepEqual(rewardServices.map(service => service.number), ['01', '02', '03', '04', '05'])
  assert.ok(rewardServices.every(service => service.status === 'active'))
  assert.ok(rewardServices.every(service => service.stages.length >= 4 && service.stages.every(stage => stage.id && stage.name && stage.text)))
  assert.deepEqual(housingStages.map(stage => stage.id), ['work', 'rent', 'investment', 'foundation'])
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
  assert.equal($('reward-service-count').children[0].textContent, '5')
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
})

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
