import { BG_IMAGE, FIRST_SCENE_HEIGHT, LANTERN } from '../data/scenes.js'
import styles from './Scenery.module.css'

// 背景場景：長圖本身不動畫，位置由捲動決定（CSS 變數 --p，見 App.jsx）；
// 燭火、霧是另外疊上去的 div，製造「活著」的感覺
export default function Scenery() {
  // 背景圖要畫多寬：讓第一段場景剛好一個螢幕高（cqh = 畫面高的 1%），
  // 但至少要和畫面一樣寬，不然兩側會露出空白
  const sceneWidthCqh = (BG_IMAGE.width / FIRST_SCENE_HEIGHT) * 100
  const ratio = BG_IMAGE.height / BG_IMAGE.width

  return (
    <div
      className={styles.scenery}
      style={{
        '--img-w': `max(100cqw, ${sceneWidthCqh}cqh)`,
        '--img-h': `calc(var(--img-w) * ${ratio})`,
        // 原圖上的比例位置，乘上實際畫出來的圖寬
        '--lantern-x': LANTERN.x / BG_IMAGE.width,
        '--lantern-y': LANTERN.y / BG_IMAGE.width,
        '--seam-y': FIRST_SCENE_HEIGHT / BG_IMAGE.width,
      }}
      aria-hidden="true"
    >
      {/* 1. 長背景圖 */}
      <div
        className={styles.bg}
        style={{ backgroundImage: `url(${import.meta.env.BASE_URL}${BG_IMAGE.src})` }}
      />

      {/* 1-1. 首頁的巨型浮水印字：要緊貼在底圖上面，mix-blend-mode 才能和冰原混色
               （首頁本身在另一個圖層，混色碰不到底圖，所以放在這裡） */}
      <div className={styles.giant}>NORDIC</div>

      {/* 2. 跟著背景一起滑的圖層：燭火要黏在圖上的提燈位置 */}
      <div className={styles.track}>
        <div className={styles.lantern} />
        {/* 長圖第一段和第二段的拼接線，用一條霧帶蓋住 */}
        <div className={styles.seam} />
      </div>

      {/* 3. 迷霧：兩層速度不同、方向相反 */}
      <div className={`${styles.fog} ${styles.fogBack}`} />
      <div className={`${styles.fog} ${styles.fogFront}`} />

      {/* 4. 頂部壓暗：讓白字在淺色霧地上也看得清楚；越往進度頁滑越深 */}
      <div className={styles.scrim} />
      <div className={`${styles.scrim} ${styles.scrimStrong}`} />
    </div>
  )
}
