// 字體瘦身：只保留網站上真的用到的字，產生很小的 .woff2 放進 src/assets/fonts/
// 用法：npm run fonts
// 什麼時候要跑：網站加了新的文字（新關卡、新題目）之後，再跑一次就好
//
// 原始字體檔太大（15MB 以上），不放進 GitHub，請放在 fonts-source/ 資料夾：
//   fonts-source/huiwen-mincho.otf          ← C:\字體\匯文明朝體.otf
//   fonts-source/gensen-rounded2-tw-m.otf   ← C:\字體\gensen-font-master\...\otf\TW\GenSenRounded2TW-M.otf

import { readFile, writeFile, readdir, mkdir } from 'node:fs/promises'
import { join, extname } from 'node:path'
import subsetFont from 'subset-font'

const FONTS = [
  { src: 'fonts-source/huiwen-mincho.otf', out: 'src/assets/fonts/huiwen-mincho.woff2' },
  { src: 'fonts-source/gensen-rounded2-tw-m.otf', out: 'src/assets/fonts/gensen-rounded2-tw-m.woff2' },
]

// 一律保留的字：英數、常用標點
const ALWAYS =
  ' abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789' +
  '.,!?:;\'"()-–—…/&@#%+' +
  '，。、！？：；「」『』（）《》〈〉…—～・'

// 把 src/ 底下所有程式檔和 index.html 的文字收集起來
async function collectText(dir) {
  let text = ''
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name)
    if (entry.isDirectory()) text += await collectText(path)
    else if (['.js', '.jsx', '.html'].includes(extname(entry.name))) text += await readFile(path, 'utf8')
  }
  return text
}

const text = ALWAYS + (await collectText('src')) + (await readFile('index.html', 'utf8'))
const chars = [...new Set(text)].join('')

await mkdir('src/assets/fonts', { recursive: true })
for (const font of FONTS) {
  const input = await readFile(font.src)
  const output = await subsetFont(input, chars, { targetFormat: 'woff2' })
  await writeFile(font.out, output)
  console.log(`${font.out}  ${(output.length / 1024).toFixed(0)} KB`)
}
console.log(`共保留 ${chars.length} 個字`)
