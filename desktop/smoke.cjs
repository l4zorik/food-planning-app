const { app } = require('electron')
const fs = require('node:fs/promises')
const path = require('node:path')
process.env.MEAL_PLANNER_SMOKE = '1'
let timeout = setTimeout(() => { process.stderr.write('Desktop smoke timed out\n'); app.exit(1) }, 25000)
app.on('browser-window-created', (_event, window) => {
  window.webContents.once('did-finish-load', async () => {
    try {
      const result = await window.webContents.executeJavaScript(`(async () => {
        const wait = async check => { for (let n = 0; n < 100; n++) { if (check()) return; await new Promise(resolve => setTimeout(resolve, 50)); } throw Error('Renderer did not become ready'); };
        await wait(() => document.getElementById('save-status').textContent.includes('Uloženo'));
        if (typeof require !== 'undefined') throw Error('Node leaked into renderer');
        const input = document.querySelector('#days input');
        input.value = 'Smoke test pasta'; input.dispatchEvent(new Event('input', { bubbles: true }));
        document.querySelector('[data-view="keeps"]').click();
        document.getElementById('keep-title').value = 'Local keep';
        document.getElementById('keep-text').value = '<script>not executed</script>';
        document.getElementById('keep-form').dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
        document.getElementById('theme-mode').value = 'color';
        document.getElementById('theme-mode').dispatchEvent(new Event('change'));
        document.getElementById('theme-id').value = 'sage';
        document.getElementById('theme-id').dispatchEvent(new Event('change'));
        await wait(() => document.getElementById('save-status').textContent.includes('Uloženo'));
        const loaded = await window.personalDesktop.load();
        if (loaded.state.meals.Monday !== 'Smoke test pasta' || loaded.state.keeps[0].title !== 'Local keep') throw Error('Persistence failed');
        if (document.querySelector('#keep-cards script')) throw Error('Keep content was interpreted as HTML');
        document.querySelector('[data-view="week"]').click();
        return { saved: true, nodeIsolated: true, theme: loaded.state.theme.id, data: loaded.directory };
      })()`)
      const output = path.resolve(__dirname, '../.runtime')
      await fs.mkdir(output, { recursive: true })
      await fs.writeFile(path.join(output, 'lite-preview.png'), (await window.webContents.capturePage()).toPNG())
      const pdf = await window.webContents.printToPDF({ pageSize: 'A4', printBackground: true })
      if (!pdf.subarray(0, 4).equals(Buffer.from('%PDF'))) throw Error('PDF export failed')
      await fs.writeFile(path.join(output, 'lite-smoke-A4.pdf'), pdf)
      await fs.writeFile(path.join(output, 'lite-smoke-result.json'), JSON.stringify({ ...result, pdf: true }, null, 2))
      process.stdout.write(JSON.stringify({ ...result, pdf: true }) + '\n')
      clearTimeout(timeout)
      app.exit(0)
    } catch (error) { process.stderr.write(error.stack + '\n'); clearTimeout(timeout); app.exit(1) }
  })
})
require('./main.cjs')
