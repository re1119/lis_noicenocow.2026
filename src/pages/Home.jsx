import { useNavigate } from 'react-router-dom'
import styles from './Home.module.css'

// 畫面一：開場首頁
export default function Home() {
  const navigate = useNavigate()

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

      <button type="button" className={styles.start} onClick={() => navigate('/menu')}>
        Start
      </button>
    </section>
  )
}
