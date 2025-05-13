import { clipboard } from 'electron'
import { VoiceAdapter } from '../voice/core/VoiceAdapter'

let lastText = '' // 最後に読んだクリップボードテキスト
let audio: HTMLAudioElement | null = null
let running = false // 読み上げ中かどうかのフラグ

export function startClipboardWatcher(
  getConfig: () => { engine: VoiceAdapter; voice: string }
): void {
  async function watchClipboard(): Promise<void> {
    if (running) return // 読み上げ中はスキップ

    const text = clipboard.readText().trim()
    if (text && text !== lastText) {
      lastText = text
      const { engine, voice } = getConfig()
      console.log('[Clipboard] Attempting to speak:', text, 'with voice:', voice)

      try {
        running = true
        const wav = await engine.speak(text, { voice })
        console.log('[Clipboard] Speech succeeded')

        const blob = new Blob([wav], { type: 'audio/wav' })
        const url = URL.createObjectURL(blob)

        audio?.pause()
        audio = new Audio(url)
        audio.onended = () => {
          running = false
          console.log('[Clipboard] Finished playing')
          setTimeout(watchClipboard, 1000) // 次の読み上げを再試行
        }
        audio.play()
        console.log('[Clipboard] Playing audio')
      } catch (err) {
        console.error('[Clipboard] Speech failed:', err)
        running = false
        setTimeout(watchClipboard, 1000) // エラーでも再試行
      }
    } else {
      // テキストが変更されていなければ次を確認
      setTimeout(watchClipboard, 1000)
    }
  }

  watchClipboard() // 初回起動
}
