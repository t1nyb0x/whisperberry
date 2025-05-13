import { contextBridge, ipcRenderer } from 'electron'

contextBridge.exposeInMainWorld('whisperberry', {
  speak: (text: string) => ipcRenderer.invoke('speak', text),
  stop: () => ipcRenderer.invoke('stop'),
  listVoices: () => ipcRenderer.invoke('list-voices')
})

declare global {
  interface Window {
    whisperberry: {
      toggle: () => Promise<void>
      isEnabled: () => Promise<boolean>
      speak: (text: string) => Promise<ArrayBuffer>
      stop: () => Promise<void>
    }
  }
}
