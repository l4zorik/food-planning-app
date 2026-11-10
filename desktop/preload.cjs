const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('personalDesktop', Object.freeze({
  load: () => ipcRenderer.invoke('data:load'),
  save: state => ipcRenderer.invoke('data:save', state),
  importMedia: () => ipcRenderer.invoke('media:import'),
  exportBackup: () => ipcRenderer.invoke('backup:export'),
  importBackup: () => ipcRenderer.invoke('backup:import'),
  savePdf: () => ipcRenderer.invoke('document:pdf'),
  close: () => ipcRenderer.invoke('app:close'),
  onClosing: callback => {
    const listener = () => callback()
    ipcRenderer.on('app:closing', listener)
    return () => ipcRenderer.removeListener('app:closing', listener)
  },
}))
