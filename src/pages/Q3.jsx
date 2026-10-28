import { useEffect } from 'react'
import QuizStage from '../components/QuizStage.jsx'
import ProgressButton from '../components/ProgressButton.jsx'
import QuizIntro from '../components/QuizIntro.jsx'
import SuccessFigure from '../components/SuccessFigure.jsx'
import CatchGame from '../components/CatchGame.jsx'
import quiz from '../styles/quiz.module.css'
import styles from './Q3.module.css'
import { tidy } from '../utils/tidyText.jsx'

// 圖片來自 OneDrive「網站素材」的 Q3_correct_*.svg、Q3_error_*.svg，
// 裁掉透明邊、長邊縮成 240px 後放在 public/images/

// 正確物件池：能帶來幸福感的東西（接到 5 個就過關，不用 7 個全接）
const CORRECT_ITEMS = [
  { id: 'blanket', img: 'images/q3-correct-1.png', correct: true },
  { id: 'pillow', img: 'images/q3-correct-2.png', correct: true },
  { id: 'tent', img: 'images/q3-correct-3.png', correct: true },
  { id: 'fireplace', img: 'images/q3-correct-4.png', correct: true },
  { id: 'puppy', img: 'images/q3-correct-5.png', correct: true },
  { id: 'fika', img: 'images/q3-correct-6.png', correct: true },
  { id: 'socks', img: 'images/q3-correct-7.png', correct: true },
]

// 錯誤物件池：會帶來壓力的東西（可以無限次出現）
const HAZARD_ITEMS = [
  { id: 'phone', img: 'images/q3-error-1.png', correct: false },
  { id: 'alarm', img: 'images/q3-error-2.png', correct: false },
  { id: 'quarrel', img: 'images/q3-error-3.png', correct: false },
  { id: 'stress', img: 'images/q3-error-4.png', correct: false },
  { id: 'money', img: 'images/q3-error-5.png', correct: false },
]

// 第三關：引導 → 掉落接物遊戲 → 通關（換畫面的邏輯在 QuizStage）
export default function Q3({ path, active, navigate, onSolved }) {
  return (
    <QuizStage
      base="/q3"
      playPath="game"
      label="第三關：收集 HYGGE 能量"
      path={path}
      active={active}
      navigate={navigate}
      renderStep={(step, { screenActive, goQuestion, goSuccess, goMenu, goEnding }) => {
        if (step === 'question') {
          return (
            <CatchGame
              active={screenActive}
              correctItems={CORRECT_ITEMS}
              hazardItems={HAZARD_ITEMS}
              jarImg="images/q3-jar.png"
              onBack={goMenu}
              onWin={goSuccess}
              header={
                <header className={quiz.header}>
                  <h2 className={quiz.title}>收集 HYGGE 能量</h2>
                  <p className={quiz.cluePill}>
                    <i className="iconoir-open-book" aria-hidden="true" />
                    《我們最快樂 HYGGE》p.57
                  </p>
                </header>
              }
            />
          )
        }
        if (step === 'success') return <Success active={screenActive} onSolved={onSolved} onBack={goMenu} onEnding={goEnding} />
        return (
          <QuizIntro
            active={screenActive}
            onNext={goQuestion}
            img="images/moomin-unlocked.png"
            alt="嚕嚕米站著，看起來有點落寞"
          >
            嚕嚕米覺得最近天氣有點冷，
            <br />
            心裡空空的...
          </QuizIntro>
        )
      }}
    />
  )
}

/* ============ 通關回饋頁 ============ */
function Success({ active, onSolved, onBack, onEnding }) {
  // 進入通關頁就記錄「第三關已答對」，並解鎖嚕嚕米
  useEffect(() => {
    if (active) onSolved()
  }, [active, onSolved])

  return tidy(
    <div className={styles.success}>
      {/* 全畫面柔和的暖金色，象徵 HYGGE 的溫馨 */}
      <div className={styles.hyggeWash} aria-hidden="true" />
      <div className={quiz.warmGlow} aria-hidden="true" />

      <SuccessFigure img="images/moomin-unlocked.png" alt="嚕嚕米滿足地站著，看起來暖洋洋的" />

      <article className={`${styles.resultCard} ${quiz.glass} ${quiz.rise}`} style={{ '--delay': '0.25s' }}>
        <h2 className={styles.resultTitle}>
          <span className={styles.titleCheer}>太棒了！</span>
          <span>
            你收集滿了 HYGGE 能量
            <i className="iconoir-heart-solid" aria-hidden="true" />
          </span>
        </h2>
        <p className={styles.resultText}>
          不管是點亮一根蠟燭、抱抱毛小孩，還是喝杯熱茶，這些簡單的微小事物都能促使大腦分泌「催產素」（又被稱為擁抱荷爾蒙），讓我們感到平靜與安全。
        </p>
        <p className={quiz.highlight}>
          <i className="iconoir-language" aria-hidden="true" />
          <span>
            <strong>HYGGE（呼嘎）：</strong>丹麥語中的<span className={quiz.mark}>溫暖、舒適</span>，是北歐人度過漫長寒冬的幸福秘訣。
          </span>
        </p>
      </article>

      {/* 按鈕文字跟著破關進度改變；四關全破時直接去結局頁領獎 */}
      <ProgressButton
        current="Q3"
        className={`${styles.homeButton} ${quiz.rise}`}
        style={{ '--delay': '0.45s' }}
        onMenu={onBack}
        onEnding={onEnding}
      />
    </div>
  )
}
