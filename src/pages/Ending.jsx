import { useCallback, useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { FAVORITE_AREAS, GUARDIANS, WEB3FORMS_KEY } from '../data/ending.js'
import quiz from '../styles/quiz.module.css'
import { tidy } from '../utils/tidyText.jsx'
import styles from './Ending.module.css'

const asset = (path) => `${import.meta.env.BASE_URL}${path}`

// 巨牛衝鋒多久之後，登機證才淡入
const CHARGE_MS = 5000
// 登機證的撕線缺口：在卡片高度 72% 的位置，半徑是卡片寬度的 5.5%
// （畫面上用 CSS 遮罩挖洞；下載圖片時用程式在圖片上挖同樣的洞）
const NOTCH_Y = 0.72
const NOTCH_R = 0.055
// 下載的圖片寬度（px）：手機桌布、社群限動都夠清楚
const EXPORT_WIDTH = 1080

// 今天的日期，例如 2026.10.27
function today() {
  const d = new Date()
  const pad = (n) => String(n).padStart(2, '0')
  return `${d.getFullYear()}.${pad(d.getMonth() + 1)}.${pad(d.getDate())}`
}

// ============================================
// 全破結局（第 7 頁）：製作登機證 → 巨牛衝鋒 → 登機證＋回饋表單
// ============================================
export default function Ending({ active, navigate }) {
  // stage：create 製作登機證 → charge 巨牛衝鋒 → pass 登機證（下面接回饋表單）
  const [stage, setStage] = useState('create')
  const [nickname, setNickname] = useState('')
  const [guardian, setGuardian] = useState(0)

  // 每次「進入」結局頁都從頭開始
  const wasActive = useRef(active)
  useEffect(() => {
    if (active && !wasActive.current) setStage('create')
    wasActive.current = active
  }, [active])

  // 衝鋒 5 秒後換成登機證
  useEffect(() => {
    if (stage !== 'charge') return
    const timer = setTimeout(() => setStage('pass'), CHARGE_MS)
    return () => clearTimeout(timer)
  }, [stage])

  return (
    <section className={styles.ending} inert={!active} aria-label="全破結局：專屬北歐登機證">
      {/* 深色迷霧底：蓋住後面的冰原 */}
      <div className={styles.mist} aria-hidden="true" />

      <AnimatePresence mode="wait">
        {stage === 'create' && (
          <motion.div
            key="create"
            className={styles.screen}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, transition: { duration: 0.5 } }}
          >
            <CreatePass
              nickname={nickname}
              setNickname={setNickname}
              guardian={guardian}
              setGuardian={setGuardian}
              onConfirm={() => setStage('charge')}
            />
          </motion.div>
        )}
        {stage === 'charge' && (
          <motion.div
            key="charge"
            className={styles.screen}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, transition: { duration: 0.8 } }}
          >
            <Charge />
          </motion.div>
        )}
        {stage === 'pass' && (
          <motion.div key="pass" className={styles.screen} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <PassAndFeedback
              nickname={nickname.trim()}
              guardian={GUARDIANS[guardian]}
              onHome={() => navigate('/')}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  )
}

/* ============ 第一頁：製作登機證 ============ */
function CreatePass({ nickname, setNickname, guardian, setGuardian, onConfirm }) {
  const [error, setError] = useState('')

  const confirm = () => {
    if (!nickname.trim()) {
      setError('請先輸入你的探險家暱稱')
      return
    }
    onConfirm()
  }

  return tidy(
    <div className={styles.create}>
      <h2 className={styles.createTitle}>
        製作你的專屬北歐登機證
        <i className="iconoir-airplane" aria-hidden="true" />
      </h2>

      <div className={`${styles.createCard} ${quiz.glass}`}>
        <label className={styles.field}>
          <span className={styles.fieldLabel}>探險家暱稱</span>
          <input
            className={styles.input}
            type="text"
            value={nickname}
            maxLength={12}
            placeholder="輸入你的暱稱"
            onChange={(e) => {
              setNickname(e.target.value)
              if (error) setError('')
            }}
            aria-invalid={!!error}
            aria-describedby="nickname-error"
          />
        </label>
        <p id="nickname-error" className={styles.error} role="alert">
          {error}
        </p>

        <div className={styles.field}>
          <span className={styles.fieldLabel} id="guardian-label">
            選擇守護精靈
          </span>
          <GuardianCarousel value={guardian} onChange={setGuardian} />
        </div>
      </div>

      <button type="button" className={`${quiz.glowButton} ${styles.mainButton} magic-pulse-box`} onClick={confirm}>
        確認生成
        <i className="iconoir-arrow-right" aria-hidden="true" />
      </button>
    </div>,
  )
}

/* ---------- 守護精靈 3D 輪播：左右滑動、點兩側、或按方向鍵選 ---------- */
function GuardianCarousel({ value, onChange }) {
  const count = GUARDIANS.length
  const start = useRef(null)
  // 這次是不是「滑動」：滑動放開時，手指下面那隻精靈不能被當成「點了一下」
  const dragged = useRef(false)

  const go = (dir) => onChange((value + dir + count) % count)

  // 手指左右滑動超過 40px 就換一位
  const onPointerDown = (e) => {
    start.current = e.clientX
    dragged.current = false
  }
  const onPointerUp = (e) => {
    if (start.current === null) return
    const dx = e.clientX - start.current
    start.current = null
    dragged.current = Math.abs(dx) > 10
    if (Math.abs(dx) > 40) go(dx < 0 ? 1 : -1)
  }

  return (
    <div
      className={styles.carousel}
      role="listbox"
      aria-labelledby="guardian-label"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'ArrowRight') go(1)
        if (e.key === 'ArrowLeft') go(-1)
      }}
      onPointerDown={onPointerDown}
      onPointerUp={onPointerUp}
      onPointerCancel={() => (start.current = null)}
    >
      <div className={styles.stage3d}>
        {GUARDIANS.map((g, i) => {
          // offset：離目前選中的那位差幾格（繞一圈，所以最左邊和最右邊是相鄰的）
          let offset = i - value
          if (offset > count / 2) offset -= count
          if (offset < -count / 2) offset += count
          const selected = offset === 0
          return (
            <button
              key={g.id}
              type="button"
              className={`${styles.guardian} ${selected ? styles.guardianOn : ''}`}
              style={{ '--offset': offset, '--abs': Math.abs(offset) }}
              onClick={() => {
                if (!dragged.current) onChange(i)
              }}
              role="option"
              aria-selected={selected}
              aria-label={g.name}
              tabIndex={-1}
            >
              <span className={styles.guardianGlow} aria-hidden="true" />
              <img src={asset(g.img)} alt="" draggable={false} />
            </button>
          )
        })}
      </div>

      <button type="button" className={`${styles.arrow} ${styles.arrowLeft}`} onClick={() => go(-1)} aria-label="上一位">
        <i className="iconoir-nav-arrow-left" aria-hidden="true" />
      </button>
      <button type="button" className={`${styles.arrow} ${styles.arrowRight}`} onClick={() => go(1)} aria-label="下一位">
        <i className="iconoir-nav-arrow-right" aria-hidden="true" />
      </button>

      <p className={styles.guardianName} aria-live="polite">
        {GUARDIANS[value].name}
      </p>
    </div>
  )
}

/* ============ 第二頁之一：大霧與巨牛衝鋒 ============ */
function Charge() {
  return (
    <div className={styles.charge} aria-label="一頭高地牛從大霧深處衝過來">
      <div className={`${styles.fogLayer} ${styles.fogA}`} aria-hidden="true" />
      <motion.div
        className={styles.chargeCow}
        initial={{ scale: 0.1, opacity: 0 }}
        animate={{ scale: [0.1, 1, 6], opacity: [0, 1, 0] }}
        // 前段慢慢浮現、越跑越快，最後一下子衝破螢幕
        transition={{ duration: 4.4, times: [0, 0.62, 1], ease: ['easeOut', 'easeIn'], delay: 0.3 }}
      >
        {/* 奔跑的上下顛簸 */}
        <img className={styles.gallop} src={asset('images/home-cow.png')} alt="" />
      </motion.div>
      <div className={`${styles.fogLayer} ${styles.fogB}`} aria-hidden="true" />
    </div>
  )
}

/* ============ 第二頁之二＋第三頁：登機證 ↕ 回饋表單 ============ */
function PassAndFeedback({ nickname, guardian, onHome }) {
  // panel：pass 登機證 / form 回饋表單（上下滑動切換）
  const [panel, setPanel] = useState('pass')
  const startY = useRef(null)

  // 上下滑動：往上滑看表單、往下滑回登機證（在輸入框、滑桿上不算）
  const isField = (el) => el.closest('input, textarea')
  const onPointerDown = (e) => {
    startY.current = isField(e.target) ? null : e.clientY
  }
  const onPointerUp = (e) => {
    if (startY.current === null) return
    const dy = e.clientY - startY.current
    startY.current = null
    if (dy < -60) setPanel('form')
    if (dy > 60) setPanel('pass')
  }
  const onWheel = (e) => {
    if (isField(e.target) || Math.abs(e.deltaY) < 10) return
    setPanel(e.deltaY > 0 ? 'form' : 'pass')
  }

  return (
    <div
      className={styles.panels}
      style={{ '--panel': panel === 'form' ? 1 : 0 }}
      onPointerDown={onPointerDown}
      onPointerUp={onPointerUp}
      onWheel={onWheel}
    >
      <div className={styles.panel} inert={panel !== 'pass'}>
        <PassPanel nickname={nickname} guardian={guardian} onFeedback={() => setPanel('form')} />
      </div>
      <div className={styles.panel} inert={panel !== 'form'}>
        <FeedbackForm nickname={nickname} guardian={guardian} onHome={onHome} onBack={() => setPanel('pass')} />
      </div>
    </div>
  )
}

/* ---------- 登機證本體（畫面上和下載用的是同一個元件） ---------- */
function BoardingPass({ nickname, guardian, date }) {
  return (
    <div className={styles.pass} style={{ '--notch-y': `${NOTCH_Y * 100}%`, '--notch-r': `${NOTCH_R * 100}cqi` }}>
      <div className={styles.passFrame} aria-hidden="true" />

      <div className={styles.passTop}>
        <div className={styles.passMeta}>
          <span>FLIGHT: LIS_NO-COW-NO-ICE</span>
          <span>DATE: {date}</span>
        </div>
        <p className={styles.passExhibit}>NORDIC EXHIBITION</p>
        <p className={styles.passTitle}>BOARDING PASS</p>
      </div>

      <div className={styles.passVisual}>
        <span className={styles.passGlow} aria-hidden="true" />
        <img src={asset(guardian.img)} alt={`守護精靈：${guardian.name}`} />
      </div>

      <div className={styles.passPassenger}>
        <p className={styles.passLabel}>EXPLORER / 探險家</p>
        <p className={styles.passName}>✦ {nickname} ✦</p>
        <p className={styles.passQuote}>“{tidy(guardian.quote)}”</p>
      </div>

      <div className={styles.passStubSpace} aria-hidden="true" />

      {/* 撕線：兩側的半圓缺口用遮罩挖，中間是淡淡的虛線 */}
      <div className={styles.passTear} aria-hidden="true" />

      <div className={styles.passStub}>
        <div>
          <span className={styles.passLabel}>CLASS</span>
          <span className={styles.passStubValue}>FIRST</span>
        </div>
        <div>
          <span className={styles.passLabel}>DESTINATION</span>
          <span className={styles.passStubValue}>HYGGE</span>
        </div>
      </div>
    </div>
  )
}

function PassPanel({ nickname, guardian, onFeedback }) {
  const [date] = useState(today)
  const [image, setImage] = useState(null) // 產生好的登機證圖片（data URL）
  const [busy, setBusy] = useState(false)
  const [exporting, setExporting] = useState(false)
  const exportRef = useRef(null)

  // 下載：在畫面外另外畫一張固定寬度的登機證，用 html2canvas 拍成圖片，再挖出兩側的撕線缺口
  const download = useCallback(async () => {
    setBusy(true)
    setExporting(true)
    try {
      const { default: html2canvas } = await import('html2canvas')
      await document.fonts.ready
      await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)))
      const el = exportRef.current
      const scale = EXPORT_WIDTH / el.offsetWidth
      const canvas = await html2canvas(el, { scale, backgroundColor: null, useCORS: true, logging: false })
      // html2canvas 看不懂 CSS 遮罩，所以缺口自己挖
      const ctx = canvas.getContext('2d')
      // html2canvas 畫的時候放大過，先把縮放重設，下面的座標才是真正的像素位置
      ctx.setTransform(1, 0, 0, 1, 0, 0)
      ctx.globalCompositeOperation = 'destination-out'
      const r = canvas.width * NOTCH_R
      const y = canvas.height * NOTCH_Y
      for (const x of [0, canvas.width]) {
        ctx.beginPath()
        ctx.arc(x, y, r, 0, Math.PI * 2)
        ctx.fill()
      }
      setImage(canvas.toDataURL('image/png'))
    } catch {
      setImage('error')
    } finally {
      setExporting(false)
      setBusy(false)
    }
  }, [])

  return tidy(
    <div className={styles.passPanel}>
      {/* 登機證：從下方帶著一點旋轉、飄逸地浮上來，之後輕輕漂浮 */}
      <motion.div
        className={styles.passWrap}
        initial={{ y: 50, rotate: -2, opacity: 0 }}
        animate={{ y: 0, rotate: 0, opacity: 1 }}
        transition={{ duration: 1.6, ease: [0.2, 0.8, 0.2, 1] }}
      >
        <div className={styles.passFloat}>
          <BoardingPass nickname={nickname} guardian={guardian} date={date} />
        </div>
      </motion.div>

      <motion.div
        className={styles.passActions}
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 1.2 }}
      >
        <div className={styles.buttonRow}>
          <button type="button" className={`${quiz.glowButton} ${styles.smallButton}`} onClick={download} disabled={busy}>
            <i className={busy ? 'iconoir-refresh-double' : 'iconoir-download'} aria-hidden="true" />
            {busy ? '產生中…' : '下載專屬登機證'}
          </button>
          <button type="button" className={`${quiz.glowButton} ${styles.smallButton}`} onClick={onFeedback}>
            回饋
            <i className="iconoir-arrow-down" aria-hidden="true" />
          </button>
        </div>

        <ul className={styles.tips}>
          <li>
            <i className="iconoir-bookmark-book" aria-hidden="true" />
            恭喜通關，歡迎到盒子裡抽取一張屬於你的北歐金句書籤
          </li>
          <li>
            <i className="iconoir-tree" aria-hidden="true" />
            離開前，也別忘了到聖誕樹上掛上你的留言卡呦
          </li>
          <li>
            <i className="iconoir-chat-lines" aria-hidden="true" />
            想花 30 秒聽聽你對這次展覽的心得...
          </li>
        </ul>
      </motion.div>

      {/* 下載用的登機證：放在畫面外、固定寬度，沒有任何旋轉或漂浮 */}
      {exporting &&
        createPortal(
          <div className={styles.exportBox} ref={exportRef}>
            <BoardingPass nickname={nickname} guardian={guardian} date={date} />
          </div>,
          document.body,
        )}

      {/* 圖片產生好了：顯示圖片，電腦可以直接下載、手機長按儲存 */}
      {image && (
        <div className={styles.modal} role="dialog" aria-modal="true" aria-label="你的專屬登機證">
          {image === 'error' ? (
            <p className={styles.modalHint}>圖片產生失敗了，可以直接截圖保存喔！</p>
          ) : (
            <>
              <img className={styles.modalImage} src={image} alt="你的專屬北歐登機證" />
              <p className={styles.modalHint}>手機請長按圖片「儲存影像」</p>
              <a className={`${quiz.glowButton} ${styles.smallButton}`} href={image} download="北歐登機證.png">
                <i className="iconoir-download" aria-hidden="true" />
                下載圖片
              </a>
            </>
          )}
          <button type="button" className={styles.modalClose} onClick={() => setImage(null)} aria-label="關閉">
            <i className="iconoir-xmark" aria-hidden="true" />
          </button>
        </div>
      )}
    </div>,
  )
}

/* ============ 第三頁：極簡回饋表單 ============ */
function FeedbackForm({ nickname, guardian, onHome, onBack }) {
  const [score, setScore] = useState(3)
  const [scored, setScored] = useState(false) // 有沒有動過滑桿（必填）
  const [areas, setAreas] = useState([])
  const [message, setMessage] = useState('')
  const [status, setStatus] = useState('idle') // idle / sending / done
  const [error, setError] = useState('')

  const pickScore = (v) => {
    setScore(v)
    setScored(true)
    setError('')
  }

  const toggleArea = (a) => {
    setAreas((list) => (list.includes(a) ? list.filter((x) => x !== a) : [...list, a]))
    setError('')
  }

  const submit = async (e) => {
    e.preventDefault()
    if (!scored) return setError('請先拖動嚕嚕米，給這次的書展打個分數')
    if (areas.length === 0) return setError('請至少選一個最喜歡的區域')
    if (WEB3FORMS_KEY === 'YOUR_WEB3FORMS_KEY') return setError('回饋表單還沒設定好，請告訴現場工作人員，謝謝你！')

    setStatus('sending')
    try {
      const res = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({
          access_key: WEB3FORMS_KEY,
          subject: '冰上沒有牛：書展回饋',
          from_name: nickname || '匿名探險家',
          滿意度: `${score} / 5`,
          最喜歡的區域: areas.join('、'),
          想說的話: message.trim() || '（沒有填寫）',
          守護精靈: guardian.name,
        }),
      })
      const data = await res.json()
      if (!data.success) throw new Error(data.message)
      setStatus('done')
    } catch {
      setStatus('idle')
      setError('送出失敗了，請確認網路後再試一次')
    }
  }

  if (status === 'done') {
    return tidy(
      <motion.div
        className={styles.thanks}
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.9 }}
      >
        <p className={styles.thanksText}>
          再次感謝您撥空觀展，
          <br />
          祝福之後的生活也滿滿 HYGGE
          <br />
          呼嘎呼嘎呦 ~
          <i className="iconoir-heart-solid" aria-hidden="true" />
        </p>
        <button type="button" className={quiz.glowButton} onClick={onHome}>
          回到首頁
        </button>
      </motion.div>,
    )
  }

  return tidy(
    <form className={`${styles.form} ${quiz.glass}`} onSubmit={submit} noValidate>
      <button type="button" className={styles.formBack} onClick={onBack} aria-label="回到登機證">
        <i className="iconoir-nav-arrow-up" aria-hidden="true" />
      </button>

      {/* Q1 滿意度：滑桿只會停在 1～5 整數，嚕嚕米當拉桿 */}
      <fieldset className={styles.q}>
        <legend className={styles.qTitle}>
          這次的書展體驗，您會給幾分呢？<span className={styles.required}>必填</span>
        </legend>
        <div className={styles.scoreRow}>
          <input
            className={styles.slider}
            type="range"
            min="1"
            max="5"
            step="1"
            value={score}
            onChange={(e) => pickScore(Number(e.target.value))}
            onPointerDown={() => setScored(true)}
            style={{ '--thumb': `url(${asset('images/moomin-unlocked.png')})`, '--fill': `${((score - 1) / 4) * 100}%` }}
            aria-label="滿意度，1 到 5 分"
            aria-valuetext={`${score} 分`}
          />
          <span className={styles.scoreValue}>{scored ? `${score} 分` : '－'}</span>
        </div>
        <div className={styles.ticks} aria-hidden="true">
          {[1, 2, 3, 4, 5].map((n) => (
            <button key={n} type="button" tabIndex={-1} onClick={() => pickScore(n)} className={scored && n === score ? styles.tickOn : ''}>
              {n}
            </button>
          ))}
        </div>
      </fieldset>

      {/* Q2 最喜歡的區域：可以複選的膠囊按鈕 */}
      <fieldset className={styles.q}>
        <legend className={styles.qTitle}>
          本次佈展最喜歡的區域？<span className={styles.required}>必填・可複選</span>
        </legend>
        <div className={styles.pills}>
          {FAVORITE_AREAS.map((a) => (
            <button
              key={a}
              type="button"
              className={`${styles.pill} ${areas.includes(a) ? styles.pillOn : ''}`}
              onClick={() => toggleArea(a)}
              aria-pressed={areas.includes(a)}
            >
              {a}
            </button>
          ))}
        </div>
      </fieldset>

      {/* Q3 想說的話：選填 */}
      <label className={styles.q}>
        <span className={styles.qTitle}>歡迎留下任何想說的話或是建議！（選填）</span>
        <textarea
          className={styles.textarea}
          rows={3}
          maxLength={500}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />
      </label>

      <p className={styles.error} role="alert">
        {error}
      </p>

      <button type="submit" className={`${quiz.glowButton} ${styles.mainButton}`} disabled={status === 'sending'}>
        {status === 'sending' ? (
          <>
            <span className={styles.spinner} aria-hidden="true" />
            送出中
          </>
        ) : (
          <>
            送出回饋
            <i className="iconoir-arrow-right" aria-hidden="true" />
          </>
        )}
      </button>
    </form>,
  )
}
