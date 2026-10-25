import { useCallback, useEffect, useRef, useState } from 'react'

// 彈出小提示（Toast）：show('文字') 之後過 duration 毫秒自動消失
// 回傳 [目前的文字（沒有就是 null）, show]
export function useToast(duration = 1800) {
  const [message, setMessage] = useState(null)
  const timer = useRef(null)

  const show = useCallback(
    (text) => {
      setMessage(text)
      clearTimeout(timer.current)
      timer.current = setTimeout(() => setMessage(null), duration)
    },
    [duration],
  )

  // 離開畫面時把計時器清掉
  useEffect(() => () => clearTimeout(timer.current), [])

  return [message, show]
}
