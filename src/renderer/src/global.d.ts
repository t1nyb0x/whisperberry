export {}

declare global {
  interface Window {
    whisperberry: {
      speak(text: string): Promise<ArrayBuffer>
      stop(): Promise<void> | void
      listVoices(): Promise<string[]>
    }
  }
}
