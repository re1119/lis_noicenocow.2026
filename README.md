# 冰上沒有牛。北歐精靈尋寶

北歐童話風格的手機版互動闖關網頁（書展＋系圖實作）。

## 開發

```bash
npm install     # 第一次下載專案後執行一次
npm run dev     # 開發模式，打開 http://localhost:5173
npm run build   # 打包成 dist/，要上線時用
```

## 檔案結構

- `src/App.jsx`：路由與換頁淡入淡出
- `src/components/Scenery.jsx`：長背景圖滑動、燭火、迷霧
- `src/pages/Home.jsx`：開場首頁 `/`
- `src/pages/Menu.jsx`：進度頁 `/menu`
- `src/data/scenes.js`：每頁背景停在哪個百分比（新增關卡在這裡加）
- `src/data/sprites.js`：四位精靈的名字與圖片
- `src/hooks/useUnlocked.js`：解鎖狀態存進 LocalStorage
- `public/images/`：壓縮過的圖片素材

## 測試小技巧

想把精靈全部變回未解鎖：在瀏覽器開發者工具 Console 輸入
`localStorage.removeItem('noicenocow:unlocked')` 再重新整理。
