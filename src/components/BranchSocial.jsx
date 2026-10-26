import { branches } from '../data/branches.js'
import { ArrowIcon } from './ui/Icons.jsx'

/**
 * Feed público de Instagram asociado a la sucursal activa.
 *
 * Instagram sirve el contenido dentro de su propio iframe. Esto permite que
 * las publicaciones visibles se actualicen desde la cuenta sin mantener una
 * copia manual en el proyecto. Si la red social bloquea el embed por cookies
 * o privacidad, el enlace al perfil queda siempre disponible.
 */
export default function BranchSocial({ branch, onChoose }) {
  const embedUrl = branch.instagramUrl
    ? `${branch.instagramUrl.replace(/\/$/, '')}/embed`
    : null

  return (
    <section className="branch-social" id="instagram" aria-labelledby="branch-social-title">
      <div className="branch-social__status" aria-live="polite">
        <span className="branch-social__status-dot" aria-hidden="true" />
        <span>Seguinos en</span>
        <strong>{branch.name}</strong>
        <small>{branch.instagramHandle ?? '@cosanostraempanadas'}</small>
      </div>

      <div className="branch-social__heading">
        <div>
          <p className="section-number">04 / DESDE CADA SUCURSAL</p>
          <p className="eyebrow">Sabores, promos y novedades</p>
          <h2 id="branch-social-title">
            Mirá lo último de <em>{branch.name}.</em>
          </h2>
        </div>

        {branch.instagramUrl && (
          <a
            className="social-profile-link"
            href={branch.instagramUrl}
            target="_blank"
            rel="noopener noreferrer"
          >
            Abrir {branch.instagramHandle ?? 'Instagram'}
            <ArrowIcon />
          </a>
        )}
      </div>

      <div className="branch-social__tabs" aria-label="Cambiar sucursal en Instagram">
        {branches.map((item) => (
          <button
            className={item.id === branch.id ? 'is-active' : ''}
            type="button"
            onClick={() => onChoose(item)}
            aria-pressed={item.id === branch.id}
            key={item.id}
          >
            <span>{item.name}</span>
            <small>{item.instagramHandle}</small>
          </button>
        ))}
      </div>

      <div className="branch-social__live">
        <div className="branch-social__context">
          <span>Instagram oficial</span>
          <strong>{branch.instagramHandle ?? '@cosanostraempanadas'}</strong>
          <p>
            Descubrí nuevos sabores, promociones y todo lo que pasa en
            <strong>{` ${branch.name}`}</strong>.
          </p>

          <span className="branch-social__sync">
            Siempre hay algo nuevo para descubrir
          </span>

          <a
            href={branch.instagramUrl}
            target="_blank"
            rel="noopener noreferrer"
          >
            Ver perfil en Instagram
            <ArrowIcon />
          </a>
        </div>

        {embedUrl ? (
          <div className="branch-social__embed">
            <iframe
              key={embedUrl}
              src={embedUrl}
              title={`Feed de Instagram de ${branch.name}`}
              allowFullScreen
            />
          </div>
        ) : (
          <div className="branch-social__empty">
            <strong>Viví Cosa Nostra en Instagram</strong>
            <p>Sabores, promociones y novedades de nuestras sucursales.</p>
          </div>
        )}
      </div>
    </section>
  )
}
