import { useRef } from 'react'
import './SpotlightCard.css'

// Adaptación visual del patrón Spotlight Card de React Bits.
export default function SpotlightCard({ children, className = '' }) {
  const cardRef = useRef(null)

  const handlePointerMove = (event) => {
    const card = cardRef.current
    if (!card) return
    const rect = card.getBoundingClientRect()
    card.style.setProperty('--spotlight-x', `${event.clientX - rect.left}px`)
    card.style.setProperty('--spotlight-y', `${event.clientY - rect.top}px`)
  }

  return (
    <article
      ref={cardRef}
      className={`spotlight-card ${className}`}
      onPointerMove={handlePointerMove}
    >
      {children}
    </article>
  )
}
