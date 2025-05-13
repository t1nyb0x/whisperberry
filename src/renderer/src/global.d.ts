export {}

declare global {
  interface Window {
    whisperberry: {
      // エンジン切替
      setEngine(engine: 'sapi' | 'voicevox'): Promise<boolean>
      setVoice(voice: string): Promise<boolean>
      getEngine(): Promise<'sapi' | 'voicevox'>
      listEngines(): Promise<('sapi' | 'voicevox')[]>
      // SAPI 用
      listVoices(): Promise<string[]>
      // VOICEVOX 用
      listSpeakers(): Promise<{ name: string; styles: { id: number; name: string }[] }[]>
      // 読み上げ
      speak(text: string, opts?: { voice?: string; speed?: number }): Promise<ArrayBuffer>
      stop(): Promise<void>
    }
  }
}
