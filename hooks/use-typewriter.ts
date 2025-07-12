import { useState, useEffect, useRef } from 'react'

interface UseTypewriterOptions {
  text: string
  speed?: number
  startDelay?: number
}

export function useTypewriter({ text, speed = 50, startDelay = 0 }: UseTypewriterOptions) {
  const [displayText, setDisplayText] = useState('')
  const [isComplete, setIsComplete] = useState(false)
  const timeoutRef = useRef<NodeJS.Timeout>()
  const indexRef = useRef(0)

  useEffect(() => {
    // Check for prefers-reduced-motion
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    
    if (prefersReducedMotion) {
      // Show full text immediately if user prefers reduced motion
      setDisplayText(text)
      setIsComplete(true)
      return
    }

    // Reset state when text changes
    setDisplayText('')
    setIsComplete(false)
    indexRef.current = 0

    // Clear any existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }

    const typeNextCharacter = () => {
      if (indexRef.current < text.length) {
        setDisplayText(text.slice(0, indexRef.current + 1))
        indexRef.current += 1
        timeoutRef.current = setTimeout(typeNextCharacter, speed)
      } else {
        setIsComplete(true)
      }
    }

    // Start typing after the initial delay
    timeoutRef.current = setTimeout(typeNextCharacter, startDelay)

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [text, speed, startDelay])

  return { displayText, isComplete }
}