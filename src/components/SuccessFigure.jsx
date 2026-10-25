import quiz from '../styles/quiz.module.css'

// 星光粒子的位置與大小（在精靈周圍），每顆錯開閃爍時間
const SPARKLES = [
  { x: 12, y: 22, s: 10, d: 0 },
  { x: 84, y: 14, s: 14, d: 0.6 },
  { x: 92, y: 58, s: 8, d: 1.2 },
  { x: 6, y: 66, s: 12, d: 0.9 },
  { x: 70, y: 86, s: 9, d: 1.6 },
  { x: 26, y: 90, s: 7, d: 0.3 },
  { x: 50, y: 4, s: 8, d: 1.9 },
]

// 通關頁頂部：懸浮的精靈＋周圍閃爍的星光
export default function SuccessFigure({ img, alt }) {
  return (
    <div className={`${quiz.successFigure} ${quiz.pop}`}>
      <span className={quiz.floating}>
        <img src={`${import.meta.env.BASE_URL}${img}`} alt={alt} />
      </span>
      {SPARKLES.map((p, i) => (
        <span
          key={i}
          className={quiz.sparkle}
          style={{ left: `${p.x}%`, top: `${p.y}%`, '--size': `${p.s}px`, '--d': `${p.d}s` }}
          aria-hidden="true"
        />
      ))}
    </div>
  )
}
