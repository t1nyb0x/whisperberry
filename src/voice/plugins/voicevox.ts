import { VoiceAdapter } from '../core/VoiceAdapter'

/** VOICEVOX Engine HTTP 経由アダプタ */
export class VoiceVoxAdapter implements VoiceAdapter {
  constructor(private host: string = 'http://127.0.0.1:50021') {}

  /** テキスト→WAV を返す */
  async speak(
    text: string,
    { voice = '1', speed = 1 }: { voice?: string; speed?: number } = {}
  ): Promise<ArrayBuffer> {
    // audio_query
    const qRes = await fetch(
      `${this.host}/audio_query?text=${encodeURIComponent(text)}&speaker=${voice}`,
      { method: 'POST' }
    )
    if (!qRes.ok) throw new Error(`audio_query failed: ${qRes.status}`)
    const query = await qRes.json()
    query.speedScale = speed

    // synthesis
    const sRes = await fetch(`${this.host}/synthesis?speaker=${voice}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(query)
    })
    if (!sRes.ok) throw new Error(`synthesis failed: ${sRes.status}`)
    return sRes.arrayBuffer()
  }

  /** 読み上げ停止は不要（Engine 側で管理） */
  stop?(): void {
    return
  }

  /** VOICEVOX の話者一覧を取得するメソッドを追加 */
  async listSpeakers(): Promise<{ name: string; styles: { id: number; name: string }[] }[]> {
    const res = await fetch(`${this.host}/speakers`, { method: 'GET' })
    if (!res.ok) throw new Error(`listSpeakers failed: ${res.status}`)
    return res.json()
  }
}
