import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import QuizStage from '../components/QuizStage.jsx'
import { IntroProgress, useIntroTimer } from '../components/QuizIntro.jsx'
import { useToast } from '../hooks/useToast.js'
import quiz from '../styles/quiz.module.css'
import styles from './Q4.module.css'
import { tidy } from '../utils/tidyText.jsx'

const asset = (path) => `${import.meta.env.BASE_URL}${path}`

// 答對後等多久換下一題（快問快答的節奏）
const NEXT_DELAY_MS = 600

// 三道題目：note 是筆記頁底圖，answer 是正解的選項代號
// lines：題目在筆記頁上的斷行（書寫區很窄，自動斷行會把「包裹」拆成兩行，所以手動指定）
const QUESTIONS = [
  {
    note: 'images/q4-note-1.jpg',
    lines: ['這份神祕的包裹，', '每年固定在哪一天寄到？'],
    options: [
      { id: 'A', text: '11月1日' },
      { id: 'B', text: '12月25日' },
      { id: 'C', text: '2月14日' },
    ],
    answer: 'A',
  },
  {
    note: 'images/q4-note-2.jpg',
    lines: ['包裹上的郵戳顯示，', '最常從哪裡寄出？'],
    options: [
      { id: 'A', text: '倫敦' },
      { id: 'B', text: '莫斯科' },
      { id: 'C', text: '哥本哈根' },
      { id: 'D', text: '斯德哥爾摩' },
    ],
    answer: 'D',
  },
  {
    note: 'images/q4-note-3.jpg',
    lines: ['打開包裹後，', '裡面的信寫了什麼？'],
    options: [
      { id: 'A', text: '爸爸，祝你生日快樂' },
      { id: 'B', text: '沒有信，只有一朵花' },
      { id: 'C', text: '如果我多一張船票，你會不會跟我一起走？' },
    ],
    answer: 'B',
  },
]

// 換題的滑動動畫：新的一題從右邊滑進來，舊的往左滑出去
const SLIDE = {
  initial: { opacity: 0, x: 60 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -60 },
  transition: { duration: 0.35, ease: [0.4, 0, 0.2, 1] },
}

// 第四關：任務指派 → 三連拍快問快答 → 懸念通關（換畫面的邏輯在 QuizStage）
export default function Q4({ path, active, navigate, onSolved }) {
  return (
    <QuizStage
      base="/q4"
      playPath="quiz"
      label="第四關：40 年懸案"
      path={path}
      active={active}
      navigate={navigate}
      renderStep={(step, { screenActive, goQuestion, goSuccess, goMenu }) => {
        if (step === 'question') return <Quiz onBack={goMenu} onDone={goSuccess} />
        if (step === 'success') return <Success active={screenActive} onSolved={onSolved} onBack={goMenu} />
        return <Intro active={screenActive} onNext={goQuestion} />
      }}
    />
  )
}

/* ============ 任務指派（引導頁）：和其他關一樣是純過場，5 秒後自動進入題目 ============ */
function Intro({ active, onNext }) {
  useIntroTimer(active, onNext)

  return tidy(
    <div className={styles.intro}>
      <h2 className={styles.introTitle}>亞美發現了一樁 40 年懸案...</h2>

      <span className={styles.introFigure}>
        <img
          className={quiz.floating}
          src={asset('images/little-my-unlocked.png')}
          alt="亞美雙手抱胸，一臉懷疑地盯著你"
        />
      </span>

      <div className={`${styles.mission} ${quiz.rise}`} style={{ '--delay': '0.9s' }}>
        <p className={`${styles.missionCard} ${quiz.glass}`}>
          <i className="iconoir-open-book" aria-hidden="true" />
          {/* 在書名號後面手動換行：「21-24 頁，」要黏在一起，自動換行時上一行會空太多 */}
          <span>
            請翻到《龍紋身的女孩》
            <br />第 21-24 頁，然後回來揭曉謎底！
          </span>
        </p>
        <IntroProgress />
      </div>
    </div>
  )
}

/* ============ 警探筆記快問快答 ============ */
function Quiz({ onBack, onDone }) {
  // currentStep：第幾題（0、1、2）
  const [currentStep, setCurrentStep] = useState(0)
  // result：這一題目前點了哪個選項、對或錯
  const [result, setResult] = useState({ id: null, correct: false, key: 0 })
  const [toast, showToast] = useToast(1800)
  const q = QUESTIONS[currentStep]
  const solved = result.correct

  // 答對：0.6 秒後換下一題；最後一題答對就到通關頁
  useEffect(() => {
    if (!solved) return
    const timer = setTimeout(() => {
      if (currentStep < QUESTIONS.length - 1) {
        setCurrentStep((s) => s + 1)
        setResult({ id: null, correct: false, key: 0 })
      } else {
        onDone()
      }
    }, NEXT_DELAY_MS)
    return () => clearTimeout(timer)
  }, [solved, currentStep, onDone])

  const choose = (option) => {
    if (solved) return
    const correct = option.id === q.answer
    setResult((r) => ({ id: option.id, correct, key: r.key + 1 }))
    if (!correct) showToast('再仔細看看書裡的線索！')
  }

  return tidy(
    <div className={styles.quiz}>
      <button type="button" className={quiz.back} onClick={onBack} aria-label="回到尋寶圖鑑">
        <i className="iconoir-nav-arrow-left" aria-hidden="true" />
      </button>

      {/* 進度：案件筆記 1/3，三個小圓點跟著亮 */}
      <div className={`${styles.progress} ${quiz.rise}`}>
        <span aria-live="polite">
          案件筆記：{currentStep + 1}/{QUESTIONS.length}
        </span>
        <span className={styles.dots} aria-hidden="true">
          {QUESTIONS.map((_, i) => (
            <span key={i} className={`${styles.dot} ${i <= currentStep ? styles.dotOn : ''}`} />
          ))}
        </span>
      </div>

      {/* 換題時整組（筆記頁＋選項）滑動切換；mode="wait"：舊的滑出去之後，新的才滑進來 */}
      <div className={`${styles.stage} ${quiz.rise}`} style={{ '--delay': '0.1s' }}>
        <AnimatePresence mode="wait" initial={false}>
          <motion.div key={currentStep} className={styles.slide} {...SLIDE}>
            {/* 筆記頁：底圖＋疊在書寫區的題目 */}
            <div className={styles.note}>
              <img className={styles.noteImg} src={asset(q.note)} alt="" />
              <p className={styles.noteText}>
                {q.lines.map((line) => (
                  <span key={line}>{line}</span>
                ))}
              </p>
            </div>

            <div className={styles.options}>
              {q.options.map((option) => {
                const picked = result.id === option.id
                let state = ''
                if (picked) state = result.correct ? styles.correct : styles.wrong
                return (
                  <button
                    key={picked ? `${option.id}-${result.key}` : option.id}
                    type="button"
                    className={`${styles.option} ${state} ${picked && !result.correct ? quiz.shake : ''}`}
                    onClick={() => choose(option)}
                    disabled={solved}
                  >
                    <span className={styles.optionKey}>{option.id}</span>
                    {option.text}
                  </button>
                )
              })}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      <p className={`${quiz.toast} ${toast ? quiz.toastShow : ''}`} role="status">
        {toast}
      </p>
    </div>
  )
}

/* ============ 懸念通關頁 ============ */
function Success({ active, onSolved, onBack }) {
  // 進入通關頁就記錄「第四關已答對」，並解鎖亞美
  useEffect(() => {
    if (active) onSolved()
  }, [active, onSolved])

  return tidy(
    <div className={styles.success}>
      {/* 冷冷的月光，從花的位置往外暈開 */}
      <div className={styles.moonGlow} aria-hidden="true" />

      <div className={`${styles.flower} ${quiz.pop}`}>
        <img src={asset('images/q4-desert-snow.png')} alt="一朵白色的壓花「沙漠雪」，下方掛著手寫標籤" />
      </div>

      <article className={`${styles.resultCard} ${quiz.glass} ${quiz.rise}`} style={{ '--delay': '0.6s' }}>
        <h2 className={styles.resultTitle}>今年的「沙漠雪」，是第 44 號。</h2>
        {/* 拆成兩段：卡片裡每個段落之間本來就有 16px 的間距（.resultCard 的 gap） */}
        <p className={styles.resultText}>每年一朵壓花，整整 44 年從未間斷。</p>
        <p className={styles.resultText}>
          但為什麼牆上的相框少了一格？
          <br />
          為什麼收到花的老人哭了？
        </p>
        <p className={quiz.highlight}>
          <i className="iconoir-search" aria-hidden="true" />
          <span>解答就藏在書裡。如果你也好奇真相，翻開書讀讀看吧！</span>
        </p>
      </article>

      <button
        type="button"
        className={`${styles.homeButton} ${quiz.glowButton} ${quiz.rise}`}
        style={{ '--delay': '0.85s' }}
        onClick={onBack}
      >
        回到尋寶地圖
      </button>
    </div>
  )
}
