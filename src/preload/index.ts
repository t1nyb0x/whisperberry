import { contextBridge, ipcRenderer } from 'electron'

contextBridge.exposeInMainWorld('whisperberry', {
  setEngine: (engine: 'sapi' | 'voicevox') => ipcRenderer.invoke('setEngine', engine),
  setVoice: (voice: string) => ipcRenderer.invoke('setVoice', voice),
  getEngine: () => ipcRenderer.invoke('getEngine'),
  listEngines: () => ipcRenderer.invoke('listEngines'),
  // SAPI 用
  listVoices: () => ipcRenderer.invoke('list-voices'),
  // VOICEVOX 用
  listSpeakers: () => ipcRenderer.invoke('list-speakers'),
  speak: (t, opts) => ipcRenderer.invoke('speak', t, opts),
  stop: () => ipcRenderer.invoke('stop')
})
