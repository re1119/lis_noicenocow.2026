# 冰上沒有牛。北歐精靈尋寶

北歐童話風格的手機版互動闖關網頁（書展＋系圖實作）。

## 開發

```bash
npm install     # 第一次下載專案後執行一次
npm run dev     # 開發模式，打開 http://localhost:5173
npm run build   # 打包成 dist/，要上線時用
```

## 網址

- 原始碼：https://github.com/re1119/lis_noicenocow.2026
- 網站：https://re1119.github.io/lis_noicenocow.2026/
- 部署狀況：https://github.com/re1119/lis_noicenocow.2026/actions

push 到 main 後約 1–2 分鐘，GitHub Actions 會自動 build 並更新網站。

## 檔案結構

- `src/App.jsx`：全螢幕翻頁容器，依網址決定在第幾頁、背景滑到哪裡
- `src/components/Scenery.jsx`：長背景圖、燭火、迷霧
- `src/pages/Home.jsx`：第 1 頁，開場首頁 `#/`
- `src/pages/Menu.jsx`：第 2 頁，進度頁 `#/menu`（含解鎖登場動畫）
- `src/pages/Q1.jsx`：第 3 頁，第一關 `#/q1/intro` → `#/q1/question` → `#/q1/success`
- `src/pages/Q2.jsx`：第 4 頁，第二關 `#/q2/intro` → `#/q2/question` → `#/q2/success`（3D 翻轉卡片＋反思題）
- `src/pages/Q3.jsx`：第 5 頁，第三關 `#/q3/intro` → `#/q3/game` → `#/q3/success`（framer-motion 拖曳收集）
- `src/pages/Q4.jsx`：第 6 頁，第四關 `#/q4/intro` → `#/q4/quiz` → `#/q4/success`（筆記本快問快答）
- `src/components/QuizStage.jsx`：每一關共用的換畫面、淡入淡出邏輯
- `src/components/QuizIntro.jsx`、`SuccessFigure.jsx`：共用的引導頁、通關頁精靈＋星光
- `src/styles/quiz.module.css`：每一關共用的動畫、標題、毛玻璃、提示樣式
- `src/hooks/useToast.js`：畫面中央的彈出小提示
- `src/data/scenes.js`：每一頁背景停在哪個百分比、網址對應哪一頁（新增關卡在這裡加）
- `src/data/sprites.js`：四位精靈的名字、圖片、對應的關卡
- `src/hooks/useHashPath.js`：讀寫網址 # 後面的路徑
- `src/hooks/useUnlocked.js`：解鎖狀態與 isQ1Solved 存進 LocalStorage
- `public/images/`：壓縮過的圖片素材

## 新增文字之後

網站加了新的文字（新關卡、新題目），要在專案資料夾執行 `npm run fonts`，
重新產生瘦身字體，否則新的字會顯示成備用字體。

## 測試小技巧

想把進度全部清掉、從頭玩：在瀏覽器開發者工具 Console 輸入
`localStorage.clear()` 再重新整理。
