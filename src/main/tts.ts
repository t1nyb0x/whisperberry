import sayOrig from 'say'
import { execSync } from 'node:child_process'

const say = sayOrig as typeof import('say')

// Linux で espeak / festival の存在をチェック
const hasTTS = (() => {
  if (process.platform !== 'linux') return true // mac / win は OS API
  try {
    execSync('command -v espeak-ng || command -v espeak || command -v festival')
    return true
  } catch {
    return false
  }
})()

let speaking = false

export function speak(text: string): void {
  if (!hasTTS) {
    console.warn('[TTS] No Linux speech backend; skipping.')
    return
  }

  if (speaking) {
    try {
      say.stop()
    } catch {
      /* ignore */
    }
    speaking = false
  }

  say.speak(text, undefined, 1.0, (err) => {
    if (err) {
      console.error('[TTS] speak failed', err)
      speaking = false
      return
    }
    speaking = true
  })
}
