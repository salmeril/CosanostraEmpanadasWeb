import { useEffect, useState } from 'react'

const slides = [
  { image: '/assets/branches/maritimo.webp', label: 'B. Marítimo' },
  { image: '/assets/branches/ranelagh.webp', label: 'Ranelagh' },
  { image: '/assets/branches/berazategui.webp', label: 'Berazategui' },
  { image: '/assets/branches/quilmes.webp', label: 'Quilmes' },
]

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
            key={slide.label}
            aria-hidden={index !== active}
          >
            <img src={slide.image} alt={`Sucursal Cosa Nostra ${slide.label}`} />
            <figcaption>{slide.label}</figcaption>
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
              key={slide.label}
              onClick={() => setActive(index)}
              aria-label={`Ver imagen de ${slide.label}`}
              aria-current={index === active ? 'true' : undefined}
            />
          ))}
        </div>

        <button type="button" onClick={() => move(1)} aria-label="Imagen siguiente">→</button>
      </div>
    </div>
  )
}
