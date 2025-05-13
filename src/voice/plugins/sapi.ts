import say from 'say'
import { VoiceAdapter } from '../core/VoiceAdapter'
import { join } from 'node:path'
import fs from 'node:fs'
import { tmpdir } from 'node:os'

const DEFAULT_VOICE = 'Microsoft Haruka Desktop'

export class SapiAdapter implements VoiceAdapter {
  async speak(text: string, opts?: { voice: string; speed: number }): Promise<ArrayBuffer> {
    const { voice = DEFAULT_VOICE, speed = 1 } = opts || {}
    const wavPath = join(tmpdir(), `whisper-berry-${Date.now()}.wav`)
    return new Promise<ArrayBuffer>((resolve, reject) => {
      say.export(text, voice, speed, wavPath, (err) => {
        if (err) return reject(err)
        const buf = fs.readFileSync(wavPath)
        fs.unlinkSync(wavPath)
        resolve(buf.buffer)
      })
    })
  }
  stop(): void {
    try {
      say.stop()
    } catch (error) {
      console.error('Error stopping speech:', error)
    }
  }
}
