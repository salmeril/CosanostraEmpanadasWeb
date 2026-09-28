export default function BrandMark({ compact = false }) {
  return (
    <span className={`brand-mark ${compact ? 'brand-mark--compact' : ''}`}>
      <span className="brand-monogram" aria-hidden="true">
        CN
      </span>

      {!compact && (
        <span className="brand-name">
          Cosa Nostra
        </span>
      )}
    </span>
  )
}