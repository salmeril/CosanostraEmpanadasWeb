import { ArrowIcon, LocationIcon } from './ui/Icons.jsx'
import { trackEvent } from '../lib/analytics.js'

/**
 * Mapa y reputación local de la sucursal activa.
 * El iframe usa la búsqueda pública de Google Maps y no necesita una API key.
 */
export default function BranchMapReview({ branch }) {
  const mapQuery = encodeURIComponent(
    `Cosa Nostra ${branch.streetAddress}, ${branch.city}, Buenos Aires, Argentina`,
  )
  const mapEmbedUrl = `https://www.google.com/maps?q=${mapQuery}&output=embed`

  const handleReviewClick = () => {
    trackEvent('google_review_click', {
      branch_id: branch.id,
      branch_name: branch.name,
    })
  }

  return (
    <section className="map-review" id="resenas" aria-labelledby="map-review-title">
      <div className="map-review__status">
        <LocationIcon />
        <span>Ubicación y reseñas de</span>
        <strong>{branch.name}</strong>
      </div>

      <div className="map-review__map">
        <iframe
          key={branch.id}
          src={mapEmbedUrl}
          title={`Mapa de Cosa Nostra ${branch.name}`}
          referrerPolicy="no-referrer-when-downgrade"
          allowFullScreen
        />
        <span className="map-review__badge">
          <LocationIcon />
          Mapa de {branch.name}
        </span>
      </div>

      <div className="map-review__content">
        <p className="section-number">03 / MAPA Y RESEÑAS</p>
        <p className="eyebrow eyebrow--light">Todo en un mismo lugar</p>
        <h2 id="map-review-title">
          Encontrá el local. <em>Dejanos tu reseña.</em>
        </h2>
        <p>
          Tu reseña ayuda a que más personas encuentren la sucursal de
          {` ${branch.name}`} y conozcan nuestros sabores.
        </p>

        <div className="map-review__branch">
          <small>Sucursal seleccionada</small>
          <strong>{branch.name}</strong>
          <span>{branch.area}</span>
        </div>

        <div className="map-review__actions">
          <a
            className="button button--review"
            href={branch.mapUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={handleReviewClick}
          >
            Escribir reseña en Google
            <ArrowIcon />
          </a>

          <a
            className="text-button text-button--light"
            href={branch.mapUrl}
            target="_blank"
            rel="noopener noreferrer"
          >
            Abrir mapa completo
          </a>
        </div>
      </div>
    </section>
  )
}
