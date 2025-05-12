import { contextBridge, ipcRenderer } from 'electron'

contextBridge.exposeInMainWorld('whisperberry', {
  toggle: () => ipcRenderer.invoke('toggle'),
  isEnabled: () => ipcRenderer.invoke('status')
})

declare global {
  interface Window {
    whisperberry: {
      toggle: () => Promise<void>
      isEnabled: () => Promise<boolean>
    }
  }
}
