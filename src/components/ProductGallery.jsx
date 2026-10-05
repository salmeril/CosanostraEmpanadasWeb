import { useRef } from 'react'

import { ArrowIcon } from './ui/Icons.jsx'
import { productGallery } from '../data/productGallery.js'

/**
 * Carrusel horizontal de sabores.
 * Funciona con botones, rueda/trackpad y gesto táctil; scroll-snap mantiene
 * cada fotografía alineada sin depender de una librería externa.
 */
export default function ProductGallery() {
  const trackRef = useRef(null)

  const move = (direction) => {
    const track = trackRef.current
    if (!track) return

    const firstCard = track.querySelector('.product-gallery__card')
    const distance = firstCard
      ? firstCard.getBoundingClientRect().width + 16
      : track.clientWidth * 0.8

    track.scrollBy({ left: distance * direction, behavior: 'smooth' })
  }

  return (
    <section className="product-gallery" id="galeria" aria-labelledby="gallery-title">
      <div className="product-gallery__heading">
        <div>
          <p className="section-number">03 / SABORES EN PRIMER PLANO</p>
          <p className="eyebrow">Una recorrida por la carta</p>
          <h2 id="gallery-title">Relleno que se ve. Sabor que se recuerda.</h2>
        </div>

        <div className="product-gallery__actions" aria-label="Controles de la galería">
          <button type="button" onClick={() => move(-1)} aria-label="Ver sabores anteriores">
            <ArrowIcon />
          </button>
          <button type="button" onClick={() => move(1)} aria-label="Ver más sabores">
            <ArrowIcon />
          </button>
        </div>
      </div>

      <p className="product-gallery__intro">
        Una selección del material disponible para mostrar el producto como protagonista.
        Los nombres y las fotos quedan listos para la validación final del cliente.
      </p>

      <div className="product-gallery__track" ref={trackRef}>
        {productGallery.map((product, index) => (
          <figure className="product-gallery__card" key={product.name}>
            <div className="product-gallery__image">
              <img
                src={product.image}
                alt={`Empanada de ${product.name}`}
                loading={index < 4 ? 'eager' : 'lazy'}
              />
              <span>Imagen de referencia · A revisar</span>
            </div>

            <figcaption>
              <small>{String(index + 1).padStart(2, '0')}</small>
              <strong>{product.name}</strong>
            </figcaption>
          </figure>
        ))}
      </div>
    </section>
  )
}
