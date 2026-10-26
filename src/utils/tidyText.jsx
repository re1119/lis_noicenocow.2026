import { Children, cloneElement, isValidElement } from 'react'

// ============================================
// 中文斷行整理：在畫面顯示前，把「不應該被拆開」的字黏在一起
// 黏住的方法：包進 <span class="nobr">（white-space: nowrap，見 global.css）
// 瀏覽器就只會在黏住的範圍「之間」換行，不管手機多寬都適用
//
// 排版原則：
//   1. 標點不能出現在行首 → 標點和前面的字黏在一起
//   2. 不能「一個字＋標點」開頭（例如「呢！」）→ 標點連同前面兩個字一起黏
//   3. 「」引號不要上下拆開 → 16 字以內的引號整組黏住
//   另外：段落最後不要只剩一個字；短的英文詞組（Tivoli Gardens）不拆開
// ============================================

const CLOSE = '。，、；：？！」』）】》〉…～~'
const QUOTES = { '「': '」', '『': '』', '“': '”' }
const MAX_GROUP = 16 // 黏在一起最多幾個字，太長會超出畫面
const LATIN = /[A-Za-z0-9À-ž.'\-]/

const isSpace = (s) => /^\s+$/.test(s)
const isCJK = (s) => s.length === 1 && !isSpace(s) && !LATIN.test(s)

// 把一段文字切成「不能再拆的小塊」
function toUnits(str) {
  const units = []
  let i = 0
  while (i < str.length) {
    const ch = str[i]
    // 引號：整組當成一塊
    if (QUOTES[ch]) {
      const end = str.indexOf(QUOTES[ch], i + 1)
      if (end > 0 && end - i + 1 <= MAX_GROUP) {
        units.push(str.slice(i, end + 1))
        i = end + 1
        continue
      }
    }
    // 英文、數字：一整個字當成一塊
    if (LATIN.test(ch)) {
      let j = i
      while (j < str.length && LATIN.test(str[j])) j++
      units.push(str.slice(i, j))
      i = j
      continue
    }
    units.push(ch)
    i++
  }

  // 合併：標點黏到前面；前面只剩一個字的話，再往前多黏一塊
  const out = []
  for (const u of units) {
    const last = out[out.length - 1]
    if (last && !isSpace(last) && CLOSE.includes(u[0]) && u.length === 1) {
      out[out.length - 1] = last + u
      const core = last.replace(/[^\S]/g, '')
      const bindMore = core.length === 1 || /^[\d.\-]+$/.test(core)
      if (bindMore && out.length >= 2) {
        // 前一塊如果是空格（例如「21-24 頁，」），連同空格前的那一塊一起黏
        let k = out.length - 2
        let merged = out[k] + out[k + 1]
        if (isSpace(out[k]) && k >= 1) {
          k -= 1
          merged = out[k] + merged
        }
        if (merged.length <= MAX_GROUP) out.splice(k, out.length - k, merged)
      }
      continue
    }
    // 兩個英文字中間只隔一個空格、合起來不長：黏在一起（Tivoli Gardens）
    if (
      out.length >= 2 &&
      LATIN.test(u[0]) &&
      out[out.length - 1] === ' ' &&
      LATIN.test(out[out.length - 2].slice(-1)) &&
      out[out.length - 2].length + 1 + u.length <= MAX_GROUP
    ) {
      out.splice(out.length - 2, 2, `${out[out.length - 2]} ${u}`)
      continue
    }
    out.push(u)
  }

  // 段落最後只剩一個中文字（例如「囉」）：和前一塊黏在一起
  const tail = out[out.length - 1]
  if (out.length >= 2 && isCJK(tail) && !isSpace(out[out.length - 2])) {
    const merged = out[out.length - 2] + tail
    if (merged.length <= MAX_GROUP) out.splice(out.length - 2, 2, merged)
  }
  return out
}

// 一段文字 → React 可以顯示的內容（單字直接放、黏住的包 span）
// 最外面再包一層 span：文字放在 flex 容器裡時（例如左邊有圖示的按鈕），
// 才會像原本一樣是「一整段文字」，不會被 flex 拆成好幾塊各自排開
function tidyString(str) {
  const units = toUnits(str)
  if (!units.some((u) => u.length > 1 && !isSpace(u))) return str // 沒有需要黏的字，原樣不動
  return <span>{tidyNodes(units)}</span>
}

function tidyNodes(units) {
  const nodes = []
  let plain = ''
  units.forEach((u, i) => {
    if (u.length > 1 && !isSpace(u)) {
      if (plain) nodes.push(plain)
      plain = ''
      nodes.push(
        <span key={i} className="nobr">
          {u}
        </span>,
      )
    } else {
      plain += u
    }
  })
  if (plain) nodes.push(plain)
  return nodes
}

// 整理一整棵畫面：找到裡面所有文字（包含元件的 children），逐一整理
// 用法：在畫面元件裡 return tidy(<div>…</div>)
// 注意：只整理「這一段 JSX 裡寫出來的字」，別的元件自己 return 的字要在那個元件裡再 tidy 一次
export function tidy(node) {
  if (typeof node === 'string') return tidyString(node)
  if (Array.isArray(node)) return Children.map(node, tidy)
  if (isValidElement(node) && node.props.children != null) {
    return cloneElement(node, undefined, ...[].concat(Children.map(node.props.children, tidy) ?? []))
  }
  return node
}
