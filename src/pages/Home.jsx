import styles from './Home.module.css'

// 畫面一：開場首頁（第 1 頁）
// active：現在是不是在這一頁；onStart：點 Start 時要做的事（翻到下一頁）
export default function Home({ active, onStart }) {
  return (
    // inert：不在畫面上時，鍵盤 Tab 和螢幕報讀器都跳過這一頁
    <section className={styles.home} inert={!active}>
      <div className={styles.titleBlock}>
        {/* 主標題分三行；aria-label 讓螢幕報讀器唸成一整句 */}
        <h1 className={styles.title} aria-label="冰上沒有牛。">
          <span aria-hidden="true">冰上</span>
          <span aria-hidden="true">沒有</span>
          <span aria-hidden="true">牛。</span>
        </h1>
        <p className={styles.subtitle}>
          歡迎來到北歐童話世界。
          <br />
          請帶著好奇心，與我們一起踏上尋寶之旅。
        </p>
      </div>

      {/* magic-pulse-box：全站共用的「點我」呼吸光暈（定義在 global.css） */}
      <button type="button" className={`${styles.start} magic-pulse-box`} onClick={onStart}>
        Start
      </button>
    </section>
  )
}
