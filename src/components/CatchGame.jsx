import { useCallback, useEffect, useRef, useState } from 'react'
import { animate, motion, useMotionValue } from 'framer-motion'
import { useToast } from '../hooks/useToast.js'
import quiz from '../styles/quiz.module.css'
import styles from './CatchGame.module.css'

const asset = (path) => `${import.meta.env.BASE_URL}${path}`

// ---------- 遊戲參數（想調難度改這裡） ----------
const GOAL = 5 // 接到幾個正確物件就過關
const ITEM_SIZE = 84 // 掉落物件的大小（px）
const SPAWN_MIN_MS = 1000 // 每隔 1 ~ 1.5 秒掉一個
const SPAWN_MAX_MS = 1500
const FALL_MIN_MS = 2500 // 從頂端掉到底部要 2.5 ~ 3.5 秒
const FALL_MAX_MS = 3500
const CORRECT_CHANCE = 0.7 // 70% 掉正確物件、30% 掉錯誤物件
const WIN_DELAY_MS = 1500 // 收集滿之後，欣賞發光多久才跳到通關頁
const COUNTDOWN = ['3', '2', '1', '開始！']
const COUNT_STEP_MS = 800

const rand = (min, max) => min + Math.random() * (max - min)
const pick = (list) => list[Math.floor(Math.random() * list.length)]

// 掉落接物遊戲
// correctItems：能帶來幸福感的物件（接到算分）；hazardItems：會帶來壓力的物件
// active：這個畫面真的在眼前時才開始倒數；onWin：收集滿之後要做的事
export default function CatchGame({ active, correctItems, hazardItems, jarImg, header, onBack, onWin }) {
  // phase：waiting 等待 → countdown 倒數 → playing 遊戲中 → won 過關
  const [phase, setPhase] = useState('waiting')
  const [countIndex, setCountIndex] = useState(0)
  // falling：畫面上正在掉的物件（只在生成／消失時更新，位置不放在這裡）
  const [falling, setFalling] = useState([])
  const [caught, setCaught] = useState([])
  // jarFx：罐子的特效（warm 接到好東西／cold 接到壓力），key 改變就重播一次
  const [jarFx, setJarFx] = useState({ type: null, key: 0 })
  const [toast, showToast] = useToast(1400)

  const areaRef = useRef(null)
  const jarRef = useRef(null)
  // jarX：罐子離中間多遠（framer-motion 的 motion value，拖曳時即時更新、不會重新渲染）
  const jarX = useMotionValue(0)
  // 遊戲迴圈要讀寫的資料放在 ref：每秒改 60 次也不會觸發重新渲染
  const size = useRef({ areaW: 0, areaH: 0, jarW: 0, jarH: 0, jarLeft: 0, jarTop: 0 })
  const fallingRef = useRef(new Map()) // key → { item, x, start, duration, el }
  const caughtIds = useRef(new Set())
  const nextKey = useRef(1)

  // ---------- 量尺寸：遊戲區和罐子的大小、位置（畫面大小改變時重新量） ----------
  useEffect(() => {
    const measure = () => {
      const area = areaRef.current
      const jar = jarRef.current
      if (!area || !jar) return
      size.current = {
        areaW: area.clientWidth,
        areaH: area.clientHeight,
        jarW: jar.offsetWidth,
        jarH: jar.offsetHeight,
        jarLeft: jar.offsetLeft, // 罐子沒被拖動時的位置（不含 jarX）
        jarTop: jar.offsetTop,
      }
    }
    measure()
    const observer = new ResizeObserver(measure)
    observer.observe(areaRef.current)
    observer.observe(jarRef.current)
    return () => observer.disconnect()
  }, [])

  // 罐子最多能往左右移多少（不能出畫面）
  const clampJar = useCallback((value) => {
    const { areaW, jarW, jarLeft } = size.current
    return Math.min(Math.max(value, -jarLeft), areaW - jarW - jarLeft)
  }, [])

  // ---------- 3-2-1 倒數 ----------
  useEffect(() => {
    if (!active || phase !== 'waiting') return
    const timer = setTimeout(() => setPhase('countdown'), 400)
    return () => clearTimeout(timer)
  }, [active, phase])

  useEffect(() => {
    if (phase !== 'countdown') return
    const timer = setTimeout(() => {
      if (countIndex < COUNTDOWN.length - 1) setCountIndex((i) => i + 1)
      else setPhase('playing')
    }, COUNT_STEP_MS)
    return () => clearTimeout(timer)
  }, [phase, countIndex])

  // ---------- 物件消失（接到或漏接） ----------
  const removeFalling = useCallback((key) => {
    fallingRef.current.delete(key)
    setFalling((list) => list.filter((f) => f.key !== key))
  }, [])

  // ---------- 接到東西 ----------
  const onCatch = useCallback(
    (f) => {
      removeFalling(f.key)
      if (!f.item.correct) {
        // 壓力物件：罐子震動、冷藍光閃一下、跳出提示（不扣分）
        setJarFx((fx) => ({ type: 'cold', key: fx.key + 1 }))
        showToast('哎呀，壓力太大了！')
        return
      }
      // 幸福物件：從正確池永久移除、加進罐子
      caughtIds.current.add(f.item.id)
      setCaught((list) => [...list, f.item])
      setJarFx((fx) => ({ type: 'warm', key: fx.key + 1 }))
      if (caughtIds.current.size >= GOAL) {
        // 過關：不再生成，把還在掉的東西清掉
        fallingRef.current.clear()
        setFalling([])
        setPhase('won')
      }
    },
    [removeFalling, showToast],
  )

  // ---------- 生成一個掉落物 ----------
  const spawn = useCallback(
    (now) => {
      const { areaW } = size.current
      // 正確池：還沒接到、而且現在沒有正在掉的（漏接的會回到池子裡，之後再掉一次）
      const fallingIds = new Set([...fallingRef.current.values()].map((f) => f.item.id))
      const pool = correctItems.filter((item) => !caughtIds.current.has(item.id) && !fallingIds.has(item.id))
      const item = pool.length > 0 && Math.random() < CORRECT_CHANCE ? pick(pool) : pick(hazardItems)
      const f = {
        key: nextKey.current++,
        item,
        x: rand(0, Math.max(0, areaW - ITEM_SIZE)),
        start: now,
        duration: rand(FALL_MIN_MS, FALL_MAX_MS),
        // 每個物件搖擺的方向和幅度都不太一樣
        sway: rand(-1, 1) > 0 ? 1 : -1,
        el: null,
      }
      fallingRef.current.set(f.key, f)
      setFalling((list) => [...list, f])
    },
    [correctItems, hazardItems],
  )

  // ---------- 遊戲迴圈：每一格畫面更新位置、做碰撞判定 ----------
  useEffect(() => {
    if (!active || phase !== 'playing') return
    let raf
    let nextSpawn = performance.now() + 300

    const tick = (now) => {
      if (now >= nextSpawn) {
        spawn(now)
        nextSpawn = now + rand(SPAWN_MIN_MS, SPAWN_MAX_MS)
      }

      const { areaH, jarW, jarH, jarLeft, jarTop } = size.current
      const left = jarLeft + jarX.get()
      // 罐口判定範圍：罐子上半部、左右各內縮一點（物件中心點進到這個框就算接到）
      const catchTop = jarTop + jarH * 0.05
      const catchBottom = jarTop + jarH * 0.45
      const catchLeft = left + jarW * 0.06
      const catchRight = left + jarW * 0.94

      for (const f of fallingRef.current.values()) {
        const progress = (now - f.start) / f.duration
        const y = -ITEM_SIZE + progress * (areaH + ITEM_SIZE)
        // 直接改 transform，不經過 React，手機上才順
        if (f.el) f.el.style.transform = `translate3d(${f.x}px, ${y}px, 0)`

        const cx = f.x + ITEM_SIZE / 2
        const cy = y + ITEM_SIZE / 2
        if (cy >= catchTop && cy <= catchBottom && cx >= catchLeft && cx <= catchRight) {
          onCatch(f)
        } else if (y > areaH) {
          removeFalling(f.key) // 漏接：正確物件會回到池子裡
        }
      }
      raf = requestAnimationFrame(tick)
    }

    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [active, phase, spawn, onCatch, removeFalling, jarX])

  // ---------- 過關：發光一下再跳頁 ----------
  useEffect(() => {
    if (phase !== 'won') return
    const timer = setTimeout(onWin, WIN_DELAY_MS)
    return () => clearTimeout(timer)
  }, [phase, onWin])

  // ---------- 手指按在遊戲區任何地方：罐子移到手指下方（比一定要抓到罐子好操作） ----------
  const following = useRef(false)
  const moveJarTo = (clientX) => {
    const rect = areaRef.current.getBoundingClientRect()
    const { jarW, jarLeft } = size.current
    jarX.set(clampJar(clientX - rect.left - jarW / 2 - jarLeft))
  }
  const onAreaPointerDown = (e) => {
    if (phase !== 'playing' || jarRef.current.contains(e.target)) return
    following.current = true
    moveJarTo(e.clientX)
  }
  const onAreaPointerMove = (e) => {
    if (following.current) moveJarTo(e.clientX)
  }
  const stopFollowing = () => {
    following.current = false
  }

  // ---------- 鍵盤：左右方向鍵移動罐子 ----------
  useEffect(() => {
    if (!active || phase !== 'playing') return
    const onKey = (e) => {
      if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return
      e.preventDefault()
      const step = size.current.areaW * 0.15 * (e.key === 'ArrowLeft' ? -1 : 1)
      animate(jarX, clampJar(jarX.get() + step), { type: 'spring', stiffness: 500, damping: 40 })
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [active, phase, jarX, clampJar])

  // 罐子後面的光：底光 15%，每接到一個越來越亮
  const glow = 0.15 + 0.85 * Math.min(caught.length / GOAL, 1)

  return (
    <div className={styles.game}>
      {/* 遊戲區：整個畫面，物件從最上方掉下來 */}
      <div
        ref={areaRef}
        className={styles.area}
        onPointerDown={onAreaPointerDown}
        onPointerMove={onAreaPointerMove}
        onPointerUp={stopFollowing}
        onPointerCancel={stopFollowing}
        onPointerLeave={stopFollowing}
      >
        {falling.map((f) => (
          <div
            key={f.key}
            ref={(el) => {
              const entry = fallingRef.current.get(f.key)
              if (entry) entry.el = el
            }}
            className={styles.falling}
            style={{ transform: `translate3d(${f.x}px, ${-ITEM_SIZE}px, 0)` }}
            aria-hidden="true"
          >
            {/* 自然飄落：邊掉邊微微旋轉、左右搖擺 */}
            <motion.img
              src={asset(f.item.img)}
              alt=""
              draggable={false}
              animate={{ rotate: [0, 15 * f.sway, -10 * f.sway, 5 * f.sway, 0], x: [0, 8 * f.sway, -6 * f.sway, 4 * f.sway, 0] }}
              transition={{ duration: f.duration / 1000, ease: 'easeInOut' }}
            />
          </div>
        ))}

        {/* 罐子：貼齊底部，只能左右拖 */}
        <motion.div
          ref={jarRef}
          className={`${styles.catcher} ${phase === 'won' ? styles.catcherWon : ''}`}
          style={{ x: jarX }}
          drag={phase === 'playing' ? 'x' : false}
          dragConstraints={areaRef}
          dragElastic={0}
          dragMomentum={false}
          aria-label={`玻璃罐，已收集 ${caught.length} / ${GOAL} 個幸福物品。可以用左右方向鍵移動`}
          role="img"
        >
          <div className={styles.jarGlow} style={{ opacity: glow }} aria-hidden="true" />
          {jarFx.type && (
            <div key={jarFx.key} className={`${styles.jarFlash} ${styles[jarFx.type]}`} aria-hidden="true" />
          )}
          {/* 震動放在內層，和拖曳的位移分開 */}
          <div key={`shake-${jarFx.type === 'cold' ? jarFx.key : 0}`} className={`${styles.jarBody} ${jarFx.type === 'cold' ? quiz.shake : ''}`}>
            <img className={styles.jar} src={asset(jarImg)} alt="" draggable={false} />
            {/* 罐子裡：接到的物件縮小堆在底部 */}
            <div className={styles.contents}>
              {caught.map((item) => (
                <img key={item.id} className={styles.thumb} src={asset(item.img)} alt="" draggable={false} />
              ))}
            </div>
          </div>
        </motion.div>
      </div>

      {/* 頂部資訊：疊在遊戲區上面 */}
      <div className={styles.top}>
        <button type="button" className={quiz.back} onClick={onBack} aria-label="回到尋寶圖鑑">
          <i className="iconoir-nav-arrow-left" aria-hidden="true" />
        </button>
        {header}
        <p className={styles.progress} aria-live="polite">
          能量收集進度：<strong>{caught.length}</strong> / {GOAL}
        </p>
      </div>

      {/* 3-2-1 倒數遮罩 */}
      {(phase === 'waiting' || phase === 'countdown') && (
        <div className={styles.countdown} aria-live="assertive">
          {phase === 'countdown' && (
            <span key={countIndex} className={styles.countNumber}>
              {COUNTDOWN[countIndex]}
            </span>
          )}
          <p className={styles.countTip}>左右滑動玻璃罐，接住帶來幸福感的物品</p>
        </div>
      )}

      <p className={`${quiz.toast} ${toast ? quiz.toastShow : ''}`} role="status">
        {toast}
      </p>
    </div>
  )
}
