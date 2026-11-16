export function setupProjectAssistant({ getState, save, api, flush = async () => {} }) {
  const $ = id => document.getElementById(id)
  let busy = false
  function data() { const state = getState(); state.projectAssistant ??= { selectedId: null, profiles: [], drafts: [] }; return state.projectAssistant }
  function render() {
    const value = data(), select = $('assistant-model'); select.replaceChildren()
    const empty = document.createElement('option'); empty.value = ''; empty.textContent = 'Zatím bez modelu'; select.append(empty)
    for (const profile of value.profiles) { const option = document.createElement('option'); option.value = profile.id; option.textContent = profile.name; select.append(option) }
    select.value = value.selectedId || ''
    $('assistant-draft-count').textContent = `${value.drafts.length} uložených zadání pro budoucí propojení`
    const list = $('assistant-drafts'); list.replaceChildren()
    for (const draft of value.drafts) { const entry = document.createElement('p'); entry.textContent = draft.text; list.append(entry) }
    const messages = $('assistant-messages'); messages.replaceChildren()
    for (const message of (value.messages || []).filter(item => item.profileId === value.selectedId)) {
      const entry = document.createElement('article'), label = document.createElement('strong'), text = document.createElement('p')
      entry.className = `assistant-message ${message.role}`; label.textContent = message.role === 'user' ? 'Já' : 'AI'; text.textContent = message.text
      entry.append(label, text); messages.append(entry)
    }
    $('assistant-chat-send').disabled = busy
  }
  $('assistant-model').addEventListener('change', () => { data().selectedId = $('assistant-model').value || null; save(); render() })
  $('assistant-settings').addEventListener('click', () => $('assistant-model-dialog').showModal())
  $('assistant-model-close').addEventListener('click', () => $('assistant-model-dialog').close())
  $('assistant-model-form').addEventListener('submit', async event => {
    event.preventDefault(); const name = $('assistant-profile-name').value.trim(), modelId = $('assistant-profile-model').value.trim(); if (!name || !modelId) return
    const profile = { id: crypto.randomUUID(), name, modelId, provider: $('assistant-profile-provider').value }
    if (api?.configureAssistant) {
      try {
        await api.configureAssistant({ profile, apiKey: $('assistant-api-key').value, endpoint: $('assistant-local-endpoint').value || 'http://127.0.0.1:11434' })
      } catch (error) { $('assistant-model-feedback').textContent = error.message; return }
      finally { $('assistant-api-key').value = '' }
    }
    data().profiles.push(profile); data().selectedId = profile.id; save(); render(); $('assistant-model-dialog').close(); $('assistant-profile-name').value = ''; $('assistant-profile-model').value = ''
  })
  $('assistant-chat-form').addEventListener('submit', async event => {
    event.preventDefault(); if (busy) return
    const profile = data().profiles.find(item => item.id === data().selectedId), text = $('assistant-chat-prompt').value.trim()
    if (!profile || !text) { $('assistant-chat-status').textContent = 'Vyber připojený profil modelu a napiš zprávu.'; return }
    if (!api?.chatAssistant) { $('assistant-chat-status').textContent = 'AI chat vyžaduje spuštění v desktopové aplikaci.'; return }
    const target = data(); target.messages ??= []
    target.messages.push({ id: crypto.randomUUID(), profileId: profile.id, role: 'user', text, createdAt: new Date().toISOString() })
    $('assistant-chat-prompt').value = ''; busy = true; save(); render(); $('assistant-chat-status').textContent = 'Model odpovídá…'
    try {
      await flush()
      const messages = target.messages.filter(item => item.profileId === profile.id).slice(-40).map(({ role, text }) => ({ role, text }))
      const result = await api.chatAssistant({ profile, messages, includeContext: $('assistant-include-context').checked === true })
      if (target !== data()) throw Error('Data projektu se mezitím změnila; odpověď nebyla přidána do obnovené zálohy.')
      target.messages.push({ id: crypto.randomUUID(), profileId: profile.id, role: 'assistant', text: result.text, createdAt: new Date().toISOString() }); save(); $('assistant-chat-status').textContent = 'Odpověď uložena. Změny projektu se samy neprovádějí.'
    } catch (error) { $('assistant-chat-status').textContent = error.message }
    finally { busy = false; render() }
  })
  $('assistant-draft-form').addEventListener('submit', event => {
    event.preventDefault(); const text = $('assistant-prompt').value.trim(); if (!text) return
    data().drafts.push({ id: crypto.randomUUID(), profileId: data().selectedId, text, createdAt: new Date().toISOString() }); $('assistant-prompt').value = ''; save(); render()
  })
  return { render }
}
