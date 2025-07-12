import { useTypewriter } from '@/hooks/use-typewriter'
import { ReactNode } from 'react'

interface TypewriterProps {
  text: string
  speed?: number
  startDelay?: number
  className?: string
  children?: ReactNode
  cssSpeedVariable?: string
}

export function Typewriter({ 
  text, 
  speed = 50, 
  startDelay = 0, 
  className = '', 
  children,
  cssSpeedVariable
}: TypewriterProps) {
  // Get speed from CSS variable if provided
  const getEffectiveSpeed = () => {
    if (cssSpeedVariable && typeof window !== 'undefined') {
      const cssSpeed = parseInt(getComputedStyle(document.documentElement).getPropertyValue(cssSpeedVariable).trim())
      return isNaN(cssSpeed) ? speed : cssSpeed
    }
    return speed
  }

  const { displayText } = useTypewriter({ 
    text, 
    speed: getEffectiveSpeed(), 
    startDelay 
  })

  return (
    <span className={className}>
      {displayText}
      {children}
    </span>
  )
}