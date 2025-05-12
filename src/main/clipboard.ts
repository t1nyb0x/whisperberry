import { clipboard } from 'electron'

let lastText = ''

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export const startClipboardWatcher = (onText: (text: string) => void) => {
  setInterval(() => {
    const text = clipboard.readText()
    if (text && text !== lastText) {
      lastText = text
      onText(text)
    }
  }, 500)
}
