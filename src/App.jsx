import { useEffect, useMemo, useRef, useState } from 'react'
import { animate, createScope, stagger } from 'animejs'

import HeroCarousel from './components/HeroCarousel.jsx'
import ProductGallery from './components/ProductGallery.jsx'
import SpotlightCard from './components/SpotlightCard.jsx'
import BrandMark from './components/ui/BrandMark.jsx'
import { ArrowIcon, LocationIcon } from './components/ui/Icons.jsx'
import { trackEvent } from './lib/analytics.js'

import { branches } from './data/branches.js'
import { productGroups } from './data/productGroups.js'


// Características principales de producto.
// El peso queda señalado como aproximado hasta la confirmación del cliente.
const productFacts = [
  {
    number: '01',
    title: 'Peso real',
    detail: 'Una empanada que se siente desde que llega a la mesa.',
  },
  {
    number: '02',
    title: 'Relleno generoso',
    detail: 'Sabores reconocibles y abundantes en cada bocado.',
  },
  {
    number: '03',
    title: 'Clásicas y gourmet',
    detail: 'Una carta amplia, con opciones para todos los antojos.',
  },
]

// Rellenos que rotan debajo del sello de 180 gramos.
// Todas las imágenes se mantienen identificadas como material de referencia.
const productProofSlides = [
  {
    name: 'Jamón y queso',
    image: '/assets/products/jamon-y-queso.webp',
    position: '42% 63%',
    width: 1076,
    height: 1440,
  },
  {
    name: 'Carne dulce',
    image: '/assets/products/carne-dulce.webp',
    position: '50% 58%',
    width: 928,
    height: 1152,
  },
  {
    name: 'Pollo al champiñón',
    image: '/assets/products/pollo-al-champinon.webp',
    position: '50% 58%',
    width: 1114,
    height: 1383,
  },
  {
    name: 'Panceta y ciruela',
    image: '/assets/products/panceta-y-ciruela.webp',
    position: '50% 58%',
    width: 928,
    height: 1152,
  },
]

const faqItems = [
  {
    question: '¿Dónde puedo pedir Cosa Nostra?',
    answer:
      'Elegí B. Marítimo en Hudson, Ranelagh, Berazategui o Quilmes. La página te lleva al menú online de la sucursal seleccionada.',
  },
  {
    question: '¿Cuánto pesa cada empanada?',
    answer:
      'Cada empanada ronda los 180 gramos. El peso es aproximado y puede variar levemente según el sabor y el relleno.',
  },
  {
    question: '¿Dónde veo el menú y los precios?',
    answer:
      'Los precios, promociones y productos disponibles se consultan en la tienda online de cada sucursal.',
  },
  {
    question: '¿Hay opciones clásicas y gourmet?',
    answer:
      'Sí. La carta combina sabores clásicos con rellenos gourmet. La disponibilidad puede cambiar según la sucursal.',
  },
  {
    question: '¿Puedo pedir delivery o retirar?',
    answer:
      'Las opciones de entrega y retiro se informan al ingresar al menú online de la sucursal elegida.',
  },
]


/**
 * Selector inicial de sucursal.
 * Se muestra al ingresar por primera vez y también puede abrirse desde el header.
 */
function BranchPicker({ open, onClose, onChoose, selectedId }) {
  const pickerRef = useRef(null)

  // Bloquea el scroll del fondo y permite cerrar con Escape.
  useEffect(() => {
    if (!open) return undefined

    const handleKeyDown = (event) => {
      if (event.key === 'Escape' && selectedId) onClose()
    }

    document.body.classList.add('modal-open')
    window.addEventListener('keydown', handleKeyDown)

    return () => {
      document.body.classList.remove('modal-open')
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [open, onClose, selectedId])

  // Animación de entrada del selector.
  useEffect(() => {
    if (!open || !pickerRef.current) return undefined

    const scope = createScope({
      root: pickerRef.current,
      mediaQueries: {
        reduceMotion: '(prefers-reduced-motion: reduce)',
      },
    }).add((self) => {
      if (self.matches.reduceMotion) return

      animate(
        '.branch-modal__topline, .branch-modal__content > .eyebrow, .branch-modal__content > h2, .branch-modal__intro',
        {
          opacity: [0, 1],
          y: [18, 0],
          delay: stagger(75),
          duration: 650,
          ease: 'out(4)',
        },
      )

      animate('.branch-option', {
        opacity: [0, 1],
        y: [24, 0],
        delay: stagger(65, { start: 260 }),
        duration: 650,
        ease: 'out(4)',
      })
    })

    return () => scope.revert()
  }, [open])

  if (!open) return null

  return (
    <div
      ref={pickerRef}
      className="branch-modal"
      role="dialog"
      aria-modal="true"
      aria-labelledby="branch-title"
    >
      <div className="branch-modal__pattern" aria-hidden="true" />

      <div className="branch-modal__topline">
        <BrandMark />

        {selectedId && (
          <button
            className="icon-button"
            type="button"
            onClick={onClose}
            aria-label="Cerrar selector"
          >
            ×
          </button>
        )}
      </div>

      <div className="branch-modal__content">
        <p className="eyebrow eyebrow--light">Tu pedido empieza acá</p>
        <h2 id="branch-title">¿Cuál te queda más cerca?</h2>
        <p className="branch-modal__intro">
          Elegí tu sucursal y te llevamos directo a su tienda online.
        </p>

        <div className="branch-options">
          {branches.map((branch, index) => (
            <button
              className={`branch-option ${
                selectedId === branch.id ? 'is-selected' : ''
              }`}
              type="button"
              key={branch.id}
              onClick={() => onChoose(branch)}
            >
              <img
                className="branch-option__image"
                src={branch.image}
                alt=""
                width="1600"
                height="1200"
                decoding="async"
              />

              <span className="branch-option__badge">
                Imagen de referencia · Pendiente de reemplazo
              </span>

              <span className="branch-option__index">
                0{index + 1}
              </span>

              <span className="branch-option__copy">
                <strong>{branch.name}</strong>
                <small>{branch.area}</small>
              </span>

              <span className="branch-option__arrow">
                <ArrowIcon />
              </span>
            </button>
          ))}
        </div>
      </div>

      <p className="branch-modal__foot">
        Empanadas argentinas · Hechas a lo grande
      </p>
    </div>
  )
}


/**
 * Sección editorial de producto.
 * Combina el dato de 180 gramos con una imagen real enfocada en el relleno.
 */
function ProductProof() {
  const [activeProduct, setActiveProduct] = useState(0)

  // Cambia el relleno automáticamente sin sumar controles invasivos.
  useEffect(() => {
    const timer = window.setInterval(() => {
      setActiveProduct((current) => (current + 1) % productProofSlides.length)
    }, 3200)

    return () => window.clearInterval(timer)
  }, [])

  const activeSlide = productProofSlides[activeProduct]

  return (
    <section
      className="product-proof"
      id="nosotros"
      aria-labelledby="product-proof-title"
    >
      <div className="product-proof__marquee" aria-hidden="true">
        <div className="product-proof__marquee-track">
          <span>Hechas a lo grande</span><i>✦</i>
          <span>180 gramos aprox.</span><i>✦</i>
          <span>Relleno de verdad</span><i>✦</i>
          <span>Hechas a lo grande</span><i>✦</i>
          <span>180 gramos aprox.</span><i>✦</i>
          <span>Relleno de verdad</span><i>✦</i>
        </div>
      </div>

      <div className="product-proof__body">
        <div className="product-proof__intro">
          <p className="section-number">01 / NUESTRA DIFERENCIA</p>
          <p className="eyebrow eyebrow--light">No hacemos una más</p>
          <h2 id="product-proof-title">
            El tamaño se ve.
            <br />
            <em>El sabor se queda.</em>
          </h2>
          <p>
            Cada empanada ronda los 180 gramos. Por eso “Hechas a lo grande”
            no es solamente una frase: es la forma más directa de contar lo
            que llega en cada pedido.
          </p>
          <span className="content-pending">
            Peso aproximado · A confirmar con el cliente
          </span>
        </div>

        <div className="product-proof__feature">
          <div className="product-proof__weight" aria-label="Peso aproximado: 180 gramos">
            <span>Aproximadamente</span>
            <strong>180</strong>
            <em>gramos</em>
          </div>

          <figure className="product-proof__product">
            <div className="product-proof__slides">
              {productProofSlides.map((slide, index) => (
                <img
                  className={index === activeProduct ? 'is-active' : ''}
                  src={slide.image}
                  alt={index === activeProduct ? `Empanada de ${slide.name} abierta` : ''}
                  aria-hidden={index !== activeProduct}
                  style={{ objectPosition: slide.position }}
                  width={slide.width}
                  height={slide.height}
                  loading="lazy"
                  decoding="async"
                  key={slide.name}
                />
              ))}
            </div>

            <span className="image-review-badge product-proof__image-badge">
              <strong>Imagen de referencia</strong>
              A reemplazar por material del cliente
            </span>

            <figcaption key={activeSlide.name} aria-live="polite">
              <strong>Relleno de verdad</strong>
              <span>{activeSlide.name}</span>
            </figcaption>

            <div className="product-proof__dots" aria-label="Elegir relleno destacado">
              {productProofSlides.map((slide, index) => (
                <button
                  className={index === activeProduct ? 'is-active' : ''}
                  type="button"
                  onClick={() => setActiveProduct(index)}
                  aria-label={`Ver relleno de ${slide.name}`}
                  aria-current={index === activeProduct ? 'true' : undefined}
                  key={slide.name}
                />
              ))}
            </div>
          </figure>
        </div>

        <div className="product-proof__facts">
          {productFacts.map((fact) => (
            <article key={fact.number}>
              <span>{fact.number}</span>
              <div>
                <h3>{fact.title}</h3>
                <p>{fact.detail}</p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}


function FAQSection() {
  return (
    <section className="faq" id="preguntas" aria-labelledby="faq-title">
      <div className="faq__intro">
        <p className="section-number">05 / ANTES DE PEDIR</p>
        <p className="eyebrow">Preguntas frecuentes</p>
        <h2 id="faq-title">Todo claro antes del primer bocado.</h2>
        <p>
          Encontrá rápido la sucursal, el menú y la información principal para
          pedir empanadas Cosa Nostra en zona sur.
        </p>
      </div>

      <div className="faq__list">
        {faqItems.map((item, index) => (
          <details key={item.question} open={index === 0}>
            <summary>
              <span>{item.question}</span>
              <i aria-hidden="true">+</i>
            </summary>
            <p>{item.answer}</p>
          </details>
        ))}
      </div>
    </section>
  )
}


function App() {
  const appRef = useRef(null)
  const scrollProgressRef = useRef(null)

  // Recupera la última sucursal elegida por el usuario.
  const storedId =
    typeof window !== 'undefined'
      ? window.localStorage.getItem('cosa-nostra-branch')
      : null

  const initialBranch =
    branches.find((branch) => branch.id === storedId) ?? null

  const [selectedBranch, setSelectedBranch] = useState(initialBranch)
  const [pickerOpen, setPickerOpen] = useState(!initialBranch)
  const [menuOpen, setMenuOpen] = useState(false)

  // Animaciones generales de entrada.
  useEffect(() => {
    if (!appRef.current) return undefined

    const scope = createScope({
      root: appRef.current,
      mediaQueries: {
        reduceMotion: '(prefers-reduced-motion: reduce)',
      },
    }).add((self) => {
      if (self.matches.reduceMotion) return

      animate('.hero__copy > *', {
        opacity: [0, 1],
        y: [26, 0],
        delay: stagger(90, { start: 140 }),
        duration: 850,
        ease: 'out(4)',
      })

      animate('.hero-carousel', {
        opacity: [0, 1],
        scale: [1.04, 1],
        duration: 1250,
        ease: 'out(3)',
      })

      animate('.site-header', {
        opacity: [0, 1],
        y: [-14, 0],
        duration: 700,
        ease: 'out(4)',
      })
    })

    return () => scope.revert()
  }, [])

  // Revela cada sección cuando entra en pantalla y mueve suavemente las
  // fotografías grandes para dar profundidad durante el desplazamiento.
  useEffect(() => {
    const root = appRef.current
    if (!root) return undefined

    const reducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)',
    ).matches
    const sections = root.querySelectorAll(
      '.product-proof, .branch-showcase, .flavours, .product-gallery, .locations, .faq, .club-teaser',
    )

    sections.forEach((section) => section.classList.add('scroll-reveal'))

    const narrowViewport = window.matchMedia('(max-width: 760px)').matches

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return
          entry.target.classList.add('is-visible')
          observer.unobserve(entry.target)
        })
      },
      {
        // En pantallas chicas las secciones son mucho más altas. Un umbral
        // menor evita que queden bloques vacíos al desplazarse rápidamente.
        threshold: narrowViewport ? 0.02 : 0.12,
        rootMargin: narrowViewport ? '0px 0px -2% 0px' : '0px 0px -8% 0px',
      },
    )

    sections.forEach((section) => observer.observe(section))

    if (reducedMotion) {
      sections.forEach((section) => section.classList.add('is-visible'))
      return () => observer.disconnect()
    }

    const parallaxPanels = root.querySelectorAll(
      '.branch-showcase__visual',
    )
    let frameId = null

    const updateScrollEffects = () => {
      frameId = null
      const documentHeight =
        document.documentElement.scrollHeight - window.innerHeight
      const progress = documentHeight > 0 ? window.scrollY / documentHeight : 0

      if (scrollProgressRef.current) {
        scrollProgressRef.current.style.transform = `scaleX(${Math.min(
          Math.max(progress, 0),
          1,
        )})`
      }

      parallaxPanels.forEach((panel) => {
        const rect = panel.getBoundingClientRect()
        const distanceFromCenter =
          rect.top + rect.height / 2 - window.innerHeight / 2
        const movement = Math.max(
          -24,
          Math.min(24, distanceFromCenter * -0.035),
        )
        panel.style.setProperty('--parallax-y', `${movement}px`)
      })
    }

    const requestScrollUpdate = () => {
      if (frameId !== null) return
      frameId = window.requestAnimationFrame(updateScrollEffects)
    }

    updateScrollEffects()
    window.addEventListener('scroll', requestScrollUpdate, { passive: true })
    window.addEventListener('resize', requestScrollUpdate)

    return () => {
      observer.disconnect()
      window.removeEventListener('scroll', requestScrollUpdate)
      window.removeEventListener('resize', requestScrollUpdate)
      if (frameId !== null) window.cancelAnimationFrame(frameId)
    }
  }, [])

  const orderLabel = useMemo(
    () =>
      selectedBranch
        ? `Pedir en ${selectedBranch.name}`
        : 'Elegir sucursal',
    [selectedBranch],
  )

  // La sucursal visible acompaña la selección inicial del usuario.
  // Mientras el selector está abierto usamos la primera como vista de respaldo.
  const displayedBranch = selectedBranch ?? branches[0]

  // Guarda la sucursal para las próximas visitas.
  const chooseBranch = (branch) => {
    window.localStorage.setItem('cosa-nostra-branch', branch.id)
    trackEvent('branch_selected', {
      branch_id: branch.id,
      branch_name: branch.name,
    })
    setSelectedBranch(branch)
    setPickerOpen(false)
  }

  // Si todavía no hay sucursal, abre el selector en lugar de navegar.
  const handleOrder = (event) => {
    if (!selectedBranch) {
      event.preventDefault()
      setPickerOpen(true)
      return
    }

    trackEvent('order_click', {
      branch_id: selectedBranch.id,
      branch_name: selectedBranch.name,
    })
  }

  return (
    <div ref={appRef} className="app-shell">
      <BranchPicker
        open={pickerOpen}
        onClose={() => setPickerOpen(false)}
        onChoose={chooseBranch}
        selectedId={selectedBranch?.id}
      />

      {/* HEADER */}
      <header className="site-header">
        <a className="logo-link" href="#inicio" aria-label="Cosa Nostra, inicio">
          <BrandMark compact />
        </a>

        <nav
          className={menuOpen ? 'is-open' : ''}
          aria-label="Navegación principal"
        >
          <a href="#sabores" onClick={() => setMenuOpen(false)}>
            Sabores
          </a>
          <a href="#galeria" onClick={() => setMenuOpen(false)}>
            Galería
          </a>
          <a href="#nosotros" onClick={() => setMenuOpen(false)}>
            Nosotros
          </a>
          <a href="#sucursales" onClick={() => setMenuOpen(false)}>
            Sucursales
          </a>
          <a href="#club" onClick={() => setMenuOpen(false)}>
            Club
          </a>
        </nav>

        <div className="header-actions">
          <button
            className="branch-change"
            type="button"
            onClick={() => setPickerOpen(true)}
          >
            <LocationIcon />
            <span>{selectedBranch?.name ?? 'Elegí sucursal'}</span>
          </button>

          <a
            className="button button--small"
            href={selectedBranch?.orderUrl ?? '#sucursales'}
            target={selectedBranch ? '_blank' : undefined}
            rel="noopener noreferrer"
            onClick={handleOrder}
          >
            Pedir ahora
          </a>

          <button
            className="menu-toggle"
            type="button"
            aria-label="Abrir menú"
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((value) => !value)}
          >
            <span />
            <span />
          </button>
        </div>
      </header>

      <div
        ref={scrollProgressRef}
        className="scroll-progress"
        aria-hidden="true"
      />

      <main>
        {/* HERO PRINCIPAL */}
        <section className="hero" id="inicio">
          <div className="hero__copy">
            <p className="eyebrow">Hudson · Ranelagh · Berazategui · Quilmes</p>

            {selectedBranch && (
              <button
                className="hero__branch-pill"
                type="button"
                onClick={() => setPickerOpen(true)}
                aria-label={`Sucursal elegida: ${selectedBranch.name}. Cambiar sucursal`}
              >
                <LocationIcon />
                <span>
                  Estás comprando en <strong>{selectedBranch.name}</strong>
                </span>
                <small>Cambiar</small>
              </button>
            )}

            <h1>
              <span className="hero__seo-line">Cosa Nostra · Empanadas argentinas</span>
              Sabor genuino.
              <br />
              <em>Hechas a lo grande.</em>
            </h1>

            <p className="hero__lead">
              Recetas bien nuestras, masa crocante y relleno de verdad.
              Elegí tu sucursal y pedí sin vueltas.
            </p>

            <div className="hero__actions">
              <a
                className="button button--primary"
                href={selectedBranch?.orderUrl ?? '#sucursales'}
                target={selectedBranch ? '_blank' : undefined}
                rel="noopener noreferrer"
                onClick={handleOrder}
              >
                {orderLabel}
                <ArrowIcon />
              </a>

              <button
                className="text-button"
                type="button"
                onClick={() => setPickerOpen(true)}
              >
                Cambiar sucursal
              </button>
            </div>
          </div>

          <div className="hero__visual" aria-label="Imágenes de Cosa Nostra">
            <HeroCarousel />

            <div className="hero__seal" aria-hidden="true">
              <img
                src="/assets/brand/cosa-nostra-sello.png"
                alt=""
                width="2048"
                height="2048"
                decoding="async"
              />
            </div>
          </div>

        </section>

        {/* NUESTRA DIFERENCIA: SELLO DE PESO + FOTO REAL DE PRODUCTO */}
        <ProductProof />

        {/* SUCURSAL DESTACADA: CAMBIA SEGÚN LA ELECCIÓN DEL USUARIO */}
        <section className="branch-showcase" aria-labelledby="branch-showcase-title">
          <div className="branch-showcase__visual">
            <img
              key={displayedBranch.id}
              src={displayedBranch.image}
              alt={`Local Cosa Nostra ${displayedBranch.name}`}
              width="1600"
              height="1200"
              loading="lazy"
              decoding="async"
            />

            <span className="image-review-badge">
              <strong>Imagen de referencia</strong>
              A validar con cada sucursal
            </span>

            <span className="branch-showcase__index" aria-hidden="true">
              {String(branches.findIndex((branch) => branch.id === displayedBranch.id) + 1).padStart(2, '0')}
            </span>
          </div>

          <div className="branch-showcase__content">
            <p className="section-number">02 / TU COSA NOSTRA</p>
            <p className="eyebrow eyebrow--light">Sucursal elegida</p>
            <h2 id="branch-showcase-title">{displayedBranch.name}</h2>

            <p className="branch-showcase__address">
              <LocationIcon />
              <span>{displayedBranch.area}</span>
            </p>

            <p className="branch-showcase__copy">
              Tu pedido sale desde acá. Consultá el menú disponible, la zona de
              entrega y las opciones de retiro de esta sucursal.
            </p>

            <div className="branch-showcase__actions">
              <a
                className="button button--branch"
                href={displayedBranch.orderUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                Pedir en {displayedBranch.name}
                <ArrowIcon />
              </a>

              <a
                className="text-button text-button--light"
                href={displayedBranch.mapUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                Cómo llegar
              </a>

              <button
                className="text-button text-button--light"
                type="button"
                onClick={() => setPickerOpen(true)}
              >
                Cambiar sucursal
              </button>
            </div>

            <div className="branch-showcase__selector" aria-label="Cambiar sucursal destacada">
              {branches.map((branch) => (
                <button
                  className={displayedBranch.id === branch.id ? 'is-active' : ''}
                  type="button"
                  key={branch.id}
                  onClick={() => chooseBranch(branch)}
                >
                  <span>{branch.name}</span>
                  <small>{branch.area}</small>
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* CATEGORÍAS DEL MENÚ */}
        <section className="flavours" id="sabores">
          <div className="section-heading">
            <div>
              <p className="eyebrow eyebrow--light">
                Para todos los antojos
              </p>
              <h2>Encontrá tu próxima favorita.</h2>
            </div>

            <a
              className="text-link text-link--light"
              href={selectedBranch?.orderUrl ?? '#sucursales'}
              target={selectedBranch ? '_blank' : undefined}
              rel="noopener noreferrer"
              onClick={handleOrder}
            >
              Ver menú completo
              <ArrowIcon />
            </a>
          </div>

          <div className="product-grid">
            {productGroups.map((group) => (
              <SpotlightCard
                className="product-card"
                key={group.number}
              >
                <img
                  className="product-card__background"
                  src={group.image}
                  alt=""
                  aria-hidden="true"
                  style={{ objectPosition: group.position }}
                  loading="lazy"
                  decoding="async"
                />
                <span className="product-card__overlay" aria-hidden="true" />

                <span className="product-card__number">{group.number}</span>
                <span className="product-card__badge">
                  Imagen de referencia
                </span>
                <h3>{group.title}</h3>
                <p>{group.detail}</p>

                <a
                  href={selectedBranch?.orderUrl ?? '#sucursales'}
                  target={selectedBranch ? '_blank' : undefined}
                  rel="noopener noreferrer"
                  onClick={handleOrder}
                  aria-label={`Ver ${group.title} en el menú`}
                >
                  <ArrowIcon />
                </a>
              </SpotlightCard>
            ))}
          </div>
        </section>

        {/* GALERÍA ESCALABLE DE PRODUCTOS: LAS FOTOS Y LOS NOMBRES VIVEN EN DATA */}
        <ProductGallery />

        {/* SUCURSALES */}
        <section className="locations" id="sucursales">
          <div className="locations__intro">
            <p className="section-number">04 / CERCA TUYO</p>
            <p className="eyebrow">Cuatro sucursales</p>
            <h2>Siempre hay un Cosa Nostra cerca.</h2>
            <p>
              Seleccioná el local desde donde querés pedir. Te llevamos a su
              menú y zona de entrega.
            </p>
          </div>

          <div className="location-list">
            {branches.map((branch, index) => (
              <article
                className={
                  selectedBranch?.id === branch.id ? 'is-active' : ''
                }
                key={branch.id}
              >
                <button
                  type="button"
                  onClick={() => chooseBranch(branch)}
                >
                  <span className="location-list__photo">
                    <img
                      src={branch.image}
                      alt=""
                      width="1600"
                      height="1200"
                      loading="lazy"
                      decoding="async"
                    />
                    <small>Imagen de referencia</small>
                  </span>

                  <span className="location-list__number">
                    0{index + 1}
                  </span>

                  <span className="location-list__name">
                    <strong>{branch.name}</strong>
                    <small>{branch.area}</small>
                  </span>

                  <span className="location-list__status">
                    {selectedBranch?.id === branch.id
                      ? 'Tu sucursal'
                      : 'Elegir'}
                  </span>

                  <span className="location-list__arrow">
                    <ArrowIcon />
                  </span>
                </button>
              </article>
            ))}
          </div>
        </section>

        {/* PREGUNTAS FRECUENTES: CONTENIDO ÚTIL PARA USUARIOS Y BÚSQUEDAS LOCALES */}
        <FAQSection />

        {/* CLUB DE COSA NOSTRA */}
        <section className="club-teaser" id="club">
          <div className="club-teaser__mark" aria-hidden="true">
            <img
              src="/assets/brand/cosa-nostra-monograma.png"
              alt=""
              width="2048"
              height="2048"
              loading="lazy"
              decoding="async"
            />
          </div>

          <div>
            <p className="eyebrow">Club de Cosa Nostra</p>
            <h2>Bienvenidos a la familia.</h2>
            <span className="content-pending">
              Beneficios e inscripción a confirmar con el cliente
            </span>
          </div>

          <div className="club-teaser__content">
            <p>
              Beneficios, novedades y recompensas reservadas para quienes
              siempre vuelven.
            </p>
            <button className="button button--club" type="button" disabled>
              Inscripción próximamente
            </button>
          </div>
        </section>
      </main>

      {/* FOOTER */}
      <footer>
        <a className="logo-link" href="#inicio" aria-label="Volver al inicio">
          <BrandMark />
        </a>

        <p>Empanadas argentinas. Hechas a lo grande.</p>

        <div className="footer-links">
          <a href="#sabores">Sabores</a>
          <a href="#nosotros">Nosotros</a>
          <a
            href="https://www.instagram.com/cosanostra.empanadas/"
            target="_blank"
            rel="noopener noreferrer"
          >
            Instagram
          </a>

          <button type="button" onClick={() => setPickerOpen(true)}>
            Sucursales
          </button>

          <span className="footer-jobs" title="Canal de recepción a confirmar">
            Trabajá con nosotros · Próximamente
          </span>
        </div>

        <small className="footer-meta">
          <span>© {new Date().getFullYear()} Cosa Nostra Empanadas</span>

          <a
            className="footer-credit"
            href="https://otbcreativestudio.com/"
            target="_blank"
            rel="noopener noreferrer"
            onClick={() =>
              trackEvent('studio_credit_click', {
                destination: 'otb_creative_studio',
              })
            }
          >
            Diseño y desarrollo por <strong>OTB Creative Studio</strong>
          </a>
        </small>
      </footer>

      {/* BOTÓN FIJO EN CELULARES */}
      <a
        className="mobile-order"
        href={selectedBranch?.orderUrl ?? '#sucursales'}
        target={selectedBranch ? '_blank' : undefined}
        rel="noopener noreferrer"
        onClick={handleOrder}
      >
        <span>{orderLabel}</span>
        <ArrowIcon />
      </a>
    </div>
  )
}

export default App
