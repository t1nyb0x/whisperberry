import { useEffect, useState } from 'react'

function App(): React.JSX.Element {
  const [enabled, setEnabled] = useState<boolean>(true)

  useEffect(() => {
    window.whisperberry.isEnabled().then(setEnabled)
  }, [])

  return (
    <main className="p-4">
      <h1 className="text-xl mb-4">WhisperBerry</h1>
      <button
        onClick={async () => {
          await window.whisperberry.toggle()
          setEnabled(await window.whisperberry.isEnabled())
        }}
      >
        {enabled ? 'Disable' : 'Enable'} Reading
      </button>
    </main>
  )
}

export default App
