import { useEffect, useRef } from 'react'
import Scenery from './components/Scenery.jsx'
import Home from './pages/Home.jsx'
import Menu from './pages/Menu.jsx'
import { getScenePercent } from './data/scenes.js'
import styles from './App.module.css'

export default function App() {
  const appRef = useRef(null)
  const scrollerRef = useRef(null)

  // 監聽捲動：算出現在捲到第幾屏，換算成背景位置，寫進 CSS 變數
  // 直接改 CSS 變數、不經過 React 重新繪製，手指滑動時才會順
  useEffect(() => {
    const app = appRef.current
    const scroller = scrollerRef.current
    let frame = 0

    const update = () => {
      frame = 0
      const section = scroller.scrollTop / scroller.clientHeight
      app.style.setProperty('--p', getScenePercent(section) / 100)
      // 0 = 停在首頁、1 = 停在進度頁，用來控制頂部壓暗的深淺
      app.style.setProperty('--menu-progress', Math.min(Math.max(section, 0), 1))
    }
    // requestAnimationFrame：每一格畫面最多算一次，不會拖慢捲動
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(update)
    }

    update()
    scroller.addEventListener('scroll', schedule, { passive: true })
    window.addEventListener('resize', schedule)
    return () => {
      scroller.removeEventListener('scroll', schedule)
      window.removeEventListener('resize', schedule)
      cancelAnimationFrame(frame)
    }
  }, [])

  return (
    <div ref={appRef} className={styles.app}>
      {/* 背景：長圖、燭火、霧，位置跟著捲動 */}
      <Scenery />

      {/* 前景：首頁和進度頁上下排在同一個捲動容器裡，各佔一屏 */}
      <main ref={scrollerRef} className={styles.scroller}>
        <Home />
        <Menu />
      </main>
    </div>
  )
}
