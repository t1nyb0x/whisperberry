import { clipboard } from 'electron'

let lastText = ''

export const startClipboardWatcher = (onText: (text: string) => void): void => {
  setInterval(() => {
    const text = clipboard.readText()
    if (text && text !== lastText) {
      lastText = text
      onText(text)
    }
  }, 500)
}
