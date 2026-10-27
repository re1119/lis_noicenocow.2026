import { useEffect, useMemo, useState } from 'react'
import { BG_IMAGE, COW, FIRST_SCENE_HEIGHT, LANTERN } from '../data/scenes.js'
import styles from './Scenery.module.css'

// 牛甩掉的雪花有幾片：被點的時候撒一大把；自己每 5 秒輕輕抖一下時只撒一點點
const SHED_TAP = 26
const SHED_IDLE = 7
// 沒人點的時候，牛多久自己抖一下（提醒大家牠會動、可以點）
const IDLE_SHAKE_MS = 5000
const rand = (min, max) => min + Math.random() * (max - min)

// 背景場景：長圖本身不動畫，位置由翻頁決定（CSS 變數 --p，見 App.jsx）；
// 燭火、霧是另外疊上去的 div，製造「活著」的感覺
// 首頁海報：巨大的「牛」字夾在背景和去背的牛之間 → 真的牛站在字的前面
// isHome：現在是不是在首頁（只有首頁要跟著滑鼠做視差、牛才發光、自己抖動）
// cowShakes：牛被點了幾次，每次改變就抖一次、撒一把雪
export default function Scenery({ isHome, cowShakes }) {
  // shake.key 改變 → 抖一次；small：自己抖（輕、雪少）還是被點（大力、雪多）
  const [shake, setShake] = useState({ key: 0, small: false })

  // 被點了：大力抖一次
  useEffect(() => {
    if (cowShakes > 0) setShake((s) => ({ key: s.key + 1, small: false }))
  }, [cowShakes])

  // 在首頁時，每 5 秒自己輕輕抖一下；被點過就重新計時
  useEffect(() => {
    if (!isHome) return
    const timer = setInterval(() => setShake((s) => ({ key: s.key + 1, small: true })), IDLE_SHAKE_MS)
    return () => clearInterval(timer)
  }, [isHome, cowShakes])

  // 每抖一次，重新隨機產生一把雪花：從牛背上的某一點噴出去，往上一點再落下
  const shed = useMemo(
    () =>
      Array.from({ length: shake.small ? SHED_IDLE : SHED_TAP }, () => ({
        x: rand(18, 88), // 起點：牛的寬度百分比（牛背範圍）
        y: rand(8, 34), // 起點：牛的高度百分比
        dx: rand(-80, 80) * (shake.small ? 0.5 : 1), // 往左右飛多遠（px）
        up: rand(12, 42) * (shake.small ? 0.5 : 1), // 先往上彈多高
        fall: rand(60, 130), // 最後落到多低
        size: rand(3, 7.5) * (shake.small ? 0.7 : 1),
        delay: rand(0, 0.25),
        duration: rand(0.9, 1.5),
      })),
    [shake],
  )

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

      {/* 1-0. 霧雪補丁：蓋掉背景圖裡原本那頭牛（顏色取自牛四周的雪霧）
               去背的牛一動，底下才不會露出第二頭牛；放在巨字下面，字仍然看得到 */}
      <div className={styles.track}>
        <div className={styles.cowPatch} />
      </div>

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
        {/* 去背的牛：外層定位、中層待機呼吸＋「可以點」的光暈、內層負責抖動 */}
        <div className={styles.cowWrap}>
          {/* 牛腳下的陰影：讓牛「站」在雪地上、從背景裡浮出來 */}
          <div className={styles.cowShadow} />
          <div className={`${styles.cowIdle} ${isHome ? styles.cowHint : ''}`}>
            {/* key 改變 → 重新建立元素 → 抖動動畫每次都從頭播；自己抖的時候幅度小一點 */}
            <div
              key={shake.key}
              className={shake.key ? `${styles.cowShake} ${shake.small ? styles.cowShakeSmall : ''}` : undefined}
            >
              <img className={styles.cow} src={`${import.meta.env.BASE_URL}${COW.src}`} alt="" />
            </div>
          </div>

          {/* 甩下來的雪花 */}
          {shake.key > 0 && (
            <div key={`shed-${shake.key}`} className={styles.shed}>
              {shed.map((p, i) => (
                <span
                  key={i}
                  className={styles.flake}
                  style={{
                    left: `${p.x}%`,
                    top: `${p.y}%`,
                    width: `${p.size}px`,
                    height: `${p.size}px`,
                    '--dx': `${p.dx}px`,
                    '--up': `${p.up}px`,
                    '--fall': `${p.fall}px`,
                    animationDelay: `${p.delay}s`,
                    animationDuration: `${p.duration}s`,
                  }}
                />
              ))}
            </div>
          )}
        </div>
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
