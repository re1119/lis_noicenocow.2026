import { useCallback, useEffect, useRef, useState } from 'react'
import quiz from '../styles/quiz.module.css'

// 換畫面時，舊畫面淡出要多久
const FADE_MS = 400

// 網址 → 關卡裡的哪個畫面（intro 引導／question 作答或遊戲／success 通關）
// 作答頁的網址可能是 /question（Q1、Q2）、/game（Q3）或 /quiz（Q4），都算 'question'
function stepOf(path) {
  if (['/question', '/game', '/quiz'].some((end) => path.endsWith(end))) return 'question'
  if (path.endsWith('/success')) return 'success'
  return 'intro'
}

// 每一關共用的「舞台」：負責依網址切換畫面、淡入淡出、重播進場動畫
// base：這一關的網址開頭，例如 '/q1'
// playPath：作答頁的網址結尾，預設 'question'，Q3 是 'game'、Q4 是 'quiz'
// renderStep(step, tools)：要顯示哪個畫面由各關卡自己決定
export default function QuizStage({ base, playPath = 'question', label, path, active, navigate, renderStep }) {
  const step = stepOf(path)

  // shown：畫面上正在顯示的步驟。網址換了之後，舊畫面先淡出，再換成新的
  // 離開關卡（滑回進度頁）時保留最後一個畫面，不然滑出去的途中會突然變空白
  const [shown, setShown] = useState(step)
  const fading = active && step !== shown

  // 每次從進度頁「進入」關卡：直接換到對的畫面，並用 visit 當 key 讓進場動畫重播
  const [visit, setVisit] = useState(0)
  // entryStep：這次是從哪個畫面滑進來的。滑進來的那個畫面，動畫要等翻頁（1 秒）快結束才開始
  const [entryStep, setEntryStep] = useState(null)
  const wasActive = useRef(active)
  useEffect(() => {
    if (active && !wasActive.current) {
      setShown(step)
      setEntryStep(step)
      setVisit((v) => v + 1)
    }
    wasActive.current = active
  }, [active, step])

  // 在關卡裡換畫面（引導 → 作答 → 通關）：等淡出結束才換
  useEffect(() => {
    if (!fading) return
    const timer = setTimeout(() => setShown(step), FADE_MS)
    return () => clearTimeout(timer)
  }, [fading, step])

  // 用 useCallback 固定住這些函式，子畫面裡的計時器才不會被重設
  const goQuestion = useCallback(() => navigate(`${base}/${playPath}`, { replace: true }), [navigate, base, playPath])
  const goSuccess = useCallback(() => navigate(`${base}/success`, { replace: true }), [navigate, base])
  const goMenu = useCallback(() => navigate('/menu'), [navigate])

  return (
    <section className={quiz.stage} inert={!active} aria-label={label}>
      <div
        key={`${shown}-${visit}`}
        className={`${quiz.screen} ${fading ? quiz.fadeOut : ''}`}
        style={{ '--enter': shown === entryStep ? '0.8s' : '0s' }}
      >
        {/* screenActive：這個畫面真的在眼前（不是正在淡出、也不是滑走了） */}
        {renderStep(shown, { screenActive: active && !fading, goQuestion, goSuccess, goMenu })}
      </div>
    </section>
  )
}
