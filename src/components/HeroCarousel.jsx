import { useEffect, useState } from 'react'
import { heroProducts as slides } from '../data/productGallery.js'

export default function HeroCarousel() {
  const [active, setActive] = useState(0)

  useEffect(() => {
    const timer = window.setInterval(() => {
      setActive((current) => (current + 1) % slides.length)
    }, 5000)

    return () => window.clearInterval(timer)
  }, [])

  const move = (direction) => {
    setActive((current) => (current + direction + slides.length) % slides.length)
  }

  return (
    <div className="hero-carousel">
      <div className="hero-carousel__slides">
        {slides.map((slide, index) => (
          <figure
            className={`hero-carousel__slide ${index === active ? 'is-active' : ''}`}
            key={slide.name}
            aria-hidden={index !== active}
          >
            <img
              src={slide.image}
              alt={`Empanada Cosa Nostra de ${slide.name}`}
              width={slide.width}
              height={slide.height}
              loading={index === 0 ? 'eager' : 'lazy'}
              fetchPriority={index === 0 ? 'high' : 'low'}
              decoding="async"
            />
            <figcaption>{slide.name}</figcaption>
          </figure>
        ))}
      </div>

      <span className="image-review-badge image-review-badge--hero">
        <strong>Imagen de referencia</strong>
        Pendiente de reemplazo por material del cliente
      </span>

      <div className="hero-carousel__controls">
        <button type="button" onClick={() => move(-1)} aria-label="Imagen anterior">←</button>

        <div className="hero-carousel__dots" aria-label="Seleccionar imagen">
          {slides.map((slide, index) => (
            <button
              className={index === active ? 'is-active' : ''}
              type="button"
              key={slide.name}
              onClick={() => setActive(index)}
              aria-label={`Ver empanada de ${slide.name}`}
              aria-current={index === active ? 'true' : undefined}
            />
          ))}
        </div>

        <button type="button" onClick={() => move(1)} aria-label="Imagen siguiente">→</button>
      </div>
    </div>
  )
}
