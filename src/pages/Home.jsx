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

      {/* 文字層：會跟著滑鼠做一點點視差（比巨字更靠近我們，所以方向相反） */}
      <div className={styles.layer}>
        {/* 左上角：瑞典諺語原文「冰上沒有牛」 */}
        <p className={styles.proverb} lang="sv">
          “Det är ingen ko på isen.”
        </p>

        {/* 左側直書：標題只寫「冰上沒有」，由背景的巨字「牛」和「。」接下去
            aria-label 讓螢幕報讀器唸出完整的一句 */}
        <div className={styles.titleColumn}>
          <h1 className={styles.title} aria-label="冰上沒有牛。">
            <span aria-hidden="true">冰上沒有</span>
          </h1>
          <p className={styles.subtitle}>北歐書展・精靈尋寶</p>
        </div>

        {/* 沿著左邊緣直排的英文資訊，星號連到牛下方的註腳 */}
        <p className={styles.sideMeta}>
          NO COW ON ICE<span className={styles.star}>*</span> · NORDIC BOOK FAIR · NTU LIS
        </p>

        {/* 註腳：在牛的下方，細線往上指到牛腳——「冰上沒有牛*（除了這頭）」 */}
        <p className={styles.footnote}>
          <span className={styles.leader} aria-hidden="true" />
          *EXCEPT THIS ONE.
        </p>

        {/* 右下角：濃縮的英文展期 */}
        <div className={styles.dates}>
          <span className={styles.rule} aria-hidden="true" />
          <p className={styles.dateRange}>
            <time dateTime="2026-10-29">OCT 29</time>
            <span className={styles.dash}> — </span>
            <time dateTime="2026-11-11">NOV 11</time>
          </p>
          <p className={styles.year}>2026</p>
        </div>
      </div>

      {/* 右下角：極簡文字按鈕；magic-pulse 是全站共用的「點我」呼吸光暈（global.css） */}
      <button type="button" className={`${styles.start} magic-pulse`} onClick={onStart}>
        BEGIN EXPLORATION
        <i className="iconoir-arrow-right" aria-hidden="true" />
      </button>
    </section>
  )
}
