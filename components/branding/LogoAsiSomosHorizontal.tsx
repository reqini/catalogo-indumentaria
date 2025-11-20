'use client'

interface LogoAsiSomosHorizontalProps {
  width?: number
  height?: number
  className?: string
  variant?: 'default' | 'inverse'
}

export default function LogoAsiSomosHorizontal({
  width = 300,
  height = 60,
  className = '',
  variant = 'default',
}: LogoAsiSomosHorizontalProps) {
  const isInverse = variant === 'inverse'
  const primaryColor = isInverse ? '#F7E8B5' : '#7452A8'
  const textColor = isInverse ? '#7452A8' : '#F7E8B5'
  const bgColor = isInverse ? '#7452A8' : '#E8D5F0'
  const shadowColor = isInverse ? '#F7E8B5' : '#5A3F87'
  
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 600 120"
      width={width}
      height={height}
      className={className}
      role="img"
      aria-label="ASÍ SOMOS Logo Horizontal"
    >
      <defs>
        {/* Sombra sutil para efecto 3D */}
        <filter id={`shadow-h-${variant}`} x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur in="SourceAlpha" stdDeviation="2"/>
          <feOffset dx="2" dy="2" result="offsetblur"/>
          <feComponentTransfer>
            <feFuncA type="linear" slope="0.3"/>
          </feComponentTransfer>
          <feMerge>
            <feMergeNode/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
      </defs>
      
      {/* Fondo lavanda claro */}
      <rect width="600" height="120" fill={bgColor} />
      
      {/* Banner púrpura horizontal con esquinas redondeadas y efecto 3D */}
      <g transform="translate(50, 20) rotate(-1)">
        {/* Sombra del banner */}
        <rect x="4" y="4" width="500" height="80" rx="10" fill={shadowColor} opacity="0.3"/>
        
        {/* Banner principal */}
        <rect x="0" y="0" width="500" height="80" rx="10" fill={primaryColor} filter={`url(#shadow-h-${variant})`}/>
        
        {/* Texto "ASÍ SOMOS" con efecto embossed */}
        <text
          x="250"
          y="50"
          fontFamily="system-ui, -apple-system, 'Segoe UI', 'Roboto', 'Helvetica Neue', Arial, sans-serif"
          fontSize="32"
          fontWeight="700"
          textAnchor="middle"
          fill={textColor}
          letterSpacing="3"
          style={{ textShadow: '0 1px 2px rgba(0,0,0,0.2)' }}
        >
          ASÍ SOMOS
        </text>
      </g>
    </svg>
  )
}

