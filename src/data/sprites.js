// 四位精靈的資料：名字、未解鎖剪影、解鎖後的彩色圖、對應的關卡
// 圖片從 Figma 匯出的 SVG 裡抽出來、縮小過，放在 public/images/
// quiz：這位精靈要答對哪一關才解鎖；null = 關卡還沒做好
export const SPRITES = [
  {
    id: 'amaka',
    name: '阿瑪卡仙子',
    lockedImg: 'images/amaka-locked.png',
    unlockedImg: 'images/amaka-unlocked.png',
    quiz: 'Q1',
  },
  {
    id: 'moomin',
    name: '嚕嚕米',
    lockedImg: 'images/moomin-locked.png',
    unlockedImg: 'images/moomin-unlocked.png',
    quiz: null,
  },
  {
    id: 'snufkin',
    name: '史力奇',
    lockedImg: 'images/snufkin-locked.png',
    unlockedImg: 'images/snufkin-unlocked.png',
    quiz: 'Q2',
  },
  {
    id: 'little-my',
    name: '亞美',
    lockedImg: 'images/little-my-locked.png',
    unlockedImg: 'images/little-my-unlocked.png',
    quiz: null,
  },
]
