// 結局頁用的資料：可以選的守護精靈、登機證金句、回饋表單選項

// 守護精靈（5 選 1，最後一個是隱藏版高地牛）
// quote：登機證上的專屬金句
export const GUARDIANS = [
  {
    id: 'moomin',
    name: '嚕嚕米',
    img: 'images/moomin-unlocked.png',
    quote: '你的靈魂充滿溫暖，Hygge 是你的專屬魔法。',
  },
  {
    id: 'snufkin',
    name: '史力奇',
    img: 'images/snufkin-unlocked.png',
    quote: '自由是你最美的行李，世界處處皆是歸屬。',
  },
  {
    id: 'little-my',
    name: '亞美',
    img: 'images/little-my-unlocked.png',
    quote: '保持你的古靈精怪，勇敢揭開所有謎團。',
  },
  {
    id: 'amaka',
    name: '阿瑪卡仙子',
    img: 'images/amaka-unlocked.png',
    quote: '你的心中住著童話，日常也能點石成金。',
  },
  {
    id: 'cow',
    name: '高地牛',
    // 去掉霧邊的版本：原本的去背圖帶著一圈淺灰霧氣，放在淺色登機證上會像一塊灰框
    img: 'images/ending-cow.png',
    quote: '就算沒有牛來，你也能腳踏實地走出自己的路。',
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
export const WEB3FORMS_KEY = 'YOUR_WEB3FORMS_KEY'
