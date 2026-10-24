import { useCallback, useEffect, useState } from 'react'

// 網址 # 後面的部分當作「現在在哪一頁」，例如 .../#/q1/question → '/q1/question'
// 用 # 號是因為 GitHub Pages 只認得真的存在的檔案，# 後面怎麼變都不會 404
function readPath() {
  return window.location.hash.replace(/^#/, '') || '/'
}

export function useHashPath() {
  const [path, setPath] = useState(readPath)

  // 網址一變（包含按瀏覽器的返回鍵）就更新
  useEffect(() => {
    const onChange = () => setPath(readPath())
    window.addEventListener('hashchange', onChange)
    return () => window.removeEventListener('hashchange', onChange)
  }, [])

  // 換頁；replace: true 代表「取代」目前這筆瀏覽紀錄，按返回鍵不會回到這裡
  const navigate = useCallback((to, { replace = false } = {}) => {
    if (replace) window.location.replace(`#${to}`)
    else window.location.hash = to
  }, [])

  return [path, navigate]
}
