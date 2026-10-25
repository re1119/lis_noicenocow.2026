import { useEffect, useRef, useState } from 'react'
import { motion, useMotionValue } from 'framer-motion'
import QuizStage from '../components/QuizStage.jsx'
import QuizIntro from '../components/QuizIntro.jsx'
import SuccessFigure from '../components/SuccessFigure.jsx'
import quiz from '../styles/quiz.module.css'
import styles from './Q3.module.css'

const asset = (path) => `${import.meta.env.BASE_URL}${path}`

// 收集滿之後，等多久跳到通關頁（讓玩家欣賞玻璃罐發光）
const WIN_DELAY_MS = 2000

// 放錯或沒放進罐子：彈簧飛回原位（stiffness 越大越快，damping 越小越會晃）
const SPRING_BACK = { bounceStiffness: 380, bounceDamping: 22 }
// 放對：吸進罐子中心
const ABSORB = { duration: 0.5, ease: [0.4, 0, 0.2, 1] }

// 8 個物件：5 個能帶來幸福感（correct），3 個會讓人更疲憊
const ITEMS = [
  { id: 'soup', img: 'images/q3-correct-1.png', alt: '一碗熱湯', correct: true },
  { id: 'blanket', img: 'images/q3-correct-2.png', alt: '摺好的蕾絲毛毯', correct: true },
  { id: 'candle', img: 'images/q3-correct-3.png', alt: '點亮的蠟燭', correct: true },
  { id: 'fireplace', img: 'images/q3-correct-4.png', alt: '燒著柴火的壁爐', correct: true },
  { id: 'puppy', img: 'images/q3-correct-5.png', alt: '開心奔跑的小狗', correct: true },
  { id: 'phone', img: 'images/q3-error-1.png', alt: '跳滿緊急通知的手機', correct: false },
  { id: 'overtime', img: 'images/q3-error-2.png', alt: '被文件淹沒、抱頭苦惱的上班族', correct: false },
  { id: 'commute', img: 'images/q3-error-3.png', alt: '擠滿人的通勤車廂', correct: false },
]
const CORRECT_TOTAL = ITEMS.filter((item) => item.correct).length

// 8 個擺放位置（遊戲區的百分比座標）：罐子左右各 2 個、下方一排 4 個
const SLOTS = [
  { x: 13, y: 20 },
  { x: 13, y: 50 },
  { x: 87, y: 20 },
  { x: 87, y: 50 },
  { x: 13, y: 84 },
  { x: 38, y: 86 },
  { x: 62, y: 84 },
  { x: 87, y: 86 },
]

// 洗牌：每次進遊戲，物件的位置都不一樣
function shuffle(list) {
  const copy = [...list]
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[copy[i], copy[j]] = [copy[j], copy[i]]
  }
  return copy
}

// 第三關：引導 → 拖曳收集 → 通關（換畫面的邏輯在 QuizStage）
export default function Q3({ path, active, navigate, onSolved }) {
  return (
    <QuizStage
      base="/q3"
      playPath="game"
      label="第三關：收集 Hygge 能量"
      path={path}
      active={active}
      navigate={navigate}
      renderStep={(step, { screenActive, goQuestion, goSuccess, goMenu }) => {
        if (step === 'question') return <Game onBack={goMenu} onWin={goSuccess} />
        if (step === 'success') return <Success active={screenActive} onSolved={onSolved} onBack={goMenu} />
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

/* ============ 拖曳收集遊戲 ============ */
function Game({ onBack, onWin }) {
  // 每次進來重新洗牌（useState 的初始值只在畫面建立時算一次）
  const [layout] = useState(() => shuffle(ITEMS).map((item, i) => ({ ...item, slot: SLOTS[i] })))
  const [collected, setCollected] = useState([])
  const [jarBounce, setJarBounce] = useState(0)
  const [hint, setHint] = useState('請將能帶來「幸福感」的物品拖進玻璃罐中！')
  const areaRef = useRef(null)
  const jarRef = useRef(null)
  const won = collected.length === CORRECT_TOTAL

  // 收集滿了：等 2 秒（欣賞發光）再跳到通關頁
  useEffect(() => {
    if (!won) return
    const timer = setTimeout(onWin, WIN_DELAY_MS)
    return () => clearTimeout(timer)
  }, [won, onWin])

  const collect = (id) => {
    setCollected((list) => (list.includes(id) ? list : [...list, id]))
    setJarBounce((n) => n + 1)
    setHint('罐子變得更溫暖了！')
  }

  const reject = () => setHint('這個好像會讓人更累…換一個試試？')

  // 收集進度 0 ~ 1：每放進一個，發光球體亮 20%
  const progress = collected.length / CORRECT_TOTAL

  return (
    <div className={styles.game}>
      <button type="button" className={quiz.back} onClick={onBack} aria-label="回到尋寶圖鑑">
        <i className="iconoir-nav-arrow-left" aria-hidden="true" />
      </button>

      <header className={`${quiz.header} ${quiz.rise}`}>
        <h2 className={quiz.title}>收集 Hygge 能量</h2>
        <p className={quiz.cluePill}>
          <i className="iconoir-open-book" aria-hidden="true" />
          《我們最快樂 HYGGE》p.57
        </p>
      </header>

      {/* 遊戲區：玻璃罐在中間，物件散在周圍；物件只能在這個範圍內拖 */}
      <div ref={areaRef} className={`${styles.area} ${quiz.rise}`} style={{ '--delay': '0.15s' }}>
        <div className={`${styles.jarWrap} ${won ? styles.jarWon : ''}`}>
          {/* 罐子背後的暖黃光球：收集越多越亮 */}
          <div className={styles.jarGlow} style={{ opacity: progress }} aria-hidden="true" />
          <img
            key={jarBounce}
            ref={jarRef}
            className={`${styles.jar} ${jarBounce ? styles.jarBounce : ''}`}
            src={asset('images/q3-jar.png')}
            alt={`玻璃罐，已收集 ${collected.length} / ${CORRECT_TOTAL} 個幸福物品`}
          />
        </div>

        {layout.map((item) =>
          collected.includes(item.id) ? null : (
            <DragItem
              key={item.id}
              item={item}
              areaRef={areaRef}
              jarRef={jarRef}
              disabled={won}
              onCollect={collect}
              onReject={reject}
            />
          ),
        )}
      </div>

      <p className={`${styles.hint} ${quiz.glass} ${quiz.rise}`} style={{ '--delay': '0.3s' }} aria-live="polite">
        {hint}
      </p>
    </div>
  )
}

/* ---------- 可以拖的物件 ---------- */
function DragItem({ item, areaRef, jarRef, disabled, onCollect, onReject }) {
  // x、y：物件離原位多遠（framer-motion 的 motion value，拖曳時即時更新、不會重新渲染）
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const ref = useRef(null)
  const [dragging, setDragging] = useState(false)
  // absorb：放對之後「從哪飛到哪」；有值就換成飛進罐子的動畫
  const [absorb, setAbsorb] = useState(null)
  const [shakeKey, setShakeKey] = useState(0)

  // 拖曳放開：落在罐子上才算「放進去」
  // 沒放進罐子或放錯時，dragSnapToOrigin 會自動用彈簧把物件拉回原位
  const onDragEnd = (event, info) => {
    setDragging(false)
    const jar = jarRef.current.getBoundingClientRect()
    // info.point：放開那一刻手指的位置
    const { x: px, y: py } = info.point
    const inJar = px > jar.left && px < jar.right && py > jar.top && py < jar.bottom
    if (inJar) tryPlace()
  }

  // 嘗試放進罐子（拖進去、點一下、按 Enter 都會走到這裡）
  const tryPlace = () => {
    if (disabled || absorb) return
    if (!item.correct) {
      // 放錯：震動提示（拖曳的話，物件同時會彈回原位）
      setShakeKey((k) => k + 1)
      onReject()
      return
    }

    // 放對：算出「罐子中心」相對於物件原位的距離，從現在的位置飛過去、縮小、淡出
    const jar = jarRef.current.getBoundingClientRect()
    const r = ref.current.getBoundingClientRect()
    const fromX = x.get()
    const fromY = y.get()
    const originX = r.left + r.width / 2 - fromX
    const originY = r.top + r.height / 2 - fromY
    setAbsorb({
      fromX,
      fromY,
      toX: jar.left + jar.width / 2 - originX,
      toY: jar.top + jar.height * 0.6 - originY,
    })
  }

  // 放對了：換成一個不能拖的元素，從放開的位置飛進罐子（不會和拖曳的彈回動畫互相搶）
  if (absorb) {
    return (
      <div className={styles.slot} style={{ left: `${item.slot.x}%`, top: `${item.slot.y}%`, zIndex: 5 }}>
        <motion.div
          className={styles.item}
          initial={{ x: absorb.fromX, y: absorb.fromY, scale: 1.1, opacity: 1 }}
          animate={{ x: absorb.toX, y: absorb.toY, scale: 0.15, opacity: 0 }}
          transition={ABSORB}
          onAnimationComplete={() => onCollect(item.id)}
          aria-hidden="true"
        >
          <span className={styles.itemInner}>
            <img src={asset(item.img)} alt="" draggable={false} />
          </span>
        </motion.div>
      </div>
    )
  }

  return (
    // 外層負責「擺在哪個位置」，內層 motion.button 負責「被拖到哪」，兩者的 transform 才不會互相蓋掉
    <div
      className={styles.slot}
      style={{ left: `${item.slot.x}%`, top: `${item.slot.y}%`, zIndex: dragging ? 5 : 1 }}
    >
      {/* 用 button：鍵盤可以 Tab 到、按 Enter 放進罐子；手機上也可以直接點一下 */}
      <motion.button
        type="button"
        ref={ref}
        className={styles.item}
        style={{ x, y }}
        drag={!disabled}
        dragConstraints={areaRef}
        dragElastic={0.18}
        dragSnapToOrigin
        dragTransition={SPRING_BACK}
        onDragStart={() => setDragging(true)}
        onDragEnd={onDragEnd}
        // onTap：只有「沒拖動、單純點一下」才會觸發，拖曳放開不會誤觸
        onTap={tryPlace}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault()
            tryPlace()
          }
        }}
        whileDrag={{ scale: 1.1, filter: 'drop-shadow(0 14px 16px rgba(20, 30, 45, 0.45))' }}
        transition={{ type: 'spring', stiffness: 400, damping: 25 }}
        disabled={disabled}
        aria-label={`${item.alt}，放進玻璃罐`}
      >
        {/* 震動放在內層，和拖曳的位移分開 */}
        <span key={shakeKey} className={`${styles.itemInner} ${shakeKey ? quiz.shake : ''}`}>
          <img src={asset(item.img)} alt="" draggable={false} />
        </span>
      </motion.button>
    </div>
  )
}

/* ============ 通關回饋頁 ============ */
function Success({ active, onSolved, onBack }) {
  // 進入通關頁就記錄「第三關已答對」，並解鎖嚕嚕米
  useEffect(() => {
    if (active) onSolved()
  }, [active, onSolved])

  return (
    <div className={styles.success}>
      {/* 全畫面柔和的暖金色，象徵 Hygge 的溫馨 */}
      <div className={styles.hyggeWash} aria-hidden="true" />
      <div className={quiz.warmGlow} aria-hidden="true" />

      <SuccessFigure img="images/moomin-unlocked.png" alt="嚕嚕米滿足地站著，看起來暖洋洋的" />

      <article className={`${styles.resultCard} ${quiz.glass} ${quiz.rise}`} style={{ '--delay': '0.25s' }}>
        <h2 className={styles.resultTitle}>
          <span className={styles.titleCheer}>太棒了！</span>
          <span>
            你收集滿了 Hygge 能量
            <i className="iconoir-heart-solid" aria-hidden="true" />
          </span>
        </h2>
        <p className={styles.resultText}>
          不管是點亮一根蠟燭、抱抱毛小孩，還是喝杯熱茶，這些簡單的微小事物都能促使大腦分泌「催產素」（又被稱為擁抱荷爾蒙），讓我們感到平靜與安全。
        </p>
        <p className={quiz.highlight}>
          <i className="iconoir-language" aria-hidden="true" />
          <span>
            <strong>Hygge（呼嘎）：</strong>丹麥語中的「溫暖、舒適」，是北歐人度過漫長寒冬的幸福秘訣。
          </span>
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
