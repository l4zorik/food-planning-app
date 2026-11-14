fetch('mealapp://local/startup-brand.json').then(response => response.json()).then(brand => {
  document.getElementById('name').textContent = brand.name
  if (brand.logo) {
    const logo = document.createElement('img'); logo.src = brand.logo; logo.alt = brand.name
    const container = document.getElementById('logo')
    logo.addEventListener('error', () => { container.textContent = '◒' }, { once: true })
    container.replaceChildren(logo)
  }
}).catch(() => {})
