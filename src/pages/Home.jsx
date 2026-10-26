import styles from './Home.module.css'

// 畫面一：開場首頁（第 1 頁），日本展覽海報風格
// 版面：四個角落散落細節小字、主標題三行錯落、引言在左下、Start 在右下
// 巨型 NORDIC 浮水印放在背景層（Scenery.jsx），才能和冰原底圖混色
// active：現在是不是在這一頁；onStart：點 Start 時要做的事（翻到下一頁）
export default function Home({ active, onStart }) {
  return (
    // inert：不在畫面上時，鍵盤 Tab 和螢幕報讀器都跳過這一頁
    <section className={styles.home} inert={!active}>
      {/* 底部壓暗：讓白色小字壓在亮雪地上也讀得清楚 */}
      <div className={styles.bottomShade} aria-hidden="true" />

      {/* 左上角：展覽資訊 */}
      <p className={`${styles.meta} ${styles.topLeft}`}>
        NTU LIS EXHIBITION
        <br />
        VOL. 01 — 2026
      </p>

      {/* 右上角：四個北歐國家 */}
      <p className={`${styles.meta} ${styles.topRight}`}>
        SWEDEN / DENMARK
        <br />
        FINLAND / NORWAY
      </p>

      {/* 主標題：三行往右錯開；aria-label 讓螢幕報讀器唸成一整句 */}
      <h1 className={styles.title} aria-label="冰上沒有牛。">
        <span className={styles.line} aria-hidden="true">
          冰上
        </span>
        <span className={styles.line} aria-hidden="true">
          沒有
        </span>
        <span className={styles.line} aria-hidden="true">
          牛。
        </span>
      </h1>

      {/* 左下角：瑞典諺語＋歡迎詞 */}
      <div className={styles.quote}>
        <p className={styles.proverb} lang="sv">
          “Det är ingen ko på isen.”
        </p>
        <p className={styles.welcome}>
          歡迎來到北歐童話世界。
          <br />
          請帶著好奇心，與我們一起踏上尋寶之旅。
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
