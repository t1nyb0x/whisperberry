export interface VoiceAdapter {
  speak(text: string, opts?: { voice?: string; speed?: number }): Promise<ArrayBuffer>
  stop?(): void
}
