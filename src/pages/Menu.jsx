import { useEffect, useRef, useState } from 'react'
import { SPRITES } from '../data/sprites.js'
import { tidy } from '../utils/tidyText.jsx'
import styles from './Menu.module.css'

const asset = (path) => `${import.meta.env.BASE_URL}${path}`

// 進場時間：標題先出現，4 隻精靈每隔 0.15 秒依序浮現
// 整體從 0.3 秒開始，因為翻頁要 1 秒，太早浮現會在頁面還沒滑到時就播完
const HEADER_DELAY = 0.3
const FIRST_SPRITE_DELAY = 0.45
const SPRITE_GAP = 0.15

// 剛解鎖的精靈：等頁面滑到、精靈格子浮現後才開始登場（秒）
const REVEAL_DELAY = 1.2
// 登場動畫總長：放大淡入 1 秒 + 星光爆發 0.9 秒
const REVEAL_TOTAL_MS = (REVEAL_DELAY + 1.9) * 1000

// 「準備中」提示要顯示多久
const TOAST_MS = 2400

// 星光爆發時往外飛的 8 顆小星星（角度）
const BURST_RAYS = [0, 45, 90, 135, 180, 225, 270, 315]

// 畫面二：進度頁／關卡選單（第 2 頁）
// active：現在是不是在這一頁，翻進來時才播放進場動畫
// progress：遊戲進度（App 傳進來，和關卡頁共用同一份）
// onOpenQuiz：點了精靈，要進哪一關
export default function Menu({ active, progress, onOpenQuiz }) {
  const { isUnlocked, justUnlocked, finishReveal } = progress
  const [toast, setToast] = useState(null)
  const toastTimer = useRef(null)

  // 剛解鎖的精靈：翻進進度頁後播完登場動畫，就從「等待登場」名單移除
  useEffect(() => {
    if (!active || justUnlocked.length === 0) return
    const timer = setTimeout(() => justUnlocked.forEach(finishReveal), REVEAL_TOTAL_MS)
    return () => clearTimeout(timer)
  }, [active, justUnlocked, finishReveal])

  useEffect(() => () => clearTimeout(toastTimer.current), [])

  const onSpriteClick = (sprite) => {
    if (sprite.quiz) {
      onOpenQuiz(sprite.quiz)
      return
    }
    // 關卡還沒做好：跳出小提示
    setToast(`${sprite.name}的關卡還在準備中，先去找阿瑪卡仙子吧！`)
    clearTimeout(toastTimer.current)
    toastTimer.current = setTimeout(() => setToast(null), TOAST_MS)
  }

  return (
    <section
      className={`${styles.menu} ${active ? styles.entered : ''}`}
      inert={!active}
      aria-labelledby="menu-title"
    >
      <header className={styles.header} style={{ '--delay': `${HEADER_DELAY}s` }}>
        <h2 id="menu-title" className={styles.title}>北歐精靈尋寶圖鑑</h2>
        <p className={styles.subtitle}>
          {/* tidy：整理中文斷行（標點不在行首、引號不拆開），見 utils/tidyText.jsx */}
          {tidy('尋找展場中的精靈書籤，閱讀並正確回答即可解鎖關卡。準備好挑戰了嗎？')}
        </p>
      </header>

      <ul className={styles.grid}>
        {SPRITES.map((sprite, i) => {
          const unlocked = isUnlocked(sprite.id)
          // 剛解鎖、而且現在就在進度頁：播放登場動畫
          const revealing = unlocked && active && justUnlocked.includes(sprite.id)
          // 剛解鎖但還沒翻進來：先保持剪影，等翻進來才變身
          const waiting = unlocked && !active && justUnlocked.includes(sprite.id)
          const showAsUnlocked = unlocked && !waiting

          let figureClass = 'magic-pulse' // 未解鎖：浮動＋金色呼吸光暈，暗示可以點
          if (showAsUnlocked) figureClass = styles.idle // 已解鎖：只保留輕微懸浮，拿掉光暈

          return (
            <li
              key={sprite.id}
              className={styles.cell}
              style={{ '--delay': `${FIRST_SPRITE_DELAY + i * SPRITE_GAP}s`, '--reveal-delay': `${REVEAL_DELAY}s` }}
            >
              <button
                type="button"
                className={`${styles.card} ${showAsUnlocked ? styles.unlocked : ''} ${revealing ? styles.revealing : ''}`}
                onClick={() => onSpriteClick(sprite)}
                aria-label={
                  unlocked
                    ? `${sprite.name}，已解鎖，點擊回顧關卡`
                    : `${sprite.name}，尚未解鎖，點擊開始挑戰`
                }
              >
                <span className={`${styles.figure} ${figureClass}`}>
                  <img className={styles.locked} src={asset(sprite.lockedImg)} alt={`${sprite.name}的黑色剪影`} />
                  <img className={styles.color} src={asset(sprite.unlockedImg)} alt={`${sprite.name}的彩色插圖`} />
                  {/* 星光爆發：只在登場時出現一次 */}
                  {revealing && (
                    <span className={styles.burst} aria-hidden="true">
                      <span className={styles.burstRing} />
                      {BURST_RAYS.map((angle) => (
                        <span key={angle} className={styles.burstStar} style={{ '--angle': `${angle}deg` }} />
                      ))}
                    </span>
                  )}
                </span>
                <span className={styles.name}>{sprite.name}</span>
              </button>
            </li>
          )
        })}
      </ul>

      {/* 小提示：毛玻璃膠囊，從底部浮上來 */}
      <p className={`${styles.toast} ${toast ? styles.toastShow : ''}`} role="status">
        {toast}
      </p>
    </section>
  )
}
