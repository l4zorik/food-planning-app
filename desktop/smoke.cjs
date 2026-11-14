const { app } = require('electron')
const fs = require('node:fs/promises')
const path = require('node:path')
process.env.MEAL_PLANNER_SMOKE = '1'
let timeout = setTimeout(() => { process.stderr.write('Desktop smoke timed out\n'); app.exit(1) }, 25000)
let completed = false
app.on('before-quit', () => { if (!completed) { process.stderr.write('Desktop exited before smoke completed\n'); app.exit(1) } })
app.on('browser-window-created', (_event, window) => {
  window.webContents.on('render-process-gone', (_event, details) => {
    process.stderr.write(`Renderer failed: ${JSON.stringify(details)}\n`); app.exit(1)
  })
  window.webContents.once('did-finish-load', async () => {
    if (window.webContents.getURL() !== 'mealapp://local/index.html') return
    try {
      const result = await window.webContents.executeJavaScript(`(async () => {
        const wait = async check => { for (let n = 0; n < 100; n++) { if (check()) return; await new Promise(resolve => setTimeout(resolve, 50)); } throw Error('Renderer did not become ready'); };
        await wait(() => document.getElementById('save-status').textContent.includes('Uloženo'));
        await wait(() => document.getElementById('updates-dialog').open);
        if (!document.getElementById('release-version').textContent) throw Error('Missing release version');
        document.getElementById('continue-startup').click();
        document.getElementById('open-updates').click();
        if (!document.getElementById('updates-dialog').open) throw Error('Update log cannot be reopened');
        document.getElementById('close-updates').click();
        document.querySelector('[data-view="erp"]').click();
        if (document.getElementById('erp').hidden || !document.getElementById('week').hidden || document.querySelector('[data-view="erp"]').getAttribute('aria-pressed') !== 'true') throw Error('ERP navigation failed');
        document.querySelector('[data-view="week"]').click();
        if (!document.getElementById('erp').hidden || document.getElementById('week').hidden || document.querySelector('.welcome').hidden) throw Error('Returning from ERP failed');
        if (typeof require !== 'undefined') throw Error('Node leaked into renderer');
        const input = document.querySelector('#days input');
        input.value = 'Smoke test pasta'; input.dispatchEvent(new Event('input', { bubbles: true }));
        document.querySelector('[data-view="keeps"]').click();
        const originalCount = document.querySelectorAll('#keep-cards .keep-card').length;
        for (let n = 0; n < 9; n++) {
          document.getElementById('keep-title').value = 'Board growth ' + n;
          document.getElementById('keep-form').dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
        }
        const cards = document.querySelectorAll('#keep-cards .keep-card');
        if (cards.length !== originalCount + 9) throw Error('Keeps disappeared past the previous limit');
        if (cards[cards.length - 1].getBoundingClientRect().bottom <= cards[0].getBoundingClientRect().bottom) throw Error('Keeps board did not grow');
        const panelBounds = document.getElementById('keeps').getBoundingClientRect();
        if (cards[cards.length - 1].getBoundingClientRect().bottom > panelBounds.bottom) throw Error('Keeps overflowed the board');
        const movedId = cards[0].dataset.keepId;
        cards[0].scrollIntoView({ block: 'center' });
        let sourceBounds = cards[0].getBoundingClientRect();
        const startX = sourceBounds.left + 20, startY = sourceBounds.top + 20;
        cards[0].dispatchEvent(new PointerEvent('pointerdown', { button: 0, pointerId: 10, clientX: startX, clientY: startY, bubbles: true }));
        cards[cards.length - 1].scrollIntoView({ block: 'center' });
        const targetBounds = cards[cards.length - 1].getBoundingClientRect();
        const endX = targetBounds.left + 20, endY = targetBounds.top + 20;
        document.dispatchEvent(new PointerEvent('pointermove', { pointerId: 10, clientX: endX, clientY: endY, bubbles: true }));
        document.dispatchEvent(new PointerEvent('pointerup', { button: 0, pointerId: 10, clientX: endX, clientY: endY, bubbles: true }));
        if (document.querySelector('#keep-cards .keep-card:last-child').dataset.keepId !== movedId) throw Error('Keeps drag and drop failed');
        document.querySelector('#keep-cards .keep-card:last-child .keep-grip').dispatchEvent(new KeyboardEvent('keydown', { key: 'Home', bubbles: true, cancelable: true }));
        if (document.querySelector('#keep-cards .keep-card').dataset.keepId !== movedId) throw Error('Keeps keyboard movement failed');
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
        if (loaded.state.keeps.length !== originalCount + 10) throw Error('Keeps past the previous limit were not saved');
        if (loaded.state.keeps[1].id !== movedId) throw Error('Keeps order was not saved');
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
      completed = true
      app.exit(0)
    } catch (error) { process.stderr.write(error.stack + '\n'); clearTimeout(timeout); app.exit(1) }
  })
})
require('./main.cjs')
