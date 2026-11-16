const { test } = require('node:test')
const assert = require('node:assert/strict')
const { summarizeProject } = require('../desktop/assistant.cjs')

test('the AI context covers all seven sections, the quest log and the rewards floor', () => {
  const slots = Array.from({ length: 20 }, () => ({ active: false, problem: null, notes: '', workflows: [] }))
  slots[0] = { active: true, problem: { id: 'p1', name: 'Prokrastinace', tags: ['čas'] }, notes: 'Poznámka slotu', workflows: [{ id: 'w1', templateId: 't1', name: 'Ranní rozjezd', purpose: 'Začít den', tags: ['čas'], steps: [{ id: 's1', text: 'První krok', done: true }] }] }
  const state = {
    meals: { Monday: 'Polévka' },
    ingredients: { mléko: false, chléb: true },
    keeps: [{ title: 'Nápad na recept', group: 'Doma' }, { title: 'Bez skupiny', group: null }],
    management: { detox: [
      { active: true, problem: 'Prokrastinace', strategy: 'Pomodoro', plan: '25 minut', routine: [{ id: 'r1', text: 'Krok', done: true }] },
      { active: false, problem: '', strategy: '', plan: '', routine: [] },
      { active: false, problem: '', strategy: '', plan: '', routine: [] },
      { active: false, problem: '', strategy: '', plan: '', routine: [] },
      { active: false, problem: '', strategy: '', plan: '', routine: [] },
    ] },
    cheats: { slots },
    lifeFocus: { activeId: 'q1', quests: [{ id: 'q1', title: 'Směny 12h · 16.–22.11.', why: 'Priorita', sourceIndex: null, meaning: 'money', meaningTags: ['money', 'business'], steps: [{ id: 'a1', text: 'Noční směna 12h · pondělí 16.11.', done: false }], createdAt: '2026-11-16T08:00:00.000Z' }] },
    rewards: { selectedService: 'hygiene', tracks: { hygiene: { stages: { shower: true, laundry: false }, note: 'Poznámka k cestě' }, training: { stages: {}, note: '', subs: { mind: { stages: { focus: true } } } } }, essence: { slots: [{ id: 'housing-essence', serviceId: 'housing', title: 'Investiční portfolio nájemních bytů', done: false }] } },
    perks: { modules: [{ templateId: 'mind', name: 'Psychická pohoda', problem: 'Vyčerpanost', solution: 'Můj záměr', reflection: 'Moje opora' }], findings: [] },
    subscription: { preferredPlan: 'plus' },
  }
  const parsed = JSON.parse(summarizeProject(state))
  assert.equal(parsed.sections.week.Monday, 'Polévka')
  assert.deepEqual(parsed.sections.shopping.left, ['mléko'])
  assert.equal(parsed.sections.keeps.total, 2)
  assert.deepEqual(parsed.sections.keeps.groups, ['Doma'])
  assert.ok(parsed.sections.erp.includes('ERP'))
  assert.equal(parsed.sections.management.length, 1)
  assert.equal(parsed.sections.management[0].routineDone, 1)
  assert.equal(parsed.sections.lifehacks.length, 1)
  assert.equal(parsed.sections.lifehacks[0].problem, 'Prokrastinace')
  assert.equal(parsed.sections.wellbeing.reflection, 'Moje opora')
  assert.equal(parsed.sections.wellbeing.intention, 'Můj záměr')
  assert.equal(parsed.questLog.active, 'Směny 12h · 16.–22.11.')
  assert.equal(parsed.questLog.quests[0].next, 'Noční směna 12h · pondělí 16.11.')
  assert.equal(parsed.questLog.quests[0].done, 0)
  assert.equal(parsed.rewards.service, 'hygiene')
  assert.equal(parsed.rewards.stages.shower, true)
  assert.equal(parsed.rewards.note, 'Poznámka k cestě')
  assert.deepEqual(parsed.rewards.subs, {})
  assert.deepEqual(parsed.rewards.essence, [{ title: 'Investiční portfolio nájemních bytů', serviceId: 'housing', done: false }])
  const trainingState = { rewards: { selectedService: 'training', tracks: { training: { stages: {}, note: '', subs: { mind: { stages: { focus: true } }, god: { stages: {} } } } } } }
  const training = JSON.parse(summarizeProject(trainingState))
  assert.equal(training.rewards.subs.mind.stages.focus, true)
  assert.deepEqual(Object.keys(training.rewards.subs), ['mind', 'god'])
  assert.equal(summarizeProject(trainingState).length <= 20000, true)
  assert.equal(parsed.subscription, 'plus')
  assert.ok(parsed.modules.some(module => module.name === 'Psychická pohoda'))
})

test('an empty project still produces a valid overview within the size limit', () => {
  const parsed = JSON.parse(summarizeProject({}))
  assert.equal(parsed.questLog.active, null)
  assert.deepEqual(parsed.questLog.quests, [])
  assert.equal(parsed.rewards.service, 'housing')
  assert.ok(summarizeProject({}).length <= 20000)
  const withSource = { cheats: { slots: Array.from({ length: 20 }, () => ({ active: false, problem: null, notes: '', workflows: [] })) }, lifeFocus: { activeId: 'q', quests: [{ id: 'q', title: 'Quest', why: '', sourceIndex: 0, meaning: 'money', meaningTags: ['money'], steps: [], createdAt: '2026-11-16T08:00:00.000Z' }] } }
  const source = JSON.parse(summarizeProject(withSource))
  assert.equal(source.questLog.quests[0].total, 0)
})
