// 每個頁面對應長背景圖要停在哪裡（background-position-y 的百分比）
// 0% = 最上面的冰山；數字越大，畫面越往下滑
export const SCENE_POSITIONS = {
  '/': 0,
  '/menu': 20,
  // 之後的關卡照這個格式加：
  // '/level/1': 40,
  // '/level/2': 60,
  // '/level/3': 80,
}

// 找不到的網址就停在首頁的位置
export function getScenePosition(pathname) {
  return SCENE_POSITIONS[pathname] ?? 0
}

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
