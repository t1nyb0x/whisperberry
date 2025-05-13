// App.tsx
import { useState, useEffect, JSX } from 'react'
import { Player } from '@renderer/../../voice/core/Player'

const player = new Player({
  speak: (t, opts) => window.whisperberry.speak(t, opts),
  stop: () => window.whisperberry.stop()
})

export default function App(): JSX.Element {
  const [engine, setEngine] = useState<'sapi' | 'voicevox'>('sapi')
  const [voices, setVoices] = useState<{ name: string; id: string }[]>([])
  const [selectedVoice, setSelectedVoice] = useState<string>('')
  const [inputText, setInputText] = useState<string>('')

  useEffect(() => {
    // 初回起動時にエンジン取得
    window.whisperberry.getEngine().then((currentEngine) => {
      setEngine(currentEngine)
    })
  }, [])

  // エンジン変更時に対応する声リストを取得
  useEffect(() => {
    if (engine === 'sapi') {
      window.whisperberry.listVoices().then((list) => {
        const sapiVoices = list.map((v) => ({ name: v, id: v }))
        setVoices(sapiVoices)
        setSelectedVoice(sapiVoices[0]?.id ?? '')
        window.whisperberry.setVoice(sapiVoices[0]?.id ?? '')
      })
    } else {
      window.whisperberry.listSpeakers().then((speakers) => {
        const vvoxVoices = speakers.flatMap((s) =>
          s.styles.map((st) => ({
            name: `${s.name} - ${st.name}`,
            id: `${st.id}`
          }))
        )
        setVoices(vvoxVoices)
        setSelectedVoice(vvoxVoices[0]?.id ?? '')
        window.whisperberry.setVoice(vvoxVoices[0]?.id ?? '')
      })
    }
  }, [engine])

  // ボイス変更で即反映
  const changeVoice = (voice: string): void => {
    setSelectedVoice(voice)
    window.whisperberry.setVoice(voice)
  }

  // エンジン変更時のハンドラ
  const changeEngine = (newEngine: 'sapi' | 'voicevox'): void => {
    setEngine(newEngine)
    window.whisperberry.setEngine(newEngine)
  }

  return (
    <div>
      <h1>WhisperBerry</h1>
      {/* エンジン選択 */}
      <div>
        <label>Engine:</label>
        <select
          value={engine}
          onChange={(e) => changeEngine(e.target.value as 'sapi' | 'voicevox')}
        >
          <option value="sapi">SAPI</option>
          <option value="voicevox">VOICEVOX</option>
        </select>
      </div>

      {/* 声選択 */}
      <div>
        <label>Voice:</label>
        <select value={selectedVoice} onChange={(e) => changeVoice(e.target.value)}>
          {voices.map((v) => (
            <option key={v.id} value={v.id}>
              {v.name}
            </option>
          ))}
        </select>
      </div>

      {/* テキスト入力 */}
      <textarea
        className="w-full h-32 p-2 border mb-4"
        placeholder="ここに読み上げたいテキストを入力…"
        value={inputText}
        onChange={(e) => setInputText(e.target.value)}
      />

      {/* 読み上げボタン */}
      <button
        className="px-4 py-2 bg-blue-600 text-white rounded"
        disabled={!inputText.trim()}
        onClick={() => player.enqueue(inputText, { voice: selectedVoice })}
      >
        読み上げスタート
      </button>
    </div>
  )
}
