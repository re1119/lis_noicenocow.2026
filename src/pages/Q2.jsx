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

// 四個選項：B 是正解
const OPTIONS = [
  { id: 'A', text: '每月租金為 1500 克朗' },
  { id: 'B', text: '支付 1500 點即可直接入住' },
  { id: 'C', text: '目前登記租屋者的最高點數', correct: true },
  { id: 'D', text: '需註冊滿 1500 天才有抽籤資格' },

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
  // results：每個選項目前是 'correct'、'wrong' 還是還沒點
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

  const choose = (o) => {
    if (solved) return
    setResults((r) => ({ ...r, [o.id]: o.correct ? 'correct' : 'wrong' }))
    if (!o.correct) setShake((s) => ({ id: o.id, key: s.key + 1 }))
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

      {/* 情境圖：去背的公寓，背後一圈暖光；右下角疊一個像租屋網的點數標籤
          houseArea 會吃掉畫面剩下的高度，圖片在裡面等比例放到最大 */}
      <div className={`${styles.houseArea} ${quiz.rise}`} style={{ '--delay': '0.1s' }}>
        <figure className={styles.houseFrame}>
          <img
            className={styles.house}
            src={asset('images/q2-public-housing.png')}
            alt="一棟紅磚四層公寓，窗戶透出溫暖的燈光"
          />
          {/* 史力奇站在公寓左下角的雪地上，抬頭看著這棟房子 */}
          <span className={styles.snufkin}>
            <img
              className={quiz.floating}
              src={asset('images/snufkin-unlocked.png')}
              alt="史力奇站在雪地裡，看著這棟公寓"
            />
          </span>
          <figcaption className={styles.listingTag}>
            <i className="iconoir-map-pin" aria-hidden="true" />
            1500 poäng
          </figcaption>
        </figure>
      </div>

      {/* 作答區：題目＋四個垂直排列的選項 */}
      <div className={`${styles.answerArea} ${quiz.glass} ${quiz.rise}`} style={{ '--delay': '0.25s' }}>
        <p className={styles.prompt} id="q2-prompt">
          史力奇在國營租屋網站 Stångåstaden 看到這間心儀的公寓，標籤上寫著「1500 poäng（點）」。請問這個數字代表什麼意思？
        </p>
        <div className={styles.answers} role="group" aria-labelledby="q2-prompt">
          {OPTIONS.map((o) => {
            const result = results[o.id]
            const isShaking = shake.id === o.id
            return (
              <button
                key={isShaking ? `${o.id}-${shake.key}` : o.id}
                type="button"
                className={`${styles.answer} ${result ? styles[result] : ''} ${solved && !result ? styles.dimmed : ''} ${isShaking ? quiz.shake : ''}`}
                onClick={() => choose(o)}
                disabled={solved}
                aria-label={`選項 ${o.id}：${o.text}${result === 'wrong' ? '，答錯了' : ''}${result === 'correct' ? '，答對了' : ''}`}
              >
                <span className={styles.answerKey} aria-hidden="true">
                  {o.id}
                </span>
                <span className={styles.answerText}>{o.text}</span>
              </button>
            )
          })}
        </div>
      </div>
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
            <h2 className={styles.faceTitle}>
              <span className={styles.titleCheer}>答對了</span>
              <i className="iconoir-sparks" aria-hidden="true" />
            </h2>
            <p className={styles.faceText}>
              Stångåstaden 網頁的分數代表「目前登記者的最高點數」，點數多寡決定優先順序。
              <br /> 
              史力奇如果點數不夠，就只能摸摸鼻子繼續睡帳篷囉
              <i className={`iconoir-bonfire ${styles.inlineIcon}`} aria-hidden="true" />
            </p>
            <p className={quiz.highlight}>
              <i className="iconoir-home-simple-door" aria-hidden="true" />
              <span>
                <strong>瑞典居住理念：</strong>居住是人民的必需品，不是炒作、買賣致富的商品！
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
            <p className={styles.faceText}>如果臺灣也採用這種「排隊累積點數」的公共住宅制度，你會想排隊嗎？</p>
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
