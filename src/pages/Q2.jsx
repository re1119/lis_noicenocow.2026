import { useEffect, useState } from 'react'
import QuizStage from '../components/QuizStage.jsx'
import QuizIntro from '../components/QuizIntro.jsx'
import SuccessFigure from '../components/SuccessFigure.jsx'
import { useToast } from '../hooks/useToast.js'
import quiz from '../styles/quiz.module.css'
import styles from './Q2.module.css'

const asset = (path) => `${import.meta.env.BASE_URL}${path}`

// 答對後等多久才跳到通關頁（讓玩家看到綠光）
const CORRECT_DELAY_MS = 1000
// 反思題作答後，等多久回到進度頁
const REFLECT_DELAY_MS = 3000

// 四位候選人：點數、頭像，以及選錯時的提示
const CANDIDATES = [
  { id: 'moomin', name: '嚕嚕米', points: 820, img: 'images/moomin-unlocked.png', wrong: '點數不夠喔！' },
  { id: 'little-my', name: '亞美', points: 1500, img: 'images/little-my-unlocked.png', wrong: '她已經決定去旅行，放棄囉！' },
  { id: 'snufkin', name: '史力奇', points: 1200, img: 'images/snufkin-unlocked.png', correct: true },
  { id: 'amaka', name: '阿瑪卡仙子', points: 300, img: 'images/amaka-unlocked.png', wrong: '點數不夠喔！' },
]

// 第二關：引導 → 作答 → 通關＋反思（換畫面的邏輯在 QuizStage）
export default function Q2({ path, active, navigate, onSolved }) {
  return (
    <QuizStage
      base="/q2"
      label="第二關：瑞典租房大作戰"
      path={path}
      active={active}
      navigate={navigate}
      renderStep={(step, { screenActive, goQuestion, goSuccess, goMenu }) => {
        if (step === 'question') return <Question onBack={goMenu} onCorrect={goSuccess} />
        if (step === 'success') return <Success active={screenActive} onSolved={onSolved} onDone={goMenu} />
        return (
          <QuizIntro
            active={screenActive}
            onNext={goQuestion}
            img="images/snufkin-unlocked.png"
            alt="史力奇雙手插在口袋裡，若有所思"
          >
            史力奇似乎遇到了一個難題...
          </QuizIntro>
        )
      }}
    />
  )
}

/* ============ 問題頁 ============ */
function Question({ onBack, onCorrect }) {
  // results：每個名字按鈕目前是 'correct'、'wrong' 還是還沒點
  const [results, setResults] = useState({})
  const [shake, setShake] = useState({ id: null, key: 0 })
  const [toast, showToast] = useToast(1800)
  const solved = Object.values(results).includes('correct')

  // 答對後等 1 秒再跳頁
  useEffect(() => {
    if (!solved) return
    const timer = setTimeout(onCorrect, CORRECT_DELAY_MS)
    return () => clearTimeout(timer)
  }, [solved, onCorrect])

  const choose = (c) => {
    if (solved) return
    setResults((r) => ({ ...r, [c.id]: c.correct ? 'correct' : 'wrong' }))
    if (!c.correct) {
      setShake((s) => ({ id: c.id, key: s.key + 1 }))
      showToast(c.wrong)
    }
  }

  return (
    <div className={styles.question}>
      <button type="button" className={quiz.back} onClick={onBack} aria-label="回到尋寶圖鑑">
        <i className="iconoir-nav-arrow-left" aria-hidden="true" />
      </button>

      <header className={`${quiz.header} ${quiz.rise}`}>
        <h2 className={quiz.title}>瑞典租房大作戰</h2>
        <p className={quiz.cluePill}>
          <i className="iconoir-open-book" aria-hidden="true" />
          《剛剛好，最完美！》p.112-113
        </p>
      </header>

      {/* 情境圖：原圖的黑底已預先轉成透明（效果等同 screen 混合），公寓像浮在冰原上 */}
      <img
        className={`${styles.house} ${quiz.rise}`}
        style={{ '--delay': '0.1s' }}
        src={asset('images/q2-public-housing.png')}
        alt="一棟紅磚四層公寓，窗戶透出溫暖的燈光"
      />

      {/* 候選人小卡：頭像、名字、排隊點數 */}
      <ul className={`${styles.candidates} ${quiz.rise}`} style={{ '--delay': '0.2s' }} aria-label="候選人與排隊點數">
        {CANDIDATES.map((c) => (
          <li key={c.id} className={styles.candidate}>
            <span className={styles.avatar}>
              <img src={asset(c.img)} alt="" />
            </span>
            <span className={styles.candidateText}>
              <span className={styles.candidateName}>{c.name}</span>
              <span className={styles.points}>
                <strong>{c.points}</strong> 點
              </span>
            </span>
          </li>
        ))}
      </ul>

      {/* 作答區：題目＋四個名字按鈕 */}
      <div className={`${styles.answerArea} ${quiz.glass} ${quiz.rise}`} style={{ '--delay': '0.3s' }}>
        <p className={styles.prompt}>
          有一間溫馨的社會住宅釋出！點數最高的亞美卻臨時決定去出國旅行。根據瑞典「點數排隊制」，鑰匙最後會交給誰呢？
        </p>
        <div className={styles.answers}>
          {CANDIDATES.map((c) => {
            const result = results[c.id]
            const isShaking = shake.id === c.id
            return (
              <button
                key={isShaking ? `${c.id}-${shake.key}` : c.id}
                type="button"
                className={`${styles.answer} ${result ? styles[result] : ''} ${isShaking ? quiz.shake : ''}`}
                onClick={() => choose(c)}
                disabled={solved}
                aria-label={`${c.name}${result === 'wrong' ? '，答錯了' : ''}${result === 'correct' ? '，答對了' : ''}`}
              >
                {c.name}
              </button>
            )
          })}
        </div>
      </div>

      <p className={`${quiz.toast} ${toast ? quiz.toastShow : ''}`} role="status">
        {toast}
      </p>
    </div>
  )
}

/* ============ 通關＋反思頁：3D 翻轉卡片 ============ */
function Success({ active, onSolved, onDone }) {
  // isFlipped：卡片翻到反面了沒。每次進入通關頁畫面都會重建，所以一定從正面開始
  const [isFlipped, setIsFlipped] = useState(false)
  const [choice, setChoice] = useState(null)
  const [toast, showToast] = useToast(REFLECT_DELAY_MS)

  // 進入通關頁就記錄「第二關已答對」，並解鎖史力奇
  useEffect(() => {
    if (active) onSolved()
  }, [active, onSolved])

  // 回答反思題後，等 3 秒回到進度頁
  useEffect(() => {
    if (!choice) return
    const timer = setTimeout(onDone, REFLECT_DELAY_MS)
    return () => clearTimeout(timer)
  }, [choice, onDone])

  const reflect = (id) => {
    if (choice) return
    setChoice(id)
    showToast('感謝你的分享！繼續尋寶吧 ~')
  }

  return (
    <div className={styles.success}>
      <div className={quiz.warmGlow} aria-hidden="true" />

      <button type="button" className={quiz.back} onClick={onDone} aria-label="回到尋寶圖鑑">
        <i className="iconoir-nav-arrow-left" aria-hidden="true" />
      </button>

      <SuccessFigure img="images/snufkin-unlocked.png" alt="史力奇輕鬆地站著，看起來心情不錯" />

      {/* 翻轉卡片：外層給 3D 透視，內層整張翻面 */}
      <div className={`${styles.flipScene} ${quiz.rise}`} style={{ '--delay': '0.25s' }}>
        <div className={`${styles.flipCard} ${isFlipped ? styles.flipped : ''}`}>
          {/* 正面：通關故事。翻到反面時用 inert 讓鍵盤和報讀器跳過 */}
          <article className={`${styles.face} ${styles.front}`} inert={isFlipped} aria-hidden={isFlipped}>
            <h2 className={`${styles.faceTitle} ${styles.twoLine}`}>
              <span className={styles.titleCheer}>答對了！</span>
              <span>
                史力奇獲得租屋權
                <i className="iconoir-sparks" aria-hidden="true" />
              </span>
            </h2>
            <p className={styles.faceText}>
              亞美放棄後，由剩下的競爭者中點數最高的史力奇遞補！不過...他看了看這棟公寓，搔搔頭說：「我好像還是比較喜歡睡我的帳篷。」
              <i className={`iconoir-bonfire ${styles.inlineIcon}`} aria-hidden="true" />
            </p>
            <p className={styles.highlight}>
              <i className="iconoir-home-simple-door" aria-hidden="true" />
              <span>
                <strong>瑞典居住理念：</strong>居住是人民的必需品，不是炒作致富的商品。
              </span>
            </p>
            <button type="button" className={styles.flipButton} onClick={() => setIsFlipped(true)}>
              那如果是你呢？
              <i className="iconoir-arrow-right" aria-hidden="true" />
            </button>
          </article>

          {/* 反面：反思題 */}
          <article className={`${styles.face} ${styles.back}`} inert={!isFlipped} aria-hidden={!isFlipped}>
            <h2 className={styles.faceTitle}>想一想...</h2>
            <p className={styles.faceText}>如果台灣也採用這種「排隊累積點數」的公共住宅制度，你會想排隊嗎？</p>
            <div className={styles.reflectOptions}>
              {[
                { id: 'A', text: '會，感覺很公平！' },
                { id: 'B', text: '不會，感覺要等太久...' },
              ].map((o) => (
                <button
                  key={o.id}
                  type="button"
                  className={`${styles.reflectOption} ${choice === o.id ? styles.chosen : ''}`}
                  onClick={() => reflect(o.id)}
                  disabled={!!choice}
                >
                  <span className={styles.optionKey}>{o.id}</span>
                  {o.text}
                </button>
              ))}
            </div>
          </article>
        </div>
      </div>

      <p className={`${quiz.toast} ${toast ? quiz.toastShow : ''}`} role="status">
        {toast}
      </p>
    </div>
  )
}
