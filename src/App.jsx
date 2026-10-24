import { useCallback, useEffect, useRef } from 'react'
import Scenery from './components/Scenery.jsx'
import Home from './pages/Home.jsx'
import Menu from './pages/Menu.jsx'
import Q1 from './pages/Q1.jsx'
import { SECTION_PATHS, SECTION_POSITIONS, SWIPE_PAGE_COUNT, sectionOf } from './data/scenes.js'
import { useHashPath } from './hooks/useHashPath.js'
import { isSolved, useUnlocked } from './hooks/useUnlocked.js'
import styles from './App.module.css'

// 翻頁後要鎖多久（毫秒），比 1 秒的轉場動畫稍長，避免連續狂滑翻過頭
const COOLDOWN_MS = 1200
// 手指至少要滑多遠（px）才算翻頁，太短的當成一般點擊
const SWIPE_MIN = 50
// 滾輪一次至少要轉多少才算翻頁，過濾觸控板的輕微抖動
const WHEEL_MIN = 10

export default function App() {
  // 網址決定現在在哪一頁（0 = 首頁、1 = 進度頁、2 = 第一關）
  const [path, navigate] = useHashPath()
  const activeIndex = sectionOf(path)
  // 遊戲進度只在這裡讀一次，再分給各頁，大家看到的是同一份
  const progress = useUnlocked()

  // indexRef：同一個頁數的「備份」，讓事件處理器隨時讀到最新值
  const indexRef = useRef(activeIndex)
  indexRef.current = activeIndex
  const lockedUntil = useRef(0)
  const touchStartY = useRef(null)

  // 用滑動翻到首頁或進度頁；冷卻時間內、在關卡頁裡、或已經在那一頁就不動
  const goTo = useCallback(
    (index) => {
      const now = Date.now()
      const current = indexRef.current
      if (current >= SWIPE_PAGE_COUNT) return
      const next = Math.min(Math.max(index, 0), SWIPE_PAGE_COUNT - 1)
      if (now < lockedUntil.current || next === current) return
      lockedUntil.current = now + COOLDOWN_MS
      navigate(SECTION_PATHS[next])
    },
    [navigate],
  )

  // 往上（-1）或往下（+1）翻一頁
  const step = useCallback((direction) => goTo(indexRef.current + direction), [goTo])

  // ---------- 觸控：記下手指按下的位置，放開時比較方向 ----------
  const onTouchStart = (e) => {
    touchStartY.current = e.touches[0].clientY
  }
  const onTouchEnd = (e) => {
    if (touchStartY.current === null) return
    const delta = touchStartY.current - e.changedTouches[0].clientY
    touchStartY.current = null
    if (Math.abs(delta) < SWIPE_MIN) return // 滑太短：當作點擊，不翻頁
    step(delta > 0 ? 1 : -1) // 手指往上滑 → 看下一頁
  }

  // ---------- 滑鼠滾輪／觸控板 ----------
  const onWheel = (e) => {
    if (Math.abs(e.deltaY) < WHEEL_MIN) return
    step(e.deltaY > 0 ? 1 : -1)
  }

  // ---------- 鍵盤：上下方向鍵、PageUp / PageDown ----------
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'ArrowDown' || e.key === 'PageDown') step(1)
      if (e.key === 'ArrowUp' || e.key === 'PageUp') step(-1)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [step])

  // 在進度頁點精靈：答對過就直接看通關回顧，沒答過就從引導頁開始
  const openQuiz = useCallback(
    (quiz) => {
      if (quiz !== 'Q1') return
      navigate(isSolved('Q1') ? '/q1/success' : '/q1/intro')
    },
    [navigate],
  )

  // 第一關答對：記錄並解鎖阿瑪卡仙子
  const { solve } = progress
  const solveQ1 = useCallback(() => solve('Q1', 'amaka'), [solve])

  return (
    <div
      className={styles.app}
      style={{
        '--index': activeIndex,
        // 背景要停在幾 %（0.2 = 20%），由 Scenery 的 CSS 讀取
        '--p': SECTION_POSITIONS[activeIndex] / 100,
        '--menu-progress': activeIndex >= 1 ? 1 : 0,
      }}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
      onWheel={onWheel}
      // 保險：不支援 overflow: clip 的舊瀏覽器，萬一被捲動就立刻拉回原位
      onScroll={(e) => {
        e.currentTarget.scrollTop = 0
      }}
    >
      {/* 背景：長圖、燭火、霧，跟著翻頁一起滑 */}
      <Scenery />

      {/* 前景：所有頁面上下疊在一起，整串用 transform 往上推 */}
      <main className={styles.slider}>
        <Home active={activeIndex === 0} onStart={() => goTo(1)} />
        <Menu active={activeIndex === 1} progress={progress} onOpenQuiz={openQuiz} />
        <Q1 path={path} active={activeIndex === 2} navigate={navigate} onSolved={solveQ1} />
      </main>
    </div>
  )
}
