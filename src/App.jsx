import { useEffect, useMemo, useRef, useState } from 'react'
import { animate, createScope, stagger } from 'animejs'
import SpotlightCard from './components/SpotlightCard.jsx'
import BrandMark from './components/ui/BrandMark.jsx'
import { ArrowIcon, LocationIcon } from './components/ui/Icons.jsx'
import { branches } from './data/branches.js'
import { productGroups } from './data/productGroups.js'


function BranchPicker({ open, onClose, onChoose, selectedId }) {
  const pickerRef = useRef(null)

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

  useEffect(() => {
    if (!open || !pickerRef.current) return undefined

    const scope = createScope({
      root: pickerRef.current,
      mediaQueries: { reduceMotion: '(prefers-reduced-motion: reduce)' },
    }).add((self) => {
      if (self.matches.reduceMotion) return
      animate('.branch-modal__topline, .branch-modal__content > .eyebrow, .branch-modal__content > h2, .branch-modal__intro', {
        opacity: [0, 1],
        y: [18, 0],
        delay: stagger(75),
        duration: 650,
        ease: 'out(4)',
      })
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
    <div ref={pickerRef} className="branch-modal" role="dialog" aria-modal="true" aria-labelledby="branch-title">
      <div className="branch-modal__pattern" aria-hidden="true" />
      <div className="branch-modal__topline">
        <BrandMark />
        {selectedId && (
          <button className="icon-button" type="button" onClick={onClose} aria-label="Cerrar selector">
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
          {branches.map((branch) => (
            <button
              className={`branch-option ${selectedId === branch.id ? 'is-selected' : ''}`}
              type="button"
              key={branch.id}
              onClick={() => onChoose(branch)}
            >
              <span className="branch-option__index">0{branches.indexOf(branch) + 1}</span>
              <span>
                <strong>{branch.name}</strong>
                <small>{branch.area}</small>
              </span>
              <span className="branch-option__arrow"><ArrowIcon /></span>
            </button>
          ))}
        </div>
      </div>

      <p className="branch-modal__foot">Empanadas argentinas · Hechas a lo grande</p>
    </div>
  )
}

function App() {
  const appRef = useRef(null)
  const storedId = typeof window !== 'undefined' ? window.localStorage.getItem('cosa-nostra-branch') : null
  const initialBranch = branches.find((branch) => branch.id === storedId) ?? null
  const [selectedBranch, setSelectedBranch] = useState(initialBranch)
  const [pickerOpen, setPickerOpen] = useState(!initialBranch)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    if (!appRef.current) return undefined

    const scope = createScope({
      root: appRef.current,
      mediaQueries: { reduceMotion: '(prefers-reduced-motion: reduce)' },
    }).add((self) => {
      if (self.matches.reduceMotion) return
      animate('.hero__copy > *', {
        opacity: [0, 1],
        y: [26, 0],
        delay: stagger(90, { start: 140 }),
        duration: 850,
        ease: 'out(4)',
      })
      animate('.hero__visual img', {
        opacity: [0, 1],
        scale: [1.14, 1.06],
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

  const orderLabel = useMemo(
    () => selectedBranch ? `Pedir en ${selectedBranch.name}` : 'Elegir sucursal',
    [selectedBranch],
  )

  const chooseBranch = (branch) => {
    window.localStorage.setItem('cosa-nostra-branch', branch.id)
    setSelectedBranch(branch)
    setPickerOpen(false)
  }

  const handleOrder = (event) => {
    if (!selectedBranch) {
      event.preventDefault()
      setPickerOpen(true)
    }
  }

  return (
    <div ref={appRef} className="app-shell">
      <BranchPicker
        open={pickerOpen}
        onClose={() => setPickerOpen(false)}
        onChoose={chooseBranch}
        selectedId={selectedBranch?.id}
      />

      <header className="site-header">
        <a className="logo-link" href="#inicio" aria-label="Cosa Nostra, inicio">
          <BrandMark />
        </a>

        <nav className={menuOpen ? 'is-open' : ''} aria-label="Navegación principal">
          <a href="#sabores" onClick={() => setMenuOpen(false)}>Sabores</a>
          <a href="#nosotros" onClick={() => setMenuOpen(false)}>Nosotros</a>
          <a href="#sucursales" onClick={() => setMenuOpen(false)}>Sucursales</a>
        </nav>

        <div className="header-actions">
          <button className="branch-change" type="button" onClick={() => setPickerOpen(true)}>
            <LocationIcon />
            <span>{selectedBranch?.name ?? 'Elegí sucursal'}</span>
          </button>
          <a
            className="button button--small"
            href={selectedBranch?.orderUrl ?? '#sucursales'}
            target={selectedBranch ? '_blank' : undefined}
            rel="noreferrer"
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
            <span /><span />
          </button>
        </div>
      </header>

      <main>
        <section className="hero" id="inicio">
          <div className="hero__copy">
            <p className="eyebrow">Empanadas argentinas</p>
            <h1>Sabor genuino.<br /><em>Hechas a lo grande.</em></h1>
            <p className="hero__lead">
              Recetas bien nuestras, masa crocante y relleno de verdad. Elegí tu sucursal y pedí sin vueltas.
            </p>
            <div className="hero__actions">
              <a
                className="button button--primary"
                href={selectedBranch?.orderUrl ?? '#sucursales'}
                target={selectedBranch ? '_blank' : undefined}
                rel="noreferrer"
                onClick={handleOrder}
              >
                {orderLabel}<ArrowIcon />
              </a>
              <button className="text-button" type="button" onClick={() => setPickerOpen(true)}>
                Cambiar sucursal
              </button>
            </div>
          </div>

          <div className="hero__visual" aria-label="Empanadas Cosa Nostra">
            <img src="./assets/empanadas-marca.jpg" alt="Empanadas doradas Cosa Nostra" />
            <div className="hero__seal" aria-hidden="true">
              <span>Empanadas</span>
              <strong>CN</strong>
              <span>Hechas a lo grande</span>
            </div>
          </div>

          <div className="hero__ticker" aria-hidden="true">
            <span>Sabores argentinos</span><i>✦</i><span>Relleno de verdad</span><i>✦</i><span>Hechas a lo grande</span><i>✦</i>
          </div>
        </section>

        <section className="manifesto" id="nosotros">
          <p className="section-number">01 / NUESTRA FORMA</p>
          <div className="manifesto__content">
            <p className="eyebrow">No hacemos una más</p>
            <h2>La empanada que no necesita presentación.</h2>
            <p>
              Grande de verdad, con sabores que reconocés y una identidad nacida acá. Cada repulgue guarda una receta hecha para volver.
            </p>
          </div>
          <div className="manifesto__stamp" aria-hidden="true">¡A lo<br />grande!</div>
        </section>

        <section className="flavours" id="sabores">
          <div className="section-heading">
            <div>
              <p className="eyebrow eyebrow--light">Para todos los antojos</p>
              <h2>Encontrá tu próxima favorita.</h2>
            </div>
            <a
              className="text-link text-link--light"
              href={selectedBranch?.orderUrl ?? '#sucursales'}
              target={selectedBranch ? '_blank' : undefined}
              rel="noreferrer"
              onClick={handleOrder}
            >
              Ver menú completo <ArrowIcon />
            </a>
          </div>

          <div className="product-grid">
            {productGroups.map((group) => (
              <SpotlightCard className="product-card" key={group.number}>
                <span>{group.number}</span>
                <h3>{group.title}</h3>
                <p>{group.detail}</p>
                <a
                  href={selectedBranch?.orderUrl ?? '#sucursales'}
                  target={selectedBranch ? '_blank' : undefined}
                  rel="noreferrer"
                  onClick={handleOrder}
                  aria-label={`Ver ${group.title} en el menú`}
                >
                  <ArrowIcon />
                </a>
              </SpotlightCard>
            ))}
          </div>
        </section>

        <section className="locations" id="sucursales">
          <div className="locations__intro">
            <p className="section-number">02 / CERCA TUYO</p>
            <p className="eyebrow">Cuatro sucursales</p>
            <h2>Siempre hay una Cosa Nostra cerca.</h2>
            <p>Seleccioná el local desde donde querés pedir. Te llevamos a su menú y zona de entrega.</p>
          </div>

          <div className="location-list">
            {branches.map((branch, index) => (
              <article className={selectedBranch?.id === branch.id ? 'is-active' : ''} key={branch.id}>
                <button type="button" onClick={() => chooseBranch(branch)}>
                  <span className="location-list__number">0{index + 1}</span>
                  <span className="location-list__name">
                    <strong>{branch.name}</strong>
                    <small>{branch.area}</small>
                  </span>
                  <span className="location-list__status">
                    {selectedBranch?.id === branch.id ? 'Tu sucursal' : 'Elegir'}
                  </span>
                  <span className="location-list__arrow"><ArrowIcon /></span>
                </button>
              </article>
            ))}
          </div>
        </section>

        <section className="club-teaser">
          <div className="club-teaser__mark" aria-hidden="true">CN</div>
          <div>
            <p className="eyebrow">Próximamente</p>
            <h2>Club Nostra</h2>
          </div>
          <p>Beneficios, novedades y recompensas para quienes siempre vuelven.</p>
        </section>
      </main>

      <footer>
        <a className="logo-link" href="#inicio"><BrandMark /></a>
        <p>Empanadas argentinas. Hechas a lo grande.</p>
        <div>
          <a href="https://www.instagram.com/cosanostraempanadas/" target="_blank" rel="noreferrer">Instagram</a>
          <button type="button" onClick={() => setPickerOpen(true)}>Sucursales</button>
        </div>
        <small>© {new Date().getFullYear()} Cosa Nostra Empanadas</small>
      </footer>

      <a
        className="mobile-order"
        href={selectedBranch?.orderUrl ?? '#sucursales'}
        target={selectedBranch ? '_blank' : undefined}
        rel="noreferrer"
        onClick={handleOrder}
      >
        <span>{orderLabel}</span><ArrowIcon />
      </a>
    </div>
  )
}

export default App
