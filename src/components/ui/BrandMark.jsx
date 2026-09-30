/**
 * Logo oficial de Cosa Nostra.
 * En espacios chicos se utiliza únicamente el monograma "N".
 */
export default function BrandMark({ compact = false, light = true }) {
  const file = compact
    ? '/assets/brand/cosa-nostra-monograma.png'
    : '/assets/brand/cosa-nostra-horizontal.png'

  return (
    <span
      className={`brand-mark ${compact ? 'brand-mark--compact' : ''} ${
        light ? 'brand-mark--light' : ''
      }`}
    >
      <img src={file} alt="Cosa Nostra Empanadas" />
    </span>
  )
}
