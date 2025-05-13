import say from 'say'
import { app, shell, BrowserWindow, ipcMain } from 'electron'
import path, { join } from 'path'
import { electronApp } from '@electron-toolkit/utils'
import icon from '../../resources/icon.png?asset'
import { SapiAdapter } from '../voice/plugins/sapi'
import { VoiceVoxAdapter } from '../voice/plugins/voicevox'
import { VoiceAdapter } from '../voice/core/VoiceAdapter'

// ① Adapter のマップ
const adapters: Record<'sapi' | 'voicevox', VoiceAdapter> = {
  sapi: new SapiAdapter(),
  voicevox: new VoiceVoxAdapter('http://localhost:50021')
}

let currentEngine: keyof typeof adapters = 'sapi'
let currentVoice: string = ''

// ② クリップボード監視を選択中のエンジン + 声で
startClipboardWatcher(() => ({
  engine: adapters[currentEngine],
  voice: currentVoice
}))

// ③ IPC でエンジン + 声 ID を変更
ipcMain.handle('setEngine', (_, engine: keyof typeof adapters) => {
  if (engine in adapters) {
    currentEngine = engine
    console.log('[Engine] Current engine switched to:', engine)
    return true
  }
  return false
})

ipcMain.handle('setVoice', (_, voice: string) => {
  currentVoice = voice
  console.log('[Voice] Current voice switched to:', voice)
  return true
})

ipcMain.handle('getEngine', () => currentEngine)
ipcMain.handle('getVoice', () => currentVoice)
ipcMain.handle('listEngines', () => Object.keys(adapters) as Array<keyof typeof adapters>)

// ④ SAPI の声一覧
ipcMain.handle('list-voices', () => {
  return new Promise<string[]>((resolve, reject) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ;(say.getInstalledVoices as any)((err: Error | null, voices: string[]) => {
      if (err) return reject(err)
      resolve(voices)
    })
  })
})

// ⑤ VOICEVOX の話者一覧
ipcMain.handle('list-speakers', async () => {
  const vvx = adapters.voicevox as VoiceVoxAdapter
  return vvx.listSpeakers()
})

// ⑥ 読み上げ／停止
ipcMain.handle('speak', (_e, text: string, opts?: { voice?: string; speed?: number }) => {
  const voice = opts?.voice || currentVoice
  return adapters[currentEngine].speak(text, { ...opts, voice })
})
ipcMain.handle('stop', () => adapters[currentEngine].stop?.())

// ⑦ クリップボード監視はエンジン + 声 ID を共有
import { clipboard } from 'electron'
function startClipboardWatcher(getConfig: () => { engine: VoiceAdapter; voice: string }): void {
  let lastText = ''

  setInterval(() => {
    const text = clipboard.readText().trim()
    if (text && text !== lastText) {
      lastText = text
      const { engine, voice } = getConfig()
      console.log('[Clipboard] Speaking:', text, 'with voice:', voice)

      engine.speak(text, { voice }).catch((err) => {
        console.error('[Clipboard] Failed to speak:', err)
      })
    }
  }, 1000)
}

let mainWindow: BrowserWindow | null = null

function createWindow(): void {
  mainWindow = new BrowserWindow({
    width: 900,
    height: 670,
    show: false,
    autoHideMenuBar: true,
    ...(process.platform === 'linux' ? { icon } : {}),
    webPreferences: {
      preload: path.join(__dirname, '../preload/index.js'),
      contextIsolation: true
    }
  })

  mainWindow.once('ready-to-show', () => {
    mainWindow?.show()
  })

  mainWindow.on('closed', () => {
    mainWindow = null
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  if (process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL']!)
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }
}

// This method will be called when Electron has finished
app.whenReady().then(() => {
  electronApp.setAppUserModelId('com.electron')
  createWindow()
})

// Quit when all windows are closed, except on macOS.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})
