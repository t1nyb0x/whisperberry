import { VoiceAdapter } from './VoiceAdapter'

type SpeakOpts = { voice?: string; speed?: number }

interface QueueItem {
  text: string
  opts?: SpeakOpts
}

export class Player {
  private queue: QueueItem[] = []
  private playing = false
  private audio?: HTMLAudioElement

  constructor(private adapter: VoiceAdapter) {}

  enqueue(text: string, opts?: SpeakOpts): void {
    this.queue.push({ text, opts })
    if (!this.playing) {
      this.next()
    }
  }

  stop(): void {
    this.audio?.pause()
    this.queue = []
  }

  private async next(): Promise<void> {
    const item = this.queue.shift()
    if (!item) {
      this.playing = false
      return
    }

    this.playing = true
    try {
      const wav = await this.adapter.speak(item.text, item.opts)
      this.audio?.pause()
      this.audio = new Audio(URL.createObjectURL(new Blob([wav])))
      this.audio.onended = () => this.next()
      this.audio.play()
    } catch (err) {
      console.error('[Player] speak failed', err)
      this.next()
    }
  }
}
