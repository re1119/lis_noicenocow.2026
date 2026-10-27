// 結局頁用的資料：可以選的守護精靈、登機證金句、回饋表單選項

// 守護精靈（5 選 1，最後一個是隱藏版高地牛）
// quote：登機證上的專屬金句
// 色彩系統（RGB 三個數字，方便在 CSS 裡調透明度）：
//   mist：Phase 2 背景迷霧的主色（飽和、偏深）；deep：迷霧最暗的底色
//   tint：登機證卡片裡淡淡的暈染色（實際只用約 10%～14% 的透明度）；靈魂成分表的進度條也用這個顏色
// traits：登機證底部的「北歐靈魂成分表」，特質名稱一律 6 個字
export const GUARDIANS = [
  {
    id: 'moomin',
    name: '嚕嚕米',
    img: 'images/moomin-unlocked.png',
    quote: '你的靈魂充滿溫暖，Hygge 是你的專屬魔法。',
    // 晨霧暖白／奶油黃
    mist: '214, 190, 132',
    deep: '44, 38, 28',
    tint: '236, 204, 120',
    traits: [
      { name: '呼嘎呼嘎指數', value: 95 },
      { name: '發呆放空時長', value: 85 },
      { name: '冬眠賴床天數', value: 90 },
    ],
  },
  {
    id: 'snufkin',
    name: '史力奇',
    img: 'images/snufkin-unlocked.png',
    quote: '自由是你最美的行李，世界處處皆是歸屬。',
    // 森林靜謐綠：灰綠／鼠尾草綠
    mist: '120, 152, 124',
    deep: '22, 34, 28',
    tint: '128, 168, 120',
    traits: [
      { name: '說走就走衝動', value: 99 },
      { name: '四海為家能力', value: 90 },
      { name: '極簡生活執念', value: 80 },
    ],
  },
  {
    id: 'little-my',
    name: '亞美',
    img: 'images/little-my-unlocked.png',
    quote: '保持你的古靈精怪，勇敢揭開所有謎團。',
    // 暮光磚紅：煙燻玫瑰紅／粉橘
    mist: '178, 104, 100',
    deep: '42, 24, 26',
    tint: '232, 140, 110',
    traits: [
      { name: '古靈精怪程度', value: 100 },
      { name: '直球對決勇氣', value: 95 },
      { name: '搞破壞行動力', value: 85 },
    ],
  },
  {
    id: 'amaka',
    name: '阿瑪卡仙子',
    img: 'images/amaka-unlocked.png',
    quote: '你的心中住著童話，日常也能點石成金。',
    // 夢幻極光紫：薰衣草紫／粉紫
    mist: '156, 136, 212',
    deep: '32, 26, 52',
    tint: '184, 140, 228',
    traits: [
      { name: '自帶仙氣濃度', value: 99 },
      { name: '點石成金魔法', value: 90 },
      { name: '浪漫幻想頻率', value: 85 },
    ],
  },
  {
    id: 'cow',
    name: '高地牛',
    // 去掉霧邊的版本：原本的去背圖帶著一圈淺灰霧氣，放在淺色登機證上會像一塊灰框
    img: 'images/ending-cow.png',
    quote: '就算沒有牛來，你也能腳踏實地走出自己的路。',
    // 冰川峽灣藍：冰藍帶灰／霜藍
    mist: '132, 168, 198',
    deep: '20, 30, 42',
    tint: '120, 168, 214',
    traits: [
      { name: '慢條斯理步調', value: 95 },
      { name: '毛茸茸溫暖度', value: 100 },
      { name: '腳踏實地固執', value: 90 },
    ],
  },
]

// 回饋表單 Q2：最喜歡的區域（照字數由少到多排列）
export const FAVORITE_AREAS = [
  '留言樹回饋區',
  '北歐金句抽籤',
  '主題選書陳列區',
  '心理測驗翻卡選書指引',
  '冰上沒有牛：圖鑑闖關網頁',
]

// Web3Forms 的存取金鑰：到 https://web3forms.com 輸入要收信的 email 就會寄來
// 這把金鑰本來就是設計給網頁前端公開使用的（只能用來寄信到你的信箱），可以放在程式裡
export const WEB3FORMS_KEY = '3411ed7c-e478-4d11-bef9-aa783fa063da'
