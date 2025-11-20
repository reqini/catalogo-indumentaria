'use client'

import Image from 'next/image'

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
  
  return (
    <div 
      className={className}
      style={{ 
        width: `${width}px`, 
        height: `${height}px`,
        position: 'relative',
      }}
    >
      <Image
        src="/branding/asi-somos/logo-main.svg"
        alt="ASÍ SOMOS Logo"
        width={width}
        height={height}
        priority
        style={{
          filter: isInverse ? 'invert(1) brightness(0.9)' : 'none',
        }}
      />
    </div>
  )
}

