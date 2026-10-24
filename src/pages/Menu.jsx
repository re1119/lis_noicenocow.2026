import { SPRITES } from '../data/sprites.js'
import { useUnlocked } from '../hooks/useUnlocked.js'
import styles from './Menu.module.css'

const asset = (path) => `${import.meta.env.BASE_URL}${path}`

// 進場時間：標題先出現，4 隻精靈每隔 0.15 秒依序浮現
// 整體從 0.3 秒開始，因為翻頁要 1 秒，太早浮現會在頁面還沒滑到時就播完
const HEADER_DELAY = 0.3
const FIRST_SPRITE_DELAY = 0.45
const SPRITE_GAP = 0.15

// 畫面二：進度頁／關卡選單（第 2 頁）
// active：現在是不是在這一頁，翻進來時才播放進場動畫
export default function Menu({ active }) {
  const { isUnlocked, unlock } = useUnlocked()

  return (
    <section
      className={`${styles.menu} ${active ? styles.entered : ''}`}
      inert={!active}
      aria-labelledby="menu-title"
    >
      <header className={styles.header} style={{ '--delay': `${HEADER_DELAY}s` }}>
        <h2 id="menu-title" className={styles.title}>北歐精靈尋寶圖鑑</h2>
        <p className={styles.subtitle}>
          尋找展場中的精靈書籤，閱讀並正確回答即可解鎖關卡。準備好挑戰了嗎？
        </p>
      </header>

      <ul className={styles.grid}>
        {SPRITES.map((sprite, i) => {
          const unlocked = isUnlocked(sprite.id)
          return (
            <li
              key={sprite.id}
              className={styles.cell}
              style={{ '--delay': `${FIRST_SPRITE_DELAY + i * SPRITE_GAP}s` }}
            >
              <button
                type="button"
                className={`${styles.card} ${unlocked ? styles.unlocked : ''}`}
                onClick={() => unlock(sprite.id)}
                aria-label={unlocked ? `${sprite.name}，已解鎖` : `${sprite.name}，尚未解鎖，點擊解鎖`}
                aria-pressed={unlocked}
              >
                {/* 未解鎖時加上 magic-pulse：浮動＋金色呼吸光暈，暗示可以點 */}
                <span className={`${styles.figure} ${unlocked ? '' : 'magic-pulse'}`}>
                  <img
                    className={styles.locked}
                    src={asset(sprite.lockedImg)}
                    alt={`${sprite.name}的黑色剪影`}
                  />
                  <img
                    className={styles.color}
                    src={asset(sprite.unlockedImg)}
                    alt={`${sprite.name}的彩色插圖`}
                  />
                </span>
                <span className={styles.name}>{sprite.name}</span>
              </button>
            </li>
          )
        })}
      </ul>
    </section>
  )
}
