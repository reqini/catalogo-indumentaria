'use client'

interface LogoAsiSomosMainProps {
  width?: number
  height?: number
  className?: string
  variant?: 'default' | 'inverse'
}

export default function LogoAsiSomosMain({
  width = 200,
  height = 100,
  className = '',
  variant = 'default',
}: LogoAsiSomosMainProps) {
  const isInverse = variant === 'inverse'
  const primaryColor = isInverse ? '#F7E8B5' : '#7452A8'
  const textColor = isInverse ? '#7452A8' : '#F7E8B5'
  const bgColor = isInverse ? '#7452A8' : '#E8D5F0'
  const shadowColor = isInverse ? '#F7E8B5' : '#5A3F87'
  
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 400 200"
      width={width}
      height={height}
      className={className}
      role="img"
      aria-label="ASÍ SOMOS Logo"
    >
      <defs>
        {/* Sombra sutil para efecto 3D */}
        <filter id={`shadow-main-${variant}`} x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur in="SourceAlpha" stdDeviation="3"/>
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
      <rect width="400" height="200" fill={bgColor} />
      
      {/* Banner púrpura con esquinas redondeadas y efecto 3D */}
      <g transform="translate(50, 40) rotate(-2)">
        {/* Sombra del banner */}
        <rect x="5" y="5" width="300" height="120" rx="12" fill={shadowColor} opacity="0.3"/>
        
        {/* Banner principal */}
        <rect x="0" y="0" width="300" height="120" rx="12" fill={primaryColor} filter={`url(#shadow-main-${variant})`}/>
        
        {/* Texto "ASÍ SOMOS" con efecto embossed */}
        <text
          x="150"
          y="75"
          fontFamily="system-ui, -apple-system, 'Segoe UI', 'Roboto', 'Helvetica Neue', Arial, sans-serif"
          fontSize="36"
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

