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

- `src/App.jsx`：單頁捲動容器（一屏一屏吸附），依捲動位置更新背景
- `src/components/Scenery.jsx`：長背景圖、燭火、迷霧
- `src/pages/Home.jsx`：第 1 屏，開場首頁
- `src/pages/Menu.jsx`：第 2 屏，進度頁
- `src/data/scenes.js`：每一屏背景停在哪個百分比（新增關卡在這裡加）
- `src/data/sprites.js`：四位精靈的名字與圖片
- `src/hooks/useUnlocked.js`：解鎖狀態存進 LocalStorage
- `public/images/`：壓縮過的圖片素材

## 測試小技巧

想把精靈全部變回未解鎖：在瀏覽器開發者工具 Console 輸入
`localStorage.removeItem('noicenocow:unlocked')` 再重新整理。
