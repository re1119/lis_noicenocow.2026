// 每一頁（由上到下）對應長背景圖要停在哪裡（background-position-y 的百分比）
// 0% = 最上面的冰山；數字越大，畫面越往下滑
export const SECTION_POSITIONS = [
  0, // 第 1 頁：開場首頁
  20, // 第 2 頁：進度頁
  // 之後的關卡照順序加：40, 60, 80
]

// 總共有幾頁
export const PAGE_COUNT = SECTION_POSITIONS.length

// 長背景圖的原始尺寸，用來算提燈這類「黏在圖上」的東西要放哪
export const BG_IMAGE = {
  src: 'images/bg-long.jpg',
  width: 768,
  height: 5536,
}

// 長圖是好幾段場景接起來的；第一段（冰山＋牛＋提燈）在原圖 0–1290px
// 背景會縮放到「第一段剛好填滿一個螢幕高」，首頁才不會露出接縫
export const FIRST_SCENE_HEIGHT = 1290

// 提燈在原圖上的像素位置
export const LANTERN = { x: 234, y: 1078 }
