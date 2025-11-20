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
  const secondaryColor = isInverse ? '#7452A8' : '#F7E8B5'
  
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
      {/* Fondo secundario */}
      <rect width="600" height="120" fill={secondaryColor} />
      
      {/* Franja diagonal optimizada para formato horizontal */}
      <path
        d="M 0 30 Q 60 35 120 40 T 240 45 T 360 50 T 480 55 T 600 60 L 600 85 Q 540 80 480 75 T 360 70 T 240 65 T 120 60 T 0 55 Z"
        fill={primaryColor}
      />
      
      {/* Texto "ASÍ SOMOS" */}
      <text
        x="300"
        y="75"
        fontFamily="system-ui, -apple-system, 'Segoe UI', 'Roboto', 'Helvetica Neue', Arial, sans-serif"
        fontSize="36"
        fontWeight="700"
        textAnchor="middle"
        fill={primaryColor}
        letterSpacing="2"
      >
        ASÍ SOMOS
      </text>
    </svg>
  )
}

