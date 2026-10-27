import { useEffect, useMemo, useRef, useState } from 'react'
import { animate, createScope, stagger } from 'animejs'

import HeroCarousel from './components/HeroCarousel.jsx'
import BranchSocial from './components/BranchSocial.jsx'
import BranchMapReview from './components/BranchMapReview.jsx'
import ProductGallery from './components/ProductGallery.jsx'
import SpotlightCard from './components/SpotlightCard.jsx'
import BrandMark from './components/ui/BrandMark.jsx'
import { ArrowIcon, LocationIcon, WhatsAppIcon } from './components/ui/Icons.jsx'
import { trackEvent } from './lib/analytics.js'

import { branches } from './data/branches.js'
import { productGroups } from './data/productGroups.js'


// Pilares de la historia y del producto.
const productFacts = [
  {
    number: '01',
    title: '16 años de historia',
    detail: 'Una marca que creció junto a sus barrios y sus sucursales.',
  },
  {
    number: '02',
    title: 'Aprox. 180 g por empanada',
    detail: 'Una referencia del tamaño generoso; el peso puede variar según el sabor y cada tanda.',
  },
  {
    number: '03',
    title: 'Clásicas y gourmet',
    detail: 'Una carta amplia, con opciones para todos los antojos.',
  },
]

// Rellenos que rotan debajo del sello de los 16 años.
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
    question: '¿Qué significa “Hechas a lo grande”?',
    answer:
      'Es la forma de contar una propuesta generosa en sabor, relleno y variedad. La forma y el tamaño pueden variar según cada sabor y cada tanda.',
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
      'Las opciones de entrega y retiro se informan al ingresar al menú online. También podés consultar directamente por WhatsApp con la sucursal elegida.',
  },
]

function getWhatsAppUrl(branch, purpose = 'order') {
  if (!branch?.whatsappNumber) return '#sucursales'

  const message =
    purpose === 'reservation'
      ? 'Hola, quiero consultar por una reserva para una cena show, evento o pizza libre en Cosa Nostra B. Marítimo.'
      : `Hola, quiero hacer un pedido en Cosa Nostra ${branch.name}.`

  return `https://wa.me/${branch.whatsappNumber}?text=${encodeURIComponent(message)}`
}

function WhatsAppFloat({ branch }) {
  const [promptVisible, setPromptVisible] = useState(false)

  useEffect(() => {
    if (!branch) return undefined

    let hideTimer = null

    const showPrompt = () => {
      setPromptVisible(true)
      hideTimer = window.setTimeout(() => setPromptVisible(false), 4800)
    }

    setPromptVisible(false)
    const initialTimer = window.setTimeout(showPrompt, 2800)
    const repeatTimer = window.setInterval(showPrompt, 15000)

    return () => {
      window.clearTimeout(initialTimer)
      window.clearInterval(repeatTimer)
      if (hideTimer) window.clearTimeout(hideTimer)
    }
  }, [branch])

  if (!branch) return null

  return (
    <aside className="whatsapp-float" aria-label={`WhatsApp de ${branch.name}`}>
      <div
        className={`whatsapp-float__prompt ${promptVisible ? 'is-visible' : ''}`}
        aria-hidden={!promptVisible}
      >
        <span>Tu pedido, más fácil</span>
        <strong>Pedí por WhatsApp por acá</strong>
        <small>Te responde {branch.name}</small>
      </div>

      <a
        className="whatsapp-float__button"
        href={getWhatsAppUrl(branch)}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={`Hacer un pedido por WhatsApp en ${branch.name}`}
        onClick={() =>
          trackEvent('whatsapp_order_click', {
            branch_id: branch.id,
            branch_name: branch.name,
            placement: 'floating_button',
          })
        }
      >
        <WhatsAppIcon />
        <span>WhatsApp</span>
      </a>
    </aside>
  )
}

function MaritimoEvents({ branch }) {
  if (branch.id !== 'maritimo') return null

  return (
    <section
      className="maritimo-events"
      id="reservas-maritimo"
      aria-labelledby="maritimo-events-title"
    >
      <div className="maritimo-events__visual">
        <img
          src={branch.eventsImage || branch.image}
          alt={branch.eventsImageAlt || 'Noche especial en Cosa Nostra B. Marítimo'}
          width="1080"
          height="1080"
          loading="lazy"
          decoding="async"
        />

        <div className="maritimo-events__labels" aria-hidden="true">
          <span>Cenas show</span>
          <span>Pizza libre</span>
          <span>Eventos</span>
        </div>
      </div>

      <div className="maritimo-events__content">
        <p className="section-number">EXPERIENCIAS EN MARÍTIMO</p>
        <p className="eyebrow eyebrow--light">Eventos y reservas</p>
        <h2 id="maritimo-events-title">
          Tu próxima noche
          <br />
          <em>puede empezar acá.</em>
        </h2>
        <p>
          En B. Marítimo también podés disfrutar cenas show, eventos y fechas
          especiales de pizza libre. Consultá la agenda y reservá tu mesa
          directamente con el local.
        </p>

        <a
          className="maritimo-events__button"
          href={getWhatsAppUrl(branch, 'reservation')}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() =>
            trackEvent('whatsapp_reservation_click', {
              branch_id: branch.id,
              branch_name: branch.name,
              placement: 'maritimo_events_section',
            })
          }
        >
          <WhatsAppIcon />
          <span>
            <small>Consultá fechas y disponibilidad</small>
            <strong>Reservar por WhatsApp</strong>
          </span>
          <ArrowIcon />
        </a>
      </div>
    </section>
  )
}


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
 * Combina los 16 años de historia con imágenes reales enfocadas en el relleno.
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
          <span>Hace 16 años</span><i>✦</i>
          <span>Relleno de verdad</span><i>✦</i>
          <span>Hechas a lo grande</span><i>✦</i>
          <span>Hace 16 años</span><i>✦</i>
          <span>Relleno de verdad</span><i>✦</i>
        </div>
      </div>

      <div className="product-proof__body">
        <div className="product-proof__intro">
          <p className="section-number">01 / NUESTRA DIFERENCIA</p>
          <p className="eyebrow eyebrow--light">Una historia que sigue creciendo</p>
          <h2 id="product-proof-title">
            Hace 16 años
            <br />
            <em>hacemos esto a lo grande.</em>
          </h2>
          <p>
            Cada sabor tiene su propia forma, su relleno y su personalidad.
            “Hechas a lo grande” no habla de una medida exacta: habla de una
            manera generosa de hacer las cosas que nos acompaña desde hace 16 años.
          </p>
          <span className="content-pending">
            16 años de Cosa Nostra
          </span>
        </div>

        <div className="product-proof__feature">
          <div className="product-proof__weight" aria-label="Hace 16 años haciendo Cosa Nostra">
            <span>Hace</span>
            <strong>16</strong>
            <em>años</em>
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
        <p className="section-number">08 / ANTES DE PEDIR</p>
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
      // Instagram y Maps quedan fuera de este ocultamiento inicial porque
      // dependen de contenido externo. Así nunca aparecen como bloques vacíos
      // mientras terminan de cargar sus respectivos iframes.
      '.product-proof, .branch-showcase, .flavours, .product-gallery, .locations, .direct-order, .faq, .club-teaser',
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

    const parallaxPanels = root.querySelectorAll('.branch-showcase__visual')
    const hero = root.querySelector('.hero')
    const productProof = root.querySelector('.product-proof')
    const gallery = root.querySelector('.product-gallery')
    const directOrder = root.querySelector('.direct-order')
    const club = root.querySelector('.club-teaser')
    let frameId = null

    // Convierte la posición de una sección en un progreso de 0 a 1.
    // Usamos variables CSS para mantener los cálculos livianos y reutilizables.
    const sceneProgress = (element) => {
      if (!element) return 0
      const rect = element.getBoundingClientRect()
      const totalDistance = window.innerHeight + rect.height
      return Math.min(
        Math.max((window.innerHeight - rect.top) / totalDistance, 0),
        1,
      )
    }

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

      if (hero) {
        const heroProgress = Math.min(
          Math.max(window.scrollY / Math.max(hero.offsetHeight, 1), 0),
          1,
        )
        hero.style.setProperty('--hero-image-y', `${heroProgress * 18}px`)
        hero.style.setProperty('--hero-seal-rotate', `${heroProgress * 28}deg`)
      }

      if (productProof) {
        const centered = sceneProgress(productProof) - 0.5
        productProof.style.setProperty('--proof-badge-y', `${centered * -34}px`)
        productProof.style.setProperty('--proof-photo-y', `${centered * 42}px`)
        productProof.style.setProperty('--proof-rotate', `${centered * 5}deg`)
        productProof.style.setProperty('--proof-pattern-y', `${centered * 45}px`)
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

      if (gallery) {
        const centered = sceneProgress(gallery) - 0.5
        gallery
          .querySelectorAll('.product-gallery__card')
          .forEach((card, index) => {
            const direction = index % 2 === 0 ? 1 : -1
            card.style.setProperty(
              '--gallery-card-y',
              `${centered * 20 * direction}px`,
            )
          })
      }

      if (directOrder) {
        const centered = sceneProgress(directOrder) - 0.5
        directOrder.style.setProperty('--order-mark-x', `${centered * 62}px`)
        directOrder.style.setProperty('--order-mark-rotate', `${centered * 16}deg`)
        directOrder.style.setProperty('--order-glow-y', `${centered * -34}px`)
      }

      if (club) {
        const centered = sceneProgress(club) - 0.5
        club.style.setProperty('--club-mark-rotate', `${centered * 18}deg`)
      }
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
        ? `Hacer pedido en ${selectedBranch.name}`
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
          <a href="#nosotros" onClick={() => setMenuOpen(false)}>
            Nosotros
          </a>
          <a href="#sucursales" onClick={() => setMenuOpen(false)}>
            Sucursales
          </a>
          <a href="#resenas" onClick={() => setMenuOpen(false)}>
            Reseñas
          </a>
          <a href="#instagram" onClick={() => setMenuOpen(false)}>
            Instagram
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
            className="button button--small button--header-order"
            href={selectedBranch?.orderUrl ?? '#sucursales'}
            target={selectedBranch ? '_blank' : undefined}
            rel="noopener noreferrer"
            onClick={handleOrder}
          >
            Hacer pedido
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

        {/* NUESTRA DIFERENCIA: 16 AÑOS + RELLENOS ROTATIVOS */}
        <ProductProof />

        {/* SUCURSAL DESTACADA: CAMBIA SEGÚN LA ELECCIÓN DEL USUARIO */}
        <section className="branch-showcase" id="pedidos" aria-labelledby="branch-showcase-title">
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

            <div className="order-channels" aria-label={`Canales de pedido en ${displayedBranch.name}`}>
              <a
                className="order-channel order-channel--direct"
                href={displayedBranch.orderUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                <span>
                  <small>Compra online de la sucursal</small>
                  <strong>Ver menú y hacer pedido</strong>
                </span>
                <span className="order-channel__arrow"><ArrowIcon /></span>
              </a>

              <a
                className="order-channel order-channel--whatsapp"
                href={getWhatsAppUrl(displayedBranch)}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() =>
                  trackEvent('whatsapp_order_click', {
                    branch_id: displayedBranch.id,
                    branch_name: displayedBranch.name,
                    placement: 'branch_showcase',
                  })
                }
              >
                <span>
                  <small>Consulta directa con el local</small>
                  <strong>Pedir por WhatsApp</strong>
                  <em>{displayedBranch.whatsappDisplay}</em>
                </span>
                <span className="order-channel__arrow"><WhatsAppIcon /></span>
              </a>

            </div>

            <div className="branch-showcase__actions">
              <a
                className="text-button text-button--light"
                href="#resenas"
              >
                Ver mapa y dejar reseña
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

        {/* MAPA Y RESEÑAS: VISIBLES JUNTO A LA SUCURSAL ELEGIDA */}
        <BranchMapReview branch={displayedBranch} />

        {/* INSTAGRAM: PERFIL OFICIAL ASOCIADO A LA SUCURSAL ACTIVA */}
        <BranchSocial branch={displayedBranch} onChoose={chooseBranch} />

        {/* EVENTOS: SECCIÓN EXCLUSIVA DE LA EXPERIENCIA EN B. MARÍTIMO */}
        <MaritimoEvents branch={displayedBranch} />

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
            <p className="section-number">06 / CERCA TUYO</p>
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

        {/* CTA PRINCIPAL: LLEVA AL PEDIDO DIRECTO DE LA SUCURSAL ELEGIDA */}
        <section className="direct-order" id="pedido-directo" aria-labelledby="direct-order-title">
          <div className="direct-order__glow" aria-hidden="true" />

          <div className="direct-order__mark" aria-hidden="true">
            <img
              src="/assets/brand/cosa-nostra-monograma.png"
              alt=""
              width="2048"
              height="2048"
              loading="lazy"
              decoding="async"
            />
          </div>

          <div className="direct-order__copy">
            <p className="section-number">07 / PEDIDO DIRECTO</p>
            <p className="eyebrow eyebrow--light">Sin vueltas, directo a tu sucursal</p>
            <h2 id="direct-order-title">
              {selectedBranch ? (
                <>
                  Tu pedido sale de <em>{selectedBranch.name}.</em>
                </>
              ) : (
                <>
                  Elegí tu sucursal y <em>pedí al instante.</em>
                </>
              )}
            </h2>
            <p>
              Entrá al menú online, revisá los productos disponibles y armá tu
              pedido directamente con el local que elegiste.
            </p>
          </div>

          <div className="direct-order__action">
            <span>
              {selectedBranch
                ? `Sucursal seleccionada · ${selectedBranch.name}`
                : 'Primero elegí tu sucursal'}
            </span>
            <a
              className="direct-order__button"
              href={selectedBranch?.orderUrl ?? '#sucursales'}
              target={selectedBranch ? '_blank' : undefined}
              rel="noopener noreferrer"
              onClick={handleOrder}
            >
              <strong>{orderLabel}</strong>
              <i><ArrowIcon /></i>
            </a>
            <small>Acceso al Pedido Directo oficial de la sucursal</small>
          </div>
        </section>

        {/* PREGUNTAS FRECUENTES: CONTENIDO ÚTIL PARA USUARIOS Y BÚSQUEDAS LOCALES */}
        <FAQSection />

        {/* CLUB DE COSA NOSTRA: SE MANTIENE COMO PRÓXIMAMENTE EN LA FASE 1 */}
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
              Lanzamiento próximamente
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
          <a href="#resenas">Reseñas</a>
          <a
            href="https://www.instagram.com/cosanostraempanadas/"
            target="_blank"
            rel="noopener noreferrer"
          >
            Instagram
          </a>

          <button type="button" onClick={() => setPickerOpen(true)}>
            Sucursales
          </button>

          <a className="footer-jobs" href="/trabaja-con-nosotros">
            Trabajá con nosotros
          </a>
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

      <WhatsAppFloat branch={selectedBranch} />

    </div>
  )
}

export default App
