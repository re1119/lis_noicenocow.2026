import styles from './Home.module.css'

// 畫面一：開場首頁（第 1 頁），日本展覽海報風格
// 主角是背景層的巨字「牛」和站在字前面的真牛（都在 Scenery.jsx），
// 這裡只放少量文字，留出大片空白讓畫面呼吸
// active：現在是不是在這一頁；onStart：點 Start 時要做的事（翻到下一頁）
export default function Home({ active, onStart }) {
  return (
    // inert：不在畫面上時，鍵盤 Tab 和螢幕報讀器都跳過這一頁
    <section className={styles.home} inert={!active}>
      {/* 底部壓暗：讓白色小字壓在亮雪地上也讀得清楚 */}
      <div className={styles.bottomShade} aria-hidden="true" />

      {/* 左上角：展覽資訊 */}
      <p className={styles.meta}>
        NTU LIS EXHIBITION
        <br />
        VOL. 01
      </p>

      {/* 左側直書：主標題＋一行極小的瑞典諺語（「冰上沒有牛」的原文） */}
      <div className={styles.titleColumn}>
        <h1 className={styles.title}>冰上沒有牛。</h1>
        <p className={styles.proverb} lang="sv">
          Det är ingen ko på isen.
        </p>
      </div>

      {/* 右下角：英文展期 */}
      <div className={styles.dates}>
        <span className={styles.rule} aria-hidden="true" />
        <p className={styles.dateLabel}>EXHIBITION — 2026</p>
        {/* 兩行靠右堆疊：比一長行更像海報，也不會往左壓到提燈 */}
        <p className={styles.dateRange}>
          <time dateTime="2026-10-29">OCT 29</time>
          <span className={styles.dash} aria-label="到">—</span>
          <time dateTime="2026-11-11">NOV 11</time>
        </p>
      </div>

      {/* 右下角：極簡文字按鈕；magic-pulse 是全站共用的「點我」呼吸光暈（global.css） */}
      <button type="button" className={`${styles.start} magic-pulse`} onClick={onStart}>
        BEGIN EXPLORATION
        <i className="iconoir-arrow-right" aria-hidden="true" />
      </button>
    </section>
  )
}
