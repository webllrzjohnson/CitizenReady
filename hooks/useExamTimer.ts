import { useState, useEffect, useRef } from 'react'

interface UseExamTimerOptions {
  initialSeconds: number
  onExpire?: () => void
}

export function useExamTimer({ initialSeconds, onExpire }: UseExamTimerOptions) {
  const [timeRemaining, setTimeRemaining] = useState(initialSeconds)
  const onExpireRef = useRef(onExpire)

  useEffect(() => {
    onExpireRef.current = onExpire
  }, [onExpire])

  useEffect(() => {
    if (timeRemaining <= 0) {
      onExpireRef.current?.()
      return
    }

    const interval = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          clearInterval(interval)
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(interval)
  }, [timeRemaining])

  const minutes = Math.floor(timeRemaining / 60)
  const seconds = timeRemaining % 60
  const formattedTime = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
  const isExpired = timeRemaining <= 0

  return { timeRemaining, formattedTime, isExpired }
}
