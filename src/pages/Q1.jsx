import { useEffect, useState } from 'react'
import QuizStage from '../components/QuizStage.jsx'
import QuizIntro from '../components/QuizIntro.jsx'
import SuccessFigure from '../components/SuccessFigure.jsx'
import quiz from '../styles/quiz.module.css'
import styles from './Q1.module.css'

const asset = (path) => `${import.meta.env.BASE_URL}${path}`

// 答對後等多久才跳到通關頁（讓玩家看到綠色勾勾）
const CORRECT_DELAY_MS = 1000

// 三尊銅像：A 是正解
const STATUES = [
  { id: 'A', img: 'images/q1-statue-a-default.png', resultImg: 'images/q1-statue-a-correct.png', correct: true },
  { id: 'B', img: 'images/q1-statue-b-default.png', resultImg: 'images/q1-statue-b-error.png', correct: false },
  { id: 'C', img: 'images/q1-statue-c-default.png', resultImg: 'images/q1-statue-c-error.png', correct: false },
]

// 第一關：引導 → 作答 → 通關（換畫面的邏輯在 QuizStage）
export default function Q1({ path, active, navigate, onSolved }) {
  return (
    <QuizStage
      base="/q1"
      label="第一關：尋找安徒生銅像"
      path={path}
      active={active}
      navigate={navigate}
      renderStep={(step, { screenActive, goQuestion, goSuccess, goMenu }) => {
        if (step === 'question') return <Question onBack={goMenu} onCorrect={goSuccess} />
        if (step === 'success') return <Success active={screenActive} onSolved={onSolved} onBack={goMenu} />
        return (
          <QuizIntro
            active={screenActive}
            onNext={goQuestion}
            img="images/amaka-unlocked.png"
            alt="阿瑪卡仙子張開雙手，像在邀請你出發"
          >
            沉寂221年的童話小鎮…
            <br />
            你有勇氣揭開安徒生的面紗嗎？
          </QuizIntro>
        )
      }}
    />
  )
}

/* ============ 問題頁 ============ */
function Question({ onBack, onCorrect }) {
  // results：每尊銅像目前是 'correct'、'wrong' 還是還沒點（undefined）
  const [results, setResults] = useState({})
  // shake.key：每點一次錯的就 +1，讓震動動畫可以重複播放
  const [shake, setShake] = useState({ id: null, key: 0 })
  const solved = Object.values(results).includes('correct')

  // 答對後等 1 秒再跳頁
  useEffect(() => {
    if (!solved) return
    const timer = setTimeout(onCorrect, CORRECT_DELAY_MS)
    return () => clearTimeout(timer)
  }, [solved, onCorrect])

  const choose = (statue) => {
    if (solved) return
    setResults((r) => ({ ...r, [statue.id]: statue.correct ? 'correct' : 'wrong' }))
    if (!statue.correct) setShake((s) => ({ id: statue.id, key: s.key + 1 }))
  }

  // 卡片上的提示文字：依作答狀況改變，螢幕報讀器也會唸出來（aria-live）
  let hint = '誰最符合書上描述的安徒生銅像？'
  if (solved) hint = '就是這尊！'
  else if (shake.id) hint = '好像不是這尊…再翻翻書看看？'

  return (
    <div className={styles.question}>
      <button type="button" className={quiz.back} onClick={onBack} aria-label="回到尋寶圖鑑">
        <i className="iconoir-nav-arrow-left" aria-hidden="true" />
      </button>

      <header className={`${quiz.header} ${quiz.rise}`}>
        <h2 className={quiz.title}>尋找安徒生銅像</h2>
        <p className={quiz.cluePill}>
          <i className="iconoir-open-book" aria-hidden="true" />
          《光影北歐》p.87
        </p>
      </header>

      <ul className={`${styles.statues} ${quiz.rise}`} style={{ '--delay': '0.15s' }}>
        {STATUES.map((statue) => {
          const result = results[statue.id]
          const isShaking = shake.id === statue.id
          return (
            <li key={statue.id} className={styles.statueCell}>
              <button
                type="button"
                className={`${styles.statue} ${result ? styles[result] : ''} ${solved && !result ? styles.dimmed : ''}`}
                onClick={() => choose(statue)}
                disabled={solved}
                aria-label={`選項 ${statue.id}${result === 'wrong' ? '，答錯了' : ''}${result === 'correct' ? '，答對了' : ''}`}
              >
                {/* key 改變 → 重新建立元素 → 震動動畫重播 */}
                <span key={isShaking ? shake.key : 'still'} className={`${styles.statueImg} ${isShaking ? quiz.shake : ''}`}>
                  <img src={asset(result ? statue.resultImg : statue.img)} alt={`銅像 ${statue.id}`} />
                </span>
                <span className={styles.statueLabel} aria-hidden="true">
                  {statue.id}
                </span>
              </button>
            </li>
          )
        })}
      </ul>

      {/* 底部毛玻璃卡片，阿瑪卡仙子從卡片右上方探出半身
          仙子排在卡片「後面」，下半身會被卡片的毛玻璃蓋住、變模糊 */}
      <div className={`${styles.hintArea} ${quiz.rise}`} style={{ '--delay': '0.3s' }}>
        <span className={styles.peek} aria-hidden="true">
          <img className={quiz.floating} src={asset('images/amaka-unlocked.png')} alt="" />
        </span>
        <div className={`${styles.hintCard} ${quiz.glass}`}>
          <p className={styles.hintText} aria-live="polite">
            {hint}
          </p>
        </div>
      </div>
    </div>
  )
}

/* ============ 通關回饋頁 ============ */
function Success({ active, onSolved, onBack }) {
  // 進入通關頁就記錄「第一關已答對」，並解鎖阿瑪卡仙子
  useEffect(() => {
    if (active) onSolved()
  }, [active, onSolved])

  return (
    <div className={styles.success}>
      {/* 暖金色柔光，象徵解密成功 */}
      <div className={quiz.warmGlow} aria-hidden="true" />

      <SuccessFigure img="images/amaka-unlocked.png" alt="阿瑪卡仙子開心地飛舞" />

      <article className={`${styles.resultCard} ${quiz.glass} ${quiz.rise}`} style={{ '--delay': '0.25s' }}>
        <h2 className={styles.resultTitle}>答對了！</h2>
        <p className={styles.resultText}>
          安徒生銅像正靜靜地望向對面的 Tivoli Gardens ─ 這是全世界現存第二古老的主題樂園呢！
        </p>
      </article>

      <button
        type="button"
        className={`${styles.homeButton} ${quiz.glowButton} ${quiz.rise}`}
        style={{ '--delay': '0.45s' }}
        onClick={onBack}
      >
        回到尋寶圖鑑
      </button>
    </div>
  )
}
