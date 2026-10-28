import { useEffect } from 'react'
import quiz from '../styles/quiz.module.css'
import { tidy } from '../utils/tidyText.jsx'

// 引導頁是純過場：不能點，停留 4.5 秒後自動進入題目
// 計時從畫面「滑到定位」才算：翻頁轉場 1 秒 + 停留 4.5 秒
const SLIDE_MS = 1000
const STAY_MS = 4500

// 自動跳轉的計時器＋畫面底部那條慢慢畫滿的細線（告訴玩家「等一下就會繼續」）
// Q1～Q3 透過 QuizIntro 使用，Q4 有自己的引導頁，也直接用這兩個
export function useIntroTimer(active, onNext) {
  useEffect(() => {
    if (!active) return
    const timer = setTimeout(onNext, SLIDE_MS + STAY_MS)
    return () => clearTimeout(timer)
  }, [active, onNext])
}

export function IntroProgress() {
  return (
    <span
      className={quiz.introProgress}
      style={{ '--wait': `${SLIDE_MS / 1000}s`, '--stay': `${STAY_MS / 1000}s` }}
      aria-hidden="true"
    />
  )
}

// 每一關共用的引導頁：一段開場白＋一位懸浮的精靈
// children：開場白文字；img / alt：精靈圖片與說明
export default function QuizIntro({ active, onNext, img, alt, children }) {
  useIntroTimer(active, onNext)

  return tidy(
    <div className={quiz.intro}>
      <p className={quiz.introText}>{children}</p>
      <span className={quiz.introFigure}>
        <img src={`${import.meta.env.BASE_URL}${img}`} alt={alt} />
      </span>
      <IntroProgress />
    </div>
  )
}
