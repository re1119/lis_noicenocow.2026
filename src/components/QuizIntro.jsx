import { useEffect } from 'react'
import quiz from '../styles/quiz.module.css'

// 引導頁停留多久後自動進入題目：翻頁轉場 1 秒 + 停留 3 秒
const INTRO_MS = 4000

// 每一關共用的引導頁：一段開場白＋一位懸浮的精靈
// children：開場白文字；img / alt：精靈圖片與說明
export default function QuizIntro({ active, onNext, img, alt, children }) {
  // 停留一段時間後自動進入題目
  useEffect(() => {
    if (!active) return
    const timer = setTimeout(onNext, INTRO_MS)
    return () => clearTimeout(timer)
  }, [active, onNext])

  return (
    // 整個畫面都是按鈕：點任何地方都能提早開始
    <button type="button" className={quiz.intro} onClick={onNext} aria-label="開始作答">
      <p className={quiz.introText}>{children}</p>
      <span className={quiz.introFigure}>
        <img src={`${import.meta.env.BASE_URL}${img}`} alt={alt} />
      </span>
      <span className={quiz.tapHint} aria-hidden="true">
        點一下畫面繼續
      </span>
    </button>
  )
}
