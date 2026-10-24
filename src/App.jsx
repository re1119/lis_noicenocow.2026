import { useEffect, useState } from 'react'
import { Route, Routes, useLocation } from 'react-router-dom'
import Scenery from './components/Scenery.jsx'
import Home from './pages/Home.jsx'
import Menu from './pages/Menu.jsx'
import styles from './App.module.css'

// 和 global.css 的 --fade-duration 一致：舊頁面淡出要多久
const FADE_MS = 450

export default function App() {
  const location = useLocation()

  // displayLocation：畫面上「正在顯示」的頁面
  // 網址一變，背景馬上開始滑；舊頁面先淡出，淡出完才換成新頁面淡入
  const [displayLocation, setDisplayLocation] = useState(location)
  const [phase, setPhase] = useState('in')

  useEffect(() => {
    if (location.pathname === displayLocation.pathname) return
    setPhase('out')
    const timer = setTimeout(() => {
      setDisplayLocation(location)
      setPhase('in')
    }, FADE_MS)
    return () => clearTimeout(timer)
  }, [location, displayLocation.pathname])

  return (
    <div className={styles.app}>
      {/* 背景：長圖、燭火、霧，依「目前網址」決定滑到哪 */}
      <Scenery pathname={location.pathname} />

      {/* 前景 UI：淡入淡出 */}
      <main
        key={displayLocation.pathname}
        className={`${styles.page} ${phase === 'out' ? styles.pageOut : styles.pageIn}`}
      >
        <Routes location={displayLocation}>
          <Route path="/" element={<Home />} />
          <Route path="/menu" element={<Menu />} />
          <Route path="*" element={<Home />} />
        </Routes>
      </main>
    </div>
  )
}
