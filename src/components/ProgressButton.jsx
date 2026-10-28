import { isSolved } from '../hooks/useUnlocked.js'
import quiz from '../styles/quiz.module.css'

const QUIZZES = ['Q1', 'Q2', 'Q3', 'Q4']

// 通關頁的按鈕文字：依「已經破了幾關」一步步推進，像集點卡一格一格蓋章
const LABELS = {
  1: '獲得第 1 個精靈！繼續尋寶',
  2: '進度 50%！去看看下一個角落',
  3: '只差最後一塊拼圖了！前往最終關卡',
  4: '圖鑑收集完成！領取專屬獎勵',
}

// 已經破了幾關：這一關（current）就算還沒寫進 LocalStorage，也一定算進去
export function solvedCount(current) {
  return QUIZZES.filter((q) => q === current || isSolved(q)).length
}

export function progressLabel(current) {
  return LABELS[solvedCount(current)]
}

// 通關頁底部的按鈕：沒破完 → 回尋寶地圖；四關全破 → 直接去領獎（結局頁）
export default function ProgressButton({ current, className = '', style, onMenu, onEnding }) {
  const allDone = solvedCount(current) === QUIZZES.length

  return (
    <button
      type="button"
      className={`${className} ${quiz.glowButton} ${quiz.progressButton}`}
      style={style}
      onClick={allDone ? onEnding : onMenu}
    >
      {allDone && <i className="iconoir-sparks" aria-hidden="true" />}
      <span>{progressLabel(current)}</span>
      <i className={allDone ? 'iconoir-gift' : 'iconoir-arrow-right'} aria-hidden="true" />
    </button>
  )
}
