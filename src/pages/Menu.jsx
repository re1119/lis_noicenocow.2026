import { SPRITES } from '../data/sprites.js'
import { useUnlocked } from '../hooks/useUnlocked.js'
import styles from './Menu.module.css'

const asset = (path) => `${import.meta.env.BASE_URL}${path}`

// 畫面二：進度頁／關卡選單（第 2 屏）
export default function Menu() {
  const { isUnlocked, unlock } = useUnlocked()

  return (
    // id="menu"：首頁的 Start 按鈕靠這個 id 找到要捲去哪
    <section id="menu" className={styles.menu} aria-labelledby="menu-title">
      <header className={styles.header}>
        <h2 id="menu-title" className={styles.title}>北歐精靈尋寶圖鑑</h2>
        <p className={styles.subtitle}>
          尋找展場中的精靈書籤，閱讀並正確回答即可解鎖關卡。準備好挑戰了嗎？
        </p>
      </header>

      <ul className={styles.grid}>
        {SPRITES.map((sprite) => {
          const unlocked = isUnlocked(sprite.id)
          return (
            <li key={sprite.id} className={styles.cell}>
              <button
                type="button"
                className={`${styles.card} ${unlocked ? styles.unlocked : ''}`}
                onClick={() => unlock(sprite.id)}
                aria-label={unlocked ? `${sprite.name}，已解鎖` : `${sprite.name}，尚未解鎖，點擊解鎖`}
                aria-pressed={unlocked}
              >
                {/* 兩張圖疊在一起，用透明度交叉淡入淡出 */}
                <span className={styles.figure}>
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
