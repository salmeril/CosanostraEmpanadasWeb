/**
 * Integración preparada para Google Tag Manager o GA4.
 * Se activa únicamente cuando existe un ID real en las variables de entorno.
 */
export function initAnalytics() {
  const gtmId = import.meta.env.VITE_GTM_ID?.trim()
  const gaId = import.meta.env.VITE_GA_MEASUREMENT_ID?.trim()

  if (gtmId) {
    window.dataLayer = window.dataLayer || []
    window.dataLayer.push({
      'gtm.start': Date.now(),
      event: 'gtm.js',
    })

    const script = document.createElement('script')
    script.async = true
    script.src = `https://www.googletagmanager.com/gtm.js?id=${encodeURIComponent(gtmId)}`
    document.head.appendChild(script)
    return
  }

  if (gaId) {
    window.dataLayer = window.dataLayer || []
    window.gtag = function gtag() {
      window.dataLayer.push(arguments)
    }
    window.gtag('js', new Date())
    window.gtag('config', gaId, { anonymize_ip: true })

    const script = document.createElement('script')
    script.async = true
    script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(gaId)}`
    document.head.appendChild(script)
  }
}

export function trackEvent(eventName, parameters = {}) {
  if (typeof window === 'undefined') return

  if (typeof window.gtag === 'function') {
    window.gtag('event', eventName, parameters)
    return
  }

  if (Array.isArray(window.dataLayer)) {
    window.dataLayer.push({ event: eventName, ...parameters })
  }
}
