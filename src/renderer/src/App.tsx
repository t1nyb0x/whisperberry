import { Player } from '@renderer/../../voice/core/Player'
import { useEffect, useState } from 'react'

const player = new Player({
  // ここでは Renderer→Main→SAPI を経由
  speak: (t) => window.whisperberry.speak(t),
  stop: () => window.whisperberry.stop()
})

function App(): React.JSX.Element {
  const [inputText, setInputText] = useState<string>('')
  const [voices, setVoices] = useState<string[]>([])
  const [selected, setSelected] = useState<string>('Microsoft Haruka Desktop')

  useEffect(() => {
    window.whisperberry.listVoices().then(setVoices)
  }, [])

  return (
    <main className="p-4">
      <h1 className="text-xl mb-2">WhisperBerry</h1>

      {/* ③ テキスト入力欄 */}
      <textarea
        className="w-full h-32 p-2 border"
        value={inputText}
        onChange={(e) => setInputText(e.currentTarget.value)}
        placeholder="ここに読み上げたいテキストを入力…"
      />

      {/* ④ 声の選択ドロップダウン */}
      <div className="my-2">
        <label className="mr-2">Voice:</label>
        <select value={selected} onChange={(e) => setSelected(e.currentTarget.value)}>
          {voices.map((v) => (
            <option key={v} value={v}>
              {v}
            </option>
          ))}
        </select>
      </div>

      {/* ⑤ 再生ボタン */}
      <button
        className="px-4 py-2 bg-blue-600 text-white rounded"
        disabled={!inputText.trim()}
        onClick={() => player.enqueue(inputText, { voice: selected })}
      >
        読み上げスタート
      </button>
    </main>
  )
}

export default App
