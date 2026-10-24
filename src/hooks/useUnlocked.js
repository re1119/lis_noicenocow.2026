import { useCallback, useEffect, useState } from 'react'

// LocalStorage 就像瀏覽器裡的「借閱紀錄卡」：
// 關掉分頁、重新整理都還在，直到使用者清除瀏覽資料
const STORAGE_KEY = 'noicenocow:unlocked'

// 讀出已解鎖的精靈 id 清單；讀不到（無痕模式等）就當作全部未解鎖
function readUnlocked() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY))
    return Array.isArray(saved) ? saved : []
  } catch {
    return []
  }
}

export function useUnlocked() {
  const [unlocked, setUnlocked] = useState(readUnlocked)

  // 狀態一改變就寫回 LocalStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(unlocked))
    } catch {
      // 存不進去也不影響這次遊玩，只是重新整理後會忘記
    }
  }, [unlocked])

  const unlock = useCallback((id) => {
    setUnlocked((list) => (list.includes(id) ? list : [...list, id]))
  }, [])

  const isUnlocked = useCallback((id) => unlocked.includes(id), [unlocked])

  return { isUnlocked, unlock }
}
