const fs = require('node:fs/promises')
const path = require('node:path')

class Branding {
  constructor(directory) { this.directory = path.join(directory, 'branding') }
  async load() {
    try {
      const brand = JSON.parse(await fs.readFile(path.join(this.directory, 'brand.json'), 'utf8'))
      return { name: typeof brand.name === 'string' ? brand.name.slice(0, 80) : 'Meal Planner', logo: ['logo.png', 'logo.jpg'].includes(brand.logo) ? brand.logo : null }
    } catch { return { name: 'Meal Planner', logo: null } }
  }
  async public() {
    const brand = await this.load()
    return { name: brand.name, logo: brand.logo ? `mealapp://local/business-logo/${brand.logo}?v=${Date.now()}` : null }
  }
  async save(name, png) {
    if (typeof name !== 'string' || !name.trim() || name.trim().length > 80) throw Error('Název firmy musí mít 1 až 80 znaků.')
    await fs.mkdir(this.directory, { recursive: true })
    const brand = await this.load()
    if (png) {
      await fs.writeFile(path.join(this.directory, 'logo.png.tmp'), png)
      await fs.rename(path.join(this.directory, 'logo.png.tmp'), path.join(this.directory, 'logo.png'))
      brand.logo = 'logo.png'
    }
    await fs.writeFile(path.join(this.directory, 'brand.json.tmp'), JSON.stringify({ name: name.trim(), logo: brand.logo }))
    await fs.rename(path.join(this.directory, 'brand.json.tmp'), path.join(this.directory, 'brand.json'))
    return this.public()
  }
}
module.exports = { Branding }
