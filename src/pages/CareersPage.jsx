import { useEffect } from 'react'

import BrandMark from '../components/ui/BrandMark.jsx'
import { ArrowIcon } from '../components/ui/Icons.jsx'
import { branches } from '../data/branches.js'

const steps = [
  {
    number: '01',
    title: 'Completá tus datos',
    detail: 'Contanos quién sos, cómo contactarte y qué tipo de puesto buscás.',
  },
  {
    number: '02',
    title: 'Elegí una sucursal',
    detail: 'Indicá el local en el que preferirías trabajar o elegí cualquiera.',
  },
  {
    number: '03',
    title: 'Adjuntá tu CV',
    detail: 'Aceptamos archivos PDF, DOC o DOCX de hasta 5 MB.',
  },
]

const workAreas = [
  'Atención al público',
  'Cocina y producción',
  'Delivery y reparto',
  'Administración',
  'Otro puesto',
]

/**
 * Página de Recursos Humanos.
 *
 * El formulario se procesa en /public/enviar-cv.php. El correo que recibirá
 * las postulaciones se cambia en una única línea, claramente comentada dentro
 * de ese archivo.
 */
export default function CareersPage() {
  const submissionStatus = new URLSearchParams(window.location.search).get('envio')

  useEffect(() => {
    const previousTitle = document.title
    const description = document.querySelector('meta[name="description"]')
    const canonical = document.querySelector('link[rel="canonical"]')
    const previousDescription = description?.getAttribute('content')
    const previousCanonical = canonical?.getAttribute('href')

    document.title = 'Trabajá con nosotros | Cosa Nostra Empanadas'
    description?.setAttribute(
      'content',
      'Enviá tu CV y postulate para trabajar en las sucursales de Cosa Nostra Empanadas.',
    )
    canonical?.setAttribute(
      'href',
      'https://cosanostraempanadas.com.ar/trabaja-con-nosotros',
    )

    return () => {
      document.title = previousTitle
      if (previousDescription) description?.setAttribute('content', previousDescription)
      if (previousCanonical) canonical?.setAttribute('href', previousCanonical)
    }
  }, [])

  return (
    <div className="careers-page">
      <header className="careers-header">
        <a className="logo-link" href="/" aria-label="Cosa Nostra, volver al inicio">
          <BrandMark compact />
        </a>

        <a className="careers-header__back" href="/">
          Volver al inicio
          <ArrowIcon />
        </a>
      </header>

      <main>
        <section className="careers-hero" aria-labelledby="careers-title">
          <div className="careers-hero__copy">
            <p className="eyebrow">Cosa Nostra · Recursos Humanos</p>
            <h1 id="careers-title">
              Trabajá con
              <br />
              <em>nosotros.</em>
            </h1>
            <p>
              Si querés ser parte de Cosa Nostra, completá el formulario y
              adjuntá tu CV. Tu postulación llegará directamente al equipo.
            </p>
            <a className="careers-status" href="#formulario">
              Postulaciones abiertas · Enviar CV
            </a>
          </div>

          <div className="careers-hero__visual">
            <img
              src="/assets/branches/quilmes.webp"
              alt="Equipo de Cosa Nostra trabajando en la sucursal de Quilmes"
              width="1600"
              height="1200"
              decoding="async"
            />
          </div>
        </section>

        <section className="careers-preparation" aria-labelledby="careers-process-title">
          <div className="careers-preparation__intro">
            <p className="section-number">SUMATE AL EQUIPO</p>
            <p className="eyebrow">Una postulación simple</p>
            <h2 id="careers-process-title">Queremos conocerte.</h2>
            <p>
              Completá la información con calma. Revisaremos tu perfil cuando
              exista una búsqueda que coincida con tu experiencia y disponibilidad.
            </p>
          </div>

          <div className="careers-steps">
            {steps.map((step) => (
              <article key={step.number}>
                <span>{step.number}</span>
                <h3>{step.title}</h3>
                <p>{step.detail}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="careers-form-section" id="formulario" aria-labelledby="careers-form-title">
          <div className="careers-form-section__intro">
            <p className="section-number">FORMULARIO DE POSTULACIÓN</p>
            <p className="eyebrow eyebrow--light">Tu lugar puede empezar acá</p>
            <h2 id="careers-form-title">Contanos un poco sobre vos.</h2>
            <p>
              Los campos marcados con * son obligatorios. Tus datos se usarán
              únicamente para evaluar oportunidades laborales en Cosa Nostra.
            </p>
          </div>

          <div className="careers-form-card">
            {submissionStatus === 'ok' && (
              <div className="form-message form-message--success" role="status">
                <strong>¡Postulación enviada!</strong>
                <span>Gracias por querer sumarte. Recibimos tus datos y tu CV.</span>
              </div>
            )}

            {submissionStatus === 'error' && (
              <div className="form-message form-message--error" role="alert">
                <strong>No pudimos enviar la postulación.</strong>
                <span>Revisá los datos y el archivo o volvé a intentarlo más tarde.</span>
              </div>
            )}

            <form
              className="careers-form"
              action="/enviar-cv.php"
              method="post"
              encType="multipart/form-data"
            >
              <div className="careers-form__honeypot" aria-hidden="true">
                <label htmlFor="website">No completar</label>
                <input id="website" name="website" type="text" tabIndex="-1" autoComplete="off" />
              </div>

              <label className="form-field form-field--wide">
                <span>Nombre y apellido *</span>
                <input name="nombre" type="text" autoComplete="name" required maxLength="100" />
              </label>

              <label className="form-field">
                <span>Correo electrónico *</span>
                <input name="email" type="email" autoComplete="email" required maxLength="120" />
              </label>

              <label className="form-field">
                <span>Teléfono *</span>
                <input name="telefono" type="tel" autoComplete="tel" required maxLength="40" />
              </label>

              <label className="form-field">
                <span>Sucursal de preferencia *</span>
                <select name="sucursal" required defaultValue="">
                  <option value="" disabled>Elegí una opción</option>
                  {branches.map((branch) => (
                    <option value={branch.name} key={branch.id}>{branch.name}</option>
                  ))}
                  <option value="Cualquiera">Cualquiera de las sucursales</option>
                </select>
              </label>

              <label className="form-field">
                <span>Área de interés *</span>
                <select name="area" required defaultValue="">
                  <option value="" disabled>Elegí una opción</option>
                  {workAreas.map((area) => <option value={area} key={area}>{area}</option>)}
                </select>
              </label>

              <label className="form-field form-field--wide">
                <span>Disponibilidad *</span>
                <select name="disponibilidad" required defaultValue="">
                  <option value="" disabled>Elegí una opción</option>
                  <option value="Full time">Full time</option>
                  <option value="Part time">Part time</option>
                  <option value="Fines de semana">Fines de semana</option>
                  <option value="A conversar">A conversar</option>
                </select>
              </label>

              <label className="form-field form-field--wide">
                <span>Contanos sobre vos</span>
                <textarea
                  name="mensaje"
                  rows="5"
                  maxLength="1500"
                  placeholder="Experiencia, estudios o por qué te gustaría sumarte..."
                />
              </label>

              <label className="form-file form-field--wide">
                <span>Adjuntá tu CV *</span>
                <input
                  name="cv"
                  type="file"
                  accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                  required
                />
                <small>PDF, DOC o DOCX · Máximo 5 MB</small>
              </label>

              <label className="form-consent form-field--wide">
                <input name="consentimiento" type="checkbox" value="acepto" required />
                <span>
                  Acepto que Cosa Nostra utilice estos datos para evaluar mi
                  postulación laboral. *
                </span>
              </label>

              <div className="careers-form__submit form-field--wide">
                <button className="button careers-submit" type="submit">
                  Enviar postulación
                  <ArrowIcon />
                </button>
                <small>Revisá tus datos y el archivo antes de enviar.</small>
              </div>
            </form>
          </div>
        </section>
      </main>

      <footer className="careers-footer">
        <BrandMark />
        <p>Empanadas argentinas. Hechas a lo grande.</p>
        <small>© {new Date().getFullYear()} Cosa Nostra Empanadas</small>
      </footer>
    </div>
  )
}
