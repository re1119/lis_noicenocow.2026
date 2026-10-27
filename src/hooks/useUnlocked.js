import { useCallback, useEffect, useState } from 'react'

// LocalStorage 就像瀏覽器裡的「借閱紀錄卡」：
// 關掉分頁、重新整理都還在，直到使用者清除瀏覽資料
const STORAGE_KEY = 'noicenocow:unlocked'

// 每一關「答對了沒」各自一個紀錄，例如 isQ1Solved
const solvedKey = (quiz) => `is${quiz}Solved`

// 讀出已解鎖的精靈 id 清單；讀不到（無痕模式等）就當作全部未解鎖
function readUnlocked() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY))
    return Array.isArray(saved) ? saved : []
  } catch {
    return []
  }
}

// 這個 hook 放在 App 最上層只呼叫一次，再把結果傳給各頁，
// 這樣通關頁寫入後，進度頁馬上就知道（大家看的是同一份資料）
export function useUnlocked() {
  const [unlocked, setUnlocked] = useState(readUnlocked)
  // 剛剛才解鎖、還沒播過登場動畫的精靈（只存在記憶體，重新整理就不再播）
  const [justUnlocked, setJustUnlocked] = useState([])

  // 狀態一改變就寫回 LocalStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(unlocked))
    } catch {
      // 存不進去也不影響這次遊玩，只是重新整理後會忘記
    }
  }, [unlocked])

  const isUnlocked = useCallback((id) => unlocked.includes(id), [unlocked])

  // 答對某一關：記下 isQ1Solved: true，並解鎖對應的精靈
  const solve = useCallback((quiz, spriteId) => {
    try {
      localStorage.setItem(solvedKey(quiz), 'true')
    } catch {
      // 同上，存不進去就算了
    }
    setUnlocked((list) => {
      if (list.includes(spriteId)) return list
      // 第一次解鎖：排進「等待登場」名單
      setJustUnlocked((pending) => (pending.includes(spriteId) ? pending : [...pending, spriteId]))
      return [...list, spriteId]
    })
  }, [])

  // 登場動畫播完，從名單移除
  const finishReveal = useCallback((id) => {
    setJustUnlocked((pending) => pending.filter((x) => x !== id))
  }, [])

  return { isUnlocked, justUnlocked, solve, finishReveal }
}

// 這一關答對過了嗎？
export function isSolved(quiz) {
  try {
    return localStorage.getItem(solvedKey(quiz)) === 'true'
  } catch {
    return false
  }
}

// 全破結局看過了嗎？（看過就不再自動跳過去，免得每次回地圖都被帶走）
const ENDING_KEY = 'noicenocow:endingSeen'

export function hasSeenEnding() {
  try {
    return localStorage.getItem(ENDING_KEY) === 'true'
  } catch {
    return false
  }
}

export function markEndingSeen() {
  try {
    localStorage.setItem(ENDING_KEY, 'true')
  } catch {
    // 存不進去也沒關係，最多下次再看一次結局
  }
}
