export {}

declare global {
  interface Window {
    whisperberry: {
      toggle: () => Promise<void>
      isEnabled: () => Promise<boolean>
    }
  }
}
