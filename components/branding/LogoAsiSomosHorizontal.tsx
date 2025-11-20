'use client'

interface LogoAsiSomosHorizontalProps {
  width?: number
  height?: number
  className?: string
  variant?: 'default' | 'inverse'
}

export default function LogoAsiSomosHorizontal({
  width = 200,
  height = 50,
  className = '',
  variant = 'default',
}: LogoAsiSomosHorizontalProps) {
  const isInverse = variant === 'inverse'
  const primaryColor = isInverse ? '#F7E8B5' : '#7452A8'
  const textColor = isInverse ? '#7452A8' : '#F7E8B5'
  
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 500 100"
      width={width}
      height={height}
      className={className}
      role="img"
      aria-label="ASÍ SOMOS Logo Horizontal"
      style={{ display: 'block', maxWidth: '100%', height: 'auto' }}
    >
      {/* Banner púrpura con esquinas redondeadas */}
      <rect x="0" y="15" width="450" height="70" rx="12" fill={primaryColor} />
      
      {/* Sombra sutil debajo del banner */}
      <rect x="3" y="18" width="450" height="70" rx="12" fill="#5A3F87" opacity="0.2" />
      
      {/* Texto "ASÍ SOMOS" */}
      <text
        x="225"
        y="65"
        fontFamily="system-ui, -apple-system, 'Segoe UI', 'Roboto', 'Helvetica Neue', Arial, sans-serif"
        fontSize="28"
        fontWeight="700"
        textAnchor="middle"
        fill={textColor}
        letterSpacing="2"
      >
        ASÍ SOMOS
      </text>
    </svg>
  )
}

