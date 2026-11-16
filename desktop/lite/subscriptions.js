export const monthlyPlans = [
  { id: 'free', name: 'Pohoda Základ', price: 'Stávající osobní prostor', features: ['Současné offline nástroje', 'Perky, quest log a vlastní postupy', 'Vlastní zálohy a exporty'] },
  { id: 'plus', name: 'Pohoda Plus', price: 'Měsíční cena bude stanovena', features: ['Připravovaný měsíční tarif', 'Směr rozvoje: rozšířená AI správa', 'Aktivace po připojení plateb a oprávnění'] },
  { id: 'studio', name: 'Pohoda Studio', price: 'Měsíční cena bude stanovena', features: ['Připravovaný měsíční tarif', 'Směr rozvoje: automatizace a širší workflows', 'Aktivace po připojení plateb a oprávnění'] },
]
export function setupSubscriptions({ getState, save }) {
  const $ = id => document.getElementById(id)
  function data() { const state = getState(); state.subscription ??= { preferredPlan: 'free', cycle: 'monthly', activePlan: 'free', paymentStatus: 'not-connected' }; return state.subscription }
  function render() {
    const list = $('subscription-plans'); list.replaceChildren()
    for (const plan of monthlyPlans) {
      const card = document.createElement('article'); card.className = 'subscription-plan'
      const title = document.createElement('h3'); title.textContent = plan.name
      const price = document.createElement('p'); price.textContent = plan.price
      const features = document.createElement('ul')
      for (const text of plan.features) { const item = document.createElement('li'); item.textContent = text; features.append(item) }
      const choose = document.createElement('button'); choose.type = 'button'; choose.textContent = data().preferredPlan === plan.id ? 'Preferovaný plán' : 'Zvolit jako preferovaný'
      choose.setAttribute('aria-pressed', String(data().preferredPlan === plan.id))
      choose.addEventListener('click', () => { data().preferredPlan = plan.id; save(); render() })
      card.append(title, price, features, choose); list.append(card)
    }
    $('subscription-status').textContent = 'Příprava předplatného: měsíční období. Platební brána není připojená. Nic se neúčtuje a placené oprávnění se neaktivuje.'
  }
  $('open-subscriptions').addEventListener('click', () => { render(); $('subscription-dialog').showModal() })
  $('subscription-close').addEventListener('click', () => $('subscription-dialog').close())
  return { render }
}
