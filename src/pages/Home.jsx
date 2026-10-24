import styles from './Home.module.css'

// 畫面一：開場首頁（第 1 屏）
export default function Home() {
  // 點 Start：平滑捲到下一屏的進度頁
  // 有開「減少動態效果」的使用者直接跳過去，不播滑動動畫
  const goToMenu = () => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    document.getElementById('menu')?.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth' })
  }

  return (
    <section className={styles.home}>
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

      <button type="button" className={styles.start} onClick={goToMenu}>
        Start
      </button>
    </section>
  )
}
