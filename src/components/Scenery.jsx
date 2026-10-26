import { useEffect } from 'react'
import { BG_IMAGE, COW, FIRST_SCENE_HEIGHT, LANTERN } from '../data/scenes.js'
import styles from './Scenery.module.css'

// 背景場景：長圖本身不動畫，位置由翻頁決定（CSS 變數 --p，見 App.jsx）；
// 燭火、霧是另外疊上去的 div，製造「活著」的感覺
// 首頁海報：巨大的「牛」字夾在背景和去背的牛之間 → 真的牛站在字的前面
// isHome：現在是不是在首頁（只有首頁要跟著滑鼠做視差）
export default function Scenery({ isHome }) {
  // 背景圖要畫多寬：讓第一段場景剛好一個螢幕高（cqh = 畫面高的 1%），
  // 但至少要和畫面一樣寬，不然兩側會露出空白
  const sceneWidthCqh = (BG_IMAGE.width / FIRST_SCENE_HEIGHT) * 100
  const ratio = BG_IMAGE.height / BG_IMAGE.width

  // 視差：把滑鼠位置寫成 CSS 變數 --mx、--my（-0.5 ~ 0.5），各圖層依「離我們多遠」決定移動量：
  //   背景、真牛 → 不動（對焦的那一層）
  //   巨字「牛」、遠處的雪 → 在牛後面，往反方向動
  //   近處的雪、首頁文字 → 在牛前面，往同方向動，越近動越多
  // 寫在網頁最外層（documentElement），首頁的文字層也讀得到；不會重新渲染畫面
  useEffect(() => {
    if (!isHome) return
    const root = document.documentElement
    const onMove = (e) => {
      root.style.setProperty('--mx', (e.clientX / window.innerWidth - 0.5).toFixed(3))
      root.style.setProperty('--my', (e.clientY / window.innerHeight - 0.5).toFixed(3))
    }
    window.addEventListener('pointermove', onMove)
    return () => window.removeEventListener('pointermove', onMove)
  }, [isHome])

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
        '--cow-x': COW.x / BG_IMAGE.width,
        '--cow-y': COW.y / BG_IMAGE.width,
        '--cow-w': COW.w / BG_IMAGE.width,
      }}
      aria-hidden="true"
    >
      {/* 1. 長背景圖 */}
      <div
        className={styles.bg}
        style={{ backgroundImage: `url(${import.meta.env.BASE_URL}${BG_IMAGE.src})` }}
      />

      {/* 1-1. 遠處的雪：細小、清楚、落得慢（首頁才有） */}
      <div className={`${styles.snow} ${styles.snowFar}`} />

      {/* 2. 首頁巨字「牛。」：接在首頁直書的「冰上沒有」後面
             在背景之上、真牛之下 → 牛站在字前面；跟著背景一起滑走 */}
      <div className={styles.giant}>
        <span className={`${styles.giantGlyph} ${styles.ox}`}>牛</span>
        <span className={`${styles.giantGlyph} ${styles.dot}`}>。</span>
      </div>

      {/* 3. 後層迷霧：從巨字前面飄過去，字像立在霧裡 */}
      <div className={`${styles.fog} ${styles.fogBack}`} />

      {/* 4. 跟著背景一起滑的圖層：燭火要黏在提燈上、去背的牛要對準背景裡的牛 */}
      <div className={styles.track}>
        <div className={styles.lantern} />
        {/* 長圖第一段和第二段的拼接線，用一條霧帶蓋住 */}
        <div className={styles.seam} />
        <img className={styles.cow} src={`${import.meta.env.BASE_URL}${COW.src}`} alt="" />
      </div>

      {/* 5. 前層迷霧：從牛腳邊飄過 */}
      <div className={`${styles.fog} ${styles.fogFront}`} />

      {/* 5-1. 近處的雪：又大又模糊、落得快，像就在鏡頭前面（首頁才有） */}
      <div className={`${styles.snow} ${styles.snowNear}`} />

      {/* 6. 頂部壓暗：讓白字在淺色霧地上也看得清楚；越往進度頁滑越深 */}
      <div className={styles.scrim} />
      <div className={`${styles.scrim} ${styles.scrimStrong}`} />
    </div>
  )
}
