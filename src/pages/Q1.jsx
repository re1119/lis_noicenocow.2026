import { useCallback, useEffect, useRef, useState } from 'react'
import styles from './Q1.module.css'

const asset = (path) => `${import.meta.env.BASE_URL}${path}`

// 引導頁停留多久後自動進入題目：翻頁轉場 1 秒 + 停留 3 秒
const INTRO_MS = 4000
// 答對後等多久才跳到通關頁（讓玩家看到綠色勾勾）
const CORRECT_DELAY_MS = 1000
// 換畫面時，舊畫面淡出要多久
const FADE_MS = 400

// 三尊銅像：A 是正解
const STATUES = [
  { id: 'A', img: 'images/q1-statue-a-default.png', resultImg: 'images/q1-statue-a-correct.png', correct: true },
  { id: 'B', img: 'images/q1-statue-b-default.png', resultImg: 'images/q1-statue-b-error.png', correct: false },
  { id: 'C', img: 'images/q1-statue-c-default.png', resultImg: 'images/q1-statue-c-error.png', correct: false },
]

// 網址 → 第一關裡的哪個畫面
function stepOf(path) {
  if (path.endsWith('/question')) return 'question'
  if (path.endsWith('/success')) return 'success'
  return 'intro'
}

// 第一關（第 3 頁）：引導 → 作答 → 通關
export default function Q1({ path, active, navigate, onSolved }) {
  const step = stepOf(path)

  // shown：畫面上正在顯示的步驟。網址換了之後，舊畫面先淡出，再換成新的
  // 離開第一關（滑回進度頁）時保留最後一個畫面，不然滑出去的途中會突然變空白
  const [shown, setShown] = useState(step)
  const fading = active && step !== shown

  // 每次從進度頁「進入」第一關：直接換到對的畫面，並用 visit 當 key 讓進場動畫重播
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

  // 在第一關裡換畫面（引導 → 作答 → 通關）：等淡出結束才換
  useEffect(() => {
    if (!fading) return
    const timer = setTimeout(() => setShown(step), FADE_MS)
    return () => clearTimeout(timer)
  }, [fading, step])

  // 用 useCallback 固定住這些函式，子畫面裡的計時器才不會被重設
  const goQuestion = useCallback(() => navigate('/q1/question', { replace: true }), [navigate])
  const goSuccess = useCallback(() => navigate('/q1/success', { replace: true }), [navigate])
  const goMenu = useCallback(() => navigate('/menu'), [navigate])

  return (
    <section className={styles.q1} inert={!active} aria-label="第一關：尋找安徒生銅像">
      <div
        key={`${shown}-${visit}`}
        className={`${styles.screen} ${fading ? styles.fadeOut : ''}`}
        style={{ '--enter': shown === entryStep ? '0.8s' : '0s' }}
      >
        {shown === 'intro' && <Intro active={active && !fading} onNext={goQuestion} />}
        {shown === 'question' && <Question onBack={goMenu} onCorrect={goSuccess} />}
        {shown === 'success' && <Success active={active && !fading} onSolved={onSolved} onBack={goMenu} />}
      </div>
    </section>
  )
}

/* ============ 畫面三：引導頁 ============ */
function Intro({ active, onNext }) {
  // 停留一段時間後自動進入題目
  useEffect(() => {
    if (!active) return
    const timer = setTimeout(onNext, INTRO_MS)
    return () => clearTimeout(timer)
  }, [active, onNext])

  return (
    // 整個畫面都是按鈕：點任何地方都能提早開始
    <button type="button" className={styles.intro} onClick={onNext} aria-label="開始作答">
      <p className={styles.introText}>
        沉寂221年的童話小鎮…
        <br />
        你有勇氣揭開安徒生的面紗嗎？
      </p>
      <span className={styles.introFairy}>
        <img src={asset('images/amaka-unlocked.png')} alt="阿瑪卡仙子張開雙手，像在邀請你出發" />
      </span>
      <span className={styles.tapHint} aria-hidden="true">
        點一下畫面繼續
      </span>
    </button>
  )
}

/* ============ 畫面四：問題頁 ============ */
function Question({ onBack, onCorrect }) {
  // results：每尊銅像目前是 'correct'、'wrong' 還是還沒點（undefined）
  const [results, setResults] = useState({})
  // shakeKey：每點一次錯的就 +1，讓震動動畫可以重複播放
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
      <button type="button" className={styles.back} onClick={onBack} aria-label="回到尋寶圖鑑">
        <i className="iconoir-nav-arrow-left" aria-hidden="true" />
      </button>

      <header className={`${styles.qHeader} ${styles.rise}`}>
        <h2 className={styles.qTitle}>尋找安徒生銅像</h2>
        <p className={styles.cluePill}>
          <i className="iconoir-open-book" aria-hidden="true" />
          《光影北歐》p.87
        </p>
      </header>

      <ul className={`${styles.statues} ${styles.rise}`} style={{ '--delay': '0.15s' }}>
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
                <span key={isShaking ? shake.key : 'still'} className={`${styles.statueImg} ${isShaking ? styles.shake : ''}`}>
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
      <div className={`${styles.hintArea} ${styles.rise}`} style={{ '--delay': '0.3s' }}>
        <span className={styles.peek} aria-hidden="true">
          <img className={styles.floating} src={asset('images/amaka-unlocked.png')} alt="" />
        </span>
        <div className={styles.hintCard}>
          <p className={styles.hintText} aria-live="polite">
            {hint}
          </p>
        </div>
      </div>
    </div>
  )
}

/* ============ 畫面五：通關回饋頁 ============ */
// 星光粒子的位置與大小（在仙子周圍），每顆錯開閃爍時間
const SPARKLES = [
  { x: 12, y: 22, s: 10, d: 0 },
  { x: 84, y: 14, s: 14, d: 0.6 },
  { x: 92, y: 58, s: 8, d: 1.2 },
  { x: 6, y: 66, s: 12, d: 0.9 },
  { x: 70, y: 86, s: 9, d: 1.6 },
  { x: 26, y: 90, s: 7, d: 0.3 },
  { x: 50, y: 4, s: 8, d: 1.9 },
]

function Success({ active, onSolved, onBack }) {
  // 進入通關頁就記錄「第一關已答對」，並解鎖阿瑪卡仙子
  useEffect(() => {
    if (active) onSolved()
  }, [active, onSolved])

  return (
    <div className={styles.success}>
      {/* 暖金色柔光，象徵解密成功 */}
      <div className={styles.warmGlow} aria-hidden="true" />

      <div className={`${styles.successFairy} ${styles.pop}`}>
        <span className={styles.floating}>
          <img src={asset('images/amaka-unlocked.png')} alt="阿瑪卡仙子開心地飛舞" />
        </span>
        {SPARKLES.map((p, i) => (
          <span
            key={i}
            className={styles.sparkle}
            style={{ left: `${p.x}%`, top: `${p.y}%`, '--size': `${p.s}px`, '--d': `${p.d}s` }}
            aria-hidden="true"
          />
        ))}
      </div>

      <article className={`${styles.resultCard} ${styles.rise}`} style={{ '--delay': '0.25s' }}>
        <h2 className={styles.resultTitle}>答對了！</h2>
        <p className={styles.resultText}>
          安徒生銅像正靜靜地望向對面的「蒂沃利樂園」（這可是全世界現存第二古老的主題樂園呢！）。順帶一提，這位童話大師誕生於有「丹麥花園」美稱的歐登塞喔～
        </p>
      </article>

      <button
        type="button"
        className={`${styles.homeButton} ${styles.rise}`}
        style={{ '--delay': '0.45s' }}
        onClick={onBack}
      >
        回到尋寶圖鑑
      </button>
    </div>
  )
}
